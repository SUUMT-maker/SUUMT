// @ts-nocheck
/* global Deno */
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ExerciseData {
  resistanceSettings: {
    inhale: number;
    exhale: number;
  };
  userFeedback: string | null;
  completedSets: number;
  completedBreaths: number;
  exerciseTime: string;
  isAborted: boolean;
  sessionId?: string;
  // motivation 요청 시 추가로 올 수 있는 필드들
  totalSessions?: number;
  completionRate?: number;
  consecutiveDays?: number;
  level?: string;
  trend?: string;
  recentSessions?: number;
  lastExercise?: string;
  requestType?: string; // 'motivation'
  analysisType?: string; // 'comprehensive_progress'
}

interface RequestBody {
  exerciseData: ExerciseData;
  sessionId: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface AIAdviceResponse {
  intensityAdvice: string;
  comprehensiveAdvice: string;
}

Deno.serve(async (req: Request) => {
  // CORS 헤더 설정
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { exerciseData } = await req.json();
    console.log('📊 운동 데이터:', exerciseData);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) throw new Error('API 키가 설정되지 않았습니다.');

    // 1️⃣ 요청 유형에 따라 프롬프트 생성 (세션/동기부여)
    const isMotivation = exerciseData.requestType === 'motivation';
    const prompt = isMotivation
      ? generateMotivationPrompt(exerciseData)
      : generateSessionPrompt(exerciseData);

    const geminiResponse = await callGeminiAPI(geminiApiKey, prompt);

    // 2️⃣ 응답 파싱 (motivation은 일반 텍스트를 종합 조언으로 사용)
    const aiAdvice = isMotivation
      ? {
          intensityAdvice: '',
          comprehensiveAdvice:
            parsePlainText(geminiResponse) ?? getDefaultAdvice(exerciseData).comprehensiveAdvice,
        }
      : parseResponse(geminiResponse, exerciseData);

    // 2️⃣ Supabase 저장
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const { createClient } = await import("npm:@supabase/supabase-js@2.39.8");
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const { data: inserted, error } = await supabase
      .from('ai_advice')
      .insert([{
        session_id: exerciseData.sessionId || null,
        intensity_advice: aiAdvice.intensityAdvice,
        comprehensive_advice: aiAdvice.comprehensiveAdvice,
        gemini_raw_response: geminiResponse
      }])
      .select('id, session_id, created_at');

    if (error) console.error('❌ ai_advice insert error:', error);

    // 3️⃣ 하루 요약(summary) 생성
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyAdvices } = await supabase
      .from('ai_advice')
      .select('comprehensive_advice')
      .eq('session_id', exerciseData.sessionId)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    if (dailyAdvices && dailyAdvices.length > 1) {
      const summaryPrompt = generateDailySummaryPrompt(dailyAdvices);
      const summaryResponse = await callGeminiAPI(geminiApiKey, summaryPrompt);
      const summaryText = parseSummary(summaryResponse);

      if (summaryText) {
        // 하루 대표 세션(첫 번째 insert)에 summary 업데이트
        const latestId = inserted?.[0]?.id;
        if (latestId) {
          await supabase
            .from('ai_advice')
            .update({ summary: summaryText })
            .eq('id', latestId);
          console.log('✅ Daily summary updated:', summaryText);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      advice: aiAdvice,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ Edge Function Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      advice: getDefaultAdvice(null),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// ------------------------
// Prompt Generators
// ------------------------

function generateSessionPrompt(exerciseData: ExerciseData): string {
  const { resistanceSettings, userFeedback, completedSets, completedBreaths, exerciseTime, isAborted } = exerciseData;

  return `
호흡 트레이너 AI 코치입니다. 사용자의 오늘 세션 요약:

{
  "inhale": ${resistanceSettings.inhale},
  "exhale": ${resistanceSettings.exhale},
  "sets": ${completedSets},
  "breaths": ${completedBreaths},
  "duration": "${exerciseTime}",
  "aborted": ${isAborted},
  "feedback": "${userFeedback || 'none'}"
}

규칙:
1. 강도 조절(Intensity Advice)
   - The Breather "IN THE ZONE"(5~7단계) 기준
   - 편했음 & 완주 → 1단계 상향
   - 적당함 & 완주 → 유지
   - 힘듦 or 중단 → 1단계 하향
2. 종합 평가(Comprehensive Advice)
   - 감정적 격려 + 장기 목표 강조
   - 최대 100자, 친근하고 동기부여 톤

출력 형식:
###INTENSITY### 강도조절 한 문장 ###INTENSITY###
###COMPREHENSIVE### 종합격려 한 문장 ###COMPREHENSIVE###
`;
}

// 🚀 동기부여(기록 탭)용 개인화 프롬프트 생성
function generateMotivationPrompt(exerciseData: ExerciseData): string {
  const totalSessions = exerciseData.totalSessions ?? 0;
  const completionRate = exerciseData.completionRate ?? 0;
  const consecutiveDays = exerciseData.consecutiveDays ?? 0;
  const avgInhale = exerciseData.resistanceSettings?.inhale ?? 1;
  const avgExhale = exerciseData.resistanceSettings?.exhale ?? 1;
  const level = exerciseData.level ?? 'beginner';
  const trend = exerciseData.trend ?? 'stable';
  const recentSessions = exerciseData.recentSessions ?? 0;
  const totalBreaths = exerciseData.completedBreaths ?? 0;

  const motivationPrompt = `
당신은 숨트 호흡운동기구 전용 AI 트레이너입니다. 사용자의 운동 데이터를 분석하여 개인화된 동기부여 메시지를 제공해주세요.

## 사용자 운동 데이터:
- 총 운동 세션: ${totalSessions}회
- 완료율: ${completionRate}%
- 연속 운동일: ${consecutiveDays}일
- 평균 저항 강도: ${avgInhale}/${avgExhale}
- 사용자 레벨: ${level}
- 최근 트렌드: ${trend}
- 최근 7일 세션: ${recentSessions}회
- 총 완료 호흡: ${totalBreaths}회

## 응답 가이드라인:
1. **개인화**: 사용자의 구체적인 수치와 성과를 언급하세요
2. **동기부여**: 긍정적이고 격려하는 톤을 유지하세요
3. **실용적 조언**: 다음 단계나 개선점을 구체적으로 제시하세요
4. **감정적 연결**: 사용자의 노력을 인정하고 성취감을 느끼게 하세요
5. **길이**: 2-3문장으로 간결하면서도 의미있게 작성하세요

## 레벨별 맞춤 메시지:
- **초급자(beginner)**: 격려와 기초 습관 형성에 집중
- **중급자(intermediate)**: 성장 인정과 다음 단계 도전 제안
- **고급자(advanced)**: 전문성 인정과 새로운 목표 설정
- **전문가(expert)**: 리더십과 다른 사람들에게 영감을 주는 역할 강조

## 트렌드별 접근:
- **excellent_progress**: 뛰어난 성과 축하와 지속 격려
- **good_progress**: 꾸준한 발전이 눈에 보여요. 좋은 페이스를 유지하고 있어요!
- **stable**: 안정성 칭찬과 새로운 자극 제안
- **needs_encouragement**: 따뜻한 위로와 재시작 격려

한국어로 친근하고 따뜻한 톤으로 응답해주세요. 이모지를 적절히 사용하여 감정을 표현하세요.
`;

  return motivationPrompt;
}


function generateDailySummaryPrompt(dailyAdvices: Array<{comprehensive_advice: string}>): string {
  const list = dailyAdvices.map((a, i) => `${i+1}. ${a.comprehensive_advice}`).join('\n');
  return `
오늘 하루 호흡 트레이닝 AI 조언들:

${list}

이 조언들을 하루 요약으로 1~2문장으로 통합해 주세요.
톤: 친근하고 동기부여.
출력: 하루 요약 1문장
`;
}

// 🎯 최적화된 Gemini API 호출 함수
async function callGeminiAPI(apiKey: string, prompt: string): Promise<GeminiResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      }),
    },
  );
  if (!response.ok) throw new Error(`API 오류: ${response.status}`);
  return await response.json();
}

