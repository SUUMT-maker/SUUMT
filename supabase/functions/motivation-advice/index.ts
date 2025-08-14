// @ts-nocheck
/* global Deno */
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

interface RequestBody {
  userId: string;
  requestType: string;
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

interface UserStats {
  totalSessions: number;
  completionRate: number;
  consecutiveDays: number;
  averageResistance: number;
  progressTrend: string;
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
    const requestBody = await req.json();
    console.log('🧠 동기부여 요청 데이터:', requestBody);

    const { userId, requestType } = requestBody;
    
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }

    if (requestType !== 'comprehensive_evaluation') {
      throw new Error('올바른 요청 타입이 아닙니다.');
    }

    console.log('📊 사용자 운동 데이터 분석 시작:', userId);

    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const { createClient } = await import("npm:@supabase/supabase-js@2.39.8");
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // 1단계: 최근 30일 운동 기록 조회
    console.log('📈 최근 30일 운동 기록 조회...');
    const userStats = await analyzeUserExerciseData(supabase, userId);
    console.log('📊 분석 완료:', userStats);

    // 2단계: 동기부여 AI 조언 생성
    console.log('🤖 동기부여 AI 조언 생성 시작...');
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const motivationPrompt = generateMotivationPrompt(userStats);
    const geminiResponse = await callGeminiAPI(geminiApiKey, motivationPrompt);
    const motivationMessage = parseAIResponse(geminiResponse) || getDefaultMotivation(userStats);

    console.log('🎯 생성된 동기부여 조언:', motivationMessage);

    // 3단계: 인사이트 생성
    const insight = generateDailyLifeInsight(userStats);

    // 4단계: 결과를 motivation_responses 테이블에 저장
    console.log('💾 동기부여 응답 저장 시작...');
    
    const motivationRecord = {
      user_id: userId,
      total_sessions: userStats.totalSessions,
      completion_rate: userStats.completionRate,
      consecutive_days: userStats.consecutiveDays,
      average_resistance: userStats.averageResistance,
      progress_trend: userStats.progressTrend,
      motivation_message: motivationMessage,
      lifestyle_insights: insight,
      ai_source: 'gemini',
      request_type: 'comprehensive_evaluation',
    };

    const { data: savedResponse, error: saveError } = await supabase
      .from('motivation_responses')
      .insert(motivationRecord)
      .select('id, created_at')
      .single();

    if (saveError) {
      console.warn('⚠️ 동기부여 응답 저장 실패 (기능에는 영향 없음):', saveError);
    } else {
      console.log('✅ 동기부여 응답 저장 완료:', savedResponse);
    }

    // 5단계: 클라이언트에 응답
    return new Response(JSON.stringify({
      success: true,
      evaluation: {
        motivationMessage: motivationMessage,
        insight: insight,
        progressTrend: userStats.progressTrend
      },
      userStats: {
        totalSessions: userStats.totalSessions,
        consecutiveDays: userStats.consecutiveDays,
        completionRate: userStats.completionRate,
        averageResistance: userStats.averageResistance
      },
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ Motivation Advice Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      evaluation: {
        motivationMessage: '현재 분석을 불러올 수 없습니다. 꾸준히 운동하며 데이터를 쌓아가요!',
        insight: '매일 조금씩 발전하는 모습이 보여요. 자신감을 가지세요!',
        progressTrend: 'stable'
      },
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// 📊 사용자 운동 데이터 분석
async function analyzeUserExerciseData(supabase: any, userId: string): Promise<UserStats> {
  try {
    // 최근 30일 운동 기록 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessions, error } = await supabase
      .from('exercise_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('운동 기록 조회 오류:', error);
      return getDefaultUserStats();
    }

    if (!sessions || sessions.length === 0) {
      console.log('운동 기록 없음 - 신규 사용자');
      return getDefaultUserStats();
    }

    // 기본 통계 계산
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => !s.is_aborted).length;
    const completionRate = Math.round((completedSessions / totalSessions) * 100);

    // 연속 운동일 계산
    const consecutiveDays = calculateConsecutiveDays(sessions);

    // 평균 저항 강도
    const avgInhale = sessions.reduce((sum, s) => sum + (s.inhale_resistance || 1), 0) / sessions.length;
    const avgExhale = sessions.reduce((sum, s) => sum + (s.exhale_resistance || 1), 0) / sessions.length;
    const averageResistance = Math.round(((avgInhale + avgExhale) / 2) * 10) / 10;

    // 진행 트렌드 분석
    const progressTrend = analyzeProgressTrend(sessions);

    return {
      totalSessions,
      completionRate,
      consecutiveDays,
      averageResistance,
      progressTrend,
    };

  } catch (error) {
    console.error('운동 데이터 분석 오류:', error);
    return getDefaultUserStats();
  }
}

// 연속 운동일 계산
function calculateConsecutiveDays(sessions: any[]): number {
  const today = new Date();
  const uniqueDates = [...new Set(sessions.map(s => s.created_at.split('T')[0]))].sort().reverse();
  
  let consecutive = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (uniqueDates.includes(checkDateStr)) {
      consecutive++;
    } else {
      break;
    }
  }
  
  return consecutive;
}

// 진행 트렌드 분석
function analyzeProgressTrend(sessions: any[]): string {
  if (sessions.length < 3) return 'stable';
  
  const recent = sessions.slice(0, 7);
  const completionRate = recent.filter(s => !s.is_aborted).length / recent.length;
  
  if (completionRate >= 0.8) return 'improving';
  if (completionRate >= 0.6) return 'stable';
  return 'needs_encouragement';
}

// 기본 사용자 통계 (신규 사용자)
function getDefaultUserStats(): UserStats {
  return {
    totalSessions: 0,
    completionRate: 0,
    consecutiveDays: 0,
    averageResistance: 1.0,
    progressTrend: 'stable',
  };
}

// 🤖 동기부여 프롬프트 생성
function generateMotivationPrompt(userStats: UserStats): string {
  const { totalSessions, completionRate, consecutiveDays, averageResistance, progressTrend } = userStats;

  return `당신은 숨트레이너 앱의 전문 호흡운동 코치입니다. 사용자의 운동 기록을 종합 분석하여 개인화된 동기부여 메시지를 제공해주세요.

## 📊 사용자 운동 통계 (최근 30일):
- 총 운동 세션: ${totalSessions}회
- 전체 완료율: ${completionRate}%
- 연속 운동일: ${consecutiveDays}일
- 평균 저항 강도: ${averageResistance}
- 현재 트렌드: ${progressTrend}

## 🎯 동기부여 메시지 요청:
다음을 포함한 2-3문장의 따뜻하고 격려적인 메시지를 작성해주세요:

1. **운동 성과 인정**: 
   - ${totalSessions}회 운동과 ${consecutiveDays}일 연속 기록의 의미
   - ${completionRate}% 완료율에 대한 격려

2. **실생활 변화 연결**: 
   - 호흡근육 강화로 인한 일상생활 개선점
   - 계단 오르기, 말하기, 수면 등 구체적 변화

3. **미래 전망 제시**: 
   - 현재 ${progressTrend} 트렌드를 바탕으로 한 긍정적 전망
   - 지속 가능한 다음 목표 제시

친근하고 전문적인 톤으로, 사용자의 개별 여정을 인정하며 구체적이고 실용적인 조언을 작성해주세요.`;
}

// 🤖 Gemini API 호출
async function callGeminiAPI(apiKey: string, prompt: string): Promise<GeminiResponse> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.9,
          maxOutputTokens: 400,
        },
      }),
    },
  );
  
  if (!response.ok) {
    throw new Error(`Gemini API 오류: ${response.status}`);
  }
  
  return await response.json();
}

