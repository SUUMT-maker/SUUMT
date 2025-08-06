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
    // 요청 본문 파싱
    const body: RequestBody = await req.json();
    const { exerciseData, sessionId } = body;

    console.log('📊 받은 운동 데이터:', exerciseData);
    console.log('🆔 세션 ID:', sessionId);

    // 환경 변수에서 Gemini API 키 가져오기
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }

    // 운동 데이터 분석을 위한 프롬프트 생성
    const prompt = generatePrompt(exerciseData);
    console.log('🤖 Gemini 프롬프트:', prompt);

    // Gemini API 호출
    const geminiResponse = await callGeminiAPI(geminiApiKey, prompt);
    console.log('📦 Gemini 응답:', geminiResponse);

    // 응답 파싱 및 구조화
    const aiAdvice = parseResponse(geminiResponse, exerciseData);

    // 성공 응답
    return new Response(JSON.stringify({
      success: true,
      advice: aiAdvice,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ Edge Function 오류:', error);

    // 오류 시 기본 조언 반환
    const defaultAdvice = getDefaultAdvice(null);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      advice: defaultAdvice,
      sessionId: 'unknown',
      timestamp: new Date().toISOString(),
    }), {
      status: 200, // 클라이언트에서 처리할 수 있도록 200 반환
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// 🚀 The Breather 트레이닝 원칙 기반 프롬프트 생성
function generatePrompt(exerciseData: ExerciseData): string {
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
          maxOutputTokens: 256, // 비용 절감
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