// 🔄 간소화된 응답 파싱 함수
function parseResponse(geminiResponse: GeminiResponse, exerciseData: ExerciseData): AIAdviceResponse {
  try {
    const responseText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!responseText) {
      throw new Error('Gemini API에서 빈 응답을 받았습니다.');
    }

    console.log('✨ Gemini 응답 텍스트:', responseText);
    
    // 태그 파싱
    const intensityMatch = responseText.match(/###INTENSITY###\s*(.*?)\s*###INTENSITY###/s);
    const comprehensiveMatch = responseText.match(/###COMPREHENSIVE###\s*(.*?)\s*###COMPREHENSIVE###/s);

    if (intensityMatch && comprehensiveMatch) {
      const intensityAdvice = intensityMatch[1].trim();
      const comprehensiveAdvice = comprehensiveMatch[1].trim();
      
      console.log('✅ 태그 파싱 성공');
      console.log('💭 파싱된 강도 분석:', intensityAdvice);
      console.log('🌟 파싱된 종합 조언:', comprehensiveAdvice);
      
      return {
        intensityAdvice,
        comprehensiveAdvice,
      };
    }
    
    // 태그 파싱 실패 시 기본값 반환
    console.log('⚠️ 태그 파싱 실패, 기본값 사용');
    return getDefaultAdvice(exerciseData);

  } catch (error) {
    console.error('응답 파싱 오류:', error);
    return getDefaultAdvice(exerciseData);
  }
}

// 📄 일반 텍스트 파싱 (motivation용)
function parsePlainText(geminiResponse: GeminiResponse): string | null {
  const text = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  return text || null;
}

function parseSummary(geminiResponse: GeminiResponse): string | null {
  return geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

// 🔄 The Breather 원칙 기반 기본 조언 함수
function getDefaultAdvice(exerciseData: ExerciseData | null): AIAdviceResponse {
  if (!exerciseData) {
    return {
      intensityAdvice: "오늘도 숨트 트레이닝에 참여해주셔서 감사합니다! 컨디션에 맞게 강도를 조절하며 꾸준히 운동해보세요.",
      comprehensiveAdvice: "꾸준한 호흡 트레이닝으로 건강한 습관을 만들고 계시네요! 매일 조금씩이라도 도전하는 것이 중요합니다.",
    };
  }

  const { resistanceSettings, userFeedback, isAborted, completedSets } = exerciseData;
  
  // The Breather "IN THE ZONE" 원칙 적용
  let intensityAdvice = "";
  
  if (!userFeedback) {
    intensityAdvice = isAborted 
      ? "중단하셨지만 괜찮아요! 다음엔 피드백을 남겨주시면 더 적절한 강도로 조절해드릴게요."
      : "다음 트레이닝에서는 운동 후 피드백을 남겨주시면 더 정확한 강도 조절 분석을 드릴 수 있어요!";
  } else if (!isAborted) {
    // 완주한 경우 Progressive Overload 적용
    switch (userFeedback) {
      case 'easy':
        intensityAdvice = "아직 여유가 있으시네요! 다음에는 들숨과 날숨을 각각 1단계씩 올려보세요. 점진적으로 올리는 게 안전해요.";
        break;
      case 'perfect':
        intensityAdvice = "완벽한 강도예요! 현재 설정을 2주 정도 더 유지하시다가 익숙해지면 그때 한 단계씩 도전해봐요.";
        break;
      case 'hard':
        intensityAdvice = "무리하지 마세요! 다음에는 들숨과 날숨을 각각 1단계씩 낮춰서 안전하게 운동해봐요.";
        break;
      default:
        intensityAdvice = "현재 강도가 적당한 것 같아요! 꾸준히 하시면 더 큰 발전을 경험하실 거예요.";
    }
  } else {
    // 중단한 경우 안전 우선
    switch (userFeedback) {
      case 'easy':
        intensityAdvice = "중단하셨지만 여유가 있으셨다니 다행이에요! 다음에는 현재 강도를 유지하시고 완주에 집중해보세요.";
        break;
      case 'perfect':
        intensityAdvice = "중단하셨지만 적당한 강도였다니 좋아요! 다음에는 같은 강도로 완주에 도전해보세요.";
        break;
      case 'hard':
        intensityAdvice = "힘들어서 중단하셨군요! 다음에는 들숨과 날숨을 각각 1단계씩 낮춰서 안전하게 완주해보세요.";
        break;
      default:
        intensityAdvice = "중단하셨지만 괜찮아요! 다음에는 더 낮은 강도로 시작해보세요.";
    }
  }

  // 종합 격려 메시지
  let comprehensiveAdvice = "";
  if (isAborted) {
    if (completedSets === 0) {
      comprehensiveAdvice = "첫 도전이었는데 중단하셨군요. 괜찮아요! 호흡 운동은 익숙해지는데 시간이 걸려요. 다음에는 더 짧은 시간으로 시작해보세요.";
    } else if (completedSets === 1) {
      comprehensiveAdvice = "1세트를 완료하셨네요! 중단하셨지만 도전한 것 자체가 대단해요. 다음에는 2세트 완주를 목표로 해보세요.";
    } else {
      comprehensiveAdvice = "거의 완주하셨네요! 중단하셨지만 도전한 것이 큰 성과예요. 다음에는 완주에 도전해보세요!";
    }
  } else {
    if (completedSets === 2) {
      comprehensiveAdvice = "완벽한 완주를 축하드려요! 꾸준히 하시면 더 큰 발전을 경험하실 거예요!";
    } else if (completedSets === 1) {
      comprehensiveAdvice = "1세트를 완료하셨네요! 다음에는 2세트 완주에 도전해보세요!";
    } else {
      comprehensiveAdvice = "트레이닝을 완료하셨네요! 꾸준히 하시면 더 큰 발전을 경험하실 거예요!";
    }
  }

  return {
    intensityAdvice,
    comprehensiveAdvice,
  };
}