// 🎯 AI 응답 파싱
function parseAIResponse(geminiResponse: GeminiResponse): string | null {
  try {
    const text = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (error) {
    console.error('AI 응답 파싱 오류:', error);
    return null;
  }
}

// 🔄 기본 동기부여 조언 (AI 실패 시)
function getDefaultMotivation(userStats: UserStats): string {
  const { totalSessions, consecutiveDays, progressTrend } = userStats;

  if (totalSessions === 0) {
    return "첫 번째 호흡 트레이닝을 시작해보세요! 매일 조금씩 꾸준히 하는 것이 가장 큰 변화를 만들어요.";
  }

  if (consecutiveDays >= 14) {
    return `${consecutiveDays}일 연속! 정말 대단해요. 이제 다른 사람들에게도 영감을 주는 존재가 되었어요. ${totalSessions}번의 트레이닝으로 호흡근이 한층 강해졌을 거예요!`;
  } else if (consecutiveDays >= 7) {
    return `일주일 연속! 이미 상위 10% 사용자예요. ${totalSessions}번의 운동으로 계단 오를 때 숨이 덜 차고, 깊은 호흡이 자연스러워졌을 거예요.`;
  } else if (totalSessions >= 10) {
    return `${totalSessions}번째 운동! 호흡근이 확실히 강해졌을 거예요. ${progressTrend === 'improving' ? '최근 성과가 정말 뛰어나요!' : '꾸준히 하시는 모습이 보기 좋아요!'} 계속 화이팅!`;
  }

  return `${totalSessions}번의 트레이닝으로 조금씩 변화가 쌓이고 있어요. 포기하지 않는 의지력이 정말 대단합니다!`;
}

// 💡 일상생활 연결 인사이트 생성
function generateDailyLifeInsight(userStats: UserStats): string {
  const { consecutiveDays, totalSessions, completionRate } = userStats;

  // 연속일 기반 일상생활 변화 메시지
  if (consecutiveDays >= 21) {
    return "3주 연속! 지하철 계단도 숨차지 않고, 깊은 잠을 자고 계실 거예요 😴";
  } else if (consecutiveDays >= 14) {
    return "2주 연속! 말할 때 숨이 덜 차고, 스트레스 받을 때도 깊게 숨쉬게 됐죠? 🗣️";
  } else if (consecutiveDays >= 10) {
    return "10일 연속! 아침 일어나기가 한결 수월하고, 하루 종일 활력이 느껴져요 ☀️";
  } else if (consecutiveDays >= 7) {
    return "일주일 연속! 계단 오를 때 예전보다 덜 힘들고, 숨이 깊어졌어요 🚶‍♀️";
  } else if (consecutiveDays >= 5) {
    return "5일 연속! 운동할 때나 빨리 걸을 때 지구력이 늘어난 게 느껴져요 💪";
  } else if (consecutiveDays >= 3) {
    return "3일 연속! 깊게 숨쉬는 습관이 몸에 배기 시작했어요 🫁";
  } else if (totalSessions >= 15) {
    return "꾸준한 노력! 폐활량이 늘어나고 호흡이 깊어졌을 거예요 📈";
  } else if (totalSessions >= 5) {
    return "좋은 시작! 호흡근육이 조금씩 강해지고 있어요 💨";
  } else {
    return "연속 도전 시작! 조금씩 호흡이 편안해질 거예요 🌱";
  }
}
