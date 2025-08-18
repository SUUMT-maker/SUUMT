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

// 🔥 CORS 헤더 상수로 정의
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

Deno.serve(async (req: Request) => {
  // 🔥 OPTIONS 요청 처리 (preflight)
  if (req.method === 'OPTIONS') {
    console.log('🔄 CORS preflight request received');
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  // 🔥 POST 요청만 허용
  if (req.method !== 'POST') {
    console.log(`❌ Method ${req.method} not allowed`);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Method not allowed' 
    }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  try {
    console.log('🧠 Motivation advice request started');
    
    const requestBody = await req.json();
    console.log('📊 받은 요청 데이터:', requestBody);

    const { userId, requestType } = requestBody;
    
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }

    if (requestType !== 'comprehensive_evaluation') {
      throw new Error('올바른 요청 타입이 아닙니다.');
    }

    console.log('📈 사용자 운동 데이터 분석 시작:', userId);

    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
    }
    
    const { createClient } = await import("npm:@supabase/supabase-js@2.39.8");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1단계: 최근 14일 운동 기록 조회
    console.log('📈 최근 14일 운동 기록 조회...');
    const userStats = await analyzeUserExerciseData(supabase, userId);
    console.log('📊 분석 완료:', userStats);

    // 2단계: 동기부여 AI 조언 생성
    console.log('🤖 동기부여 AI 조언 생성 시작...');
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.warn('⚠️ Gemini API 키가 없어 기본 조언 사용');
    }

    let motivationMessage;
    
    if (geminiApiKey) {
      try {
        const motivationPrompt = generateMotivationPrompt(userStats);
        const geminiResponse = await callGeminiAPI(geminiApiKey, motivationPrompt);
        motivationMessage = parseAIResponse(geminiResponse);
      } catch (aiError) {
        console.warn('⚠️ AI 조언 생성 실패, 기본 조언 사용:', aiError);
        motivationMessage = null;
      }
    }
    
    if (!motivationMessage) {
      motivationMessage = getDefaultMotivation(userStats);
    }

    console.log('🎯 생성된 동기부여 조언:', motivationMessage);



    // 4단계: 결과를 motivation_responses 테이블에 저장
    try {
      console.log('💾 동기부여 응답 저장 시작...');
      
      const motivationRecord = {
        user_id: userId,
        total_sessions: userStats.totalSessions,
        completion_rate: userStats.completionRate,
        consecutive_days: userStats.consecutiveDays,
        average_resistance: userStats.averageResistance,
        progress_trend: userStats.progressTrend,
        motivation_message: motivationMessage,

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
    } catch (saveError) {
      console.warn('⚠️ 저장 중 오류 (기능 계속):', saveError);
    }

    // 5단계: 클라이언트에 성공 응답
    const successResponse = {
      success: true,
      evaluation: {
        motivationMessage: motivationMessage,
        progressTrend: userStats.progressTrend
      },
      userStats: {
        totalSessions: userStats.totalSessions,
        consecutiveDays: userStats.consecutiveDays,
        completionRate: userStats.completionRate,
        averageResistance: userStats.averageResistance
      },
      timestamp: new Date().toISOString(),
    };
    
    console.log('✅ 성공 응답 전송:', successResponse);
    
    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: CORS_HEADERS,
    });

  } catch (error) {
    console.error('❌ Motivation Advice Error:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      evaluation: {
        motivationMessage: '현재 분석을 불러올 수 없습니다. 꾸준히 운동하며 데이터를 쌓아가요!',

        progressTrend: 'stable'
      },
    };
    
    console.log('❌ 에러 응답 전송:', errorResponse);
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});

// 📊 사용자 운동 데이터 분석
async function analyzeUserExerciseData(supabase: any, userId: string): Promise<UserStats> {
  try {
    // 최근 14일 운동 기록 조회 (30일 → 14일로 변경)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: sessions, error } = await supabase
      .from('exercise_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', fourteenDaysAgo.toISOString())
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

  return `당신은 숨트레이너 앱의 전문 호흡운동 코치입니다. 사용자의 최근 2주 운동 기록을 바탕으로 개인화된 동기부여 메시지를 작성해주세요.

📊 사용자 운동 데이터 (최근 14일):
- 총 운동 세션: ${totalSessions}회
- 전체 완료율: ${completionRate}%
- 연속 운동일: ${consecutiveDays}일
- 평균 저항 강도: ${averageResistance}
- 현재 트렌드: ${progressTrend}

🎯 4-5문장의 따뜻하고 개인화된 동기부여 메시지를 작성해주세요:

⚠️ 중요: 인사말이나 호칭 없이 바로 운동 분석 내용부터 시작해주세요.

1. **운동 패턴 인사이트**: 데이터를 바탕으로 사용자만의 운동 패턴이나 스타일을 발견해서 언급
   - 예: "꾸준함 vs 집중형", "도전적 vs 안정적", "요일별 패턴" 등

2. **습관/의식 변화**: 호흡운동을 통해 생겼을 법한 의식이나 습관 변화를 자연스럽게 언급
   - 예: "호흡에 더 의식적이 되셨을 거예요", "깊게 숨쉬는 습관이 생겼을 거예요"
   - ⚠️ 주의: 의학적 효과나 구체적 수치는 절대 언급하지 마세요

3. **개인적 격려**: 실패나 중단도 긍정적으로 재해석하며 따뜻하게 격려

4. **다음 스텝 제안**: 개인 패턴에 맞는 구체적이고 실현 가능한 제안

전문 코치의 따뜻한 분석 톤으로, 자연스러운 하나의 완성된 이야기로 작성해주세요.

📝 작성 형식 가이드:
- 2-3개의 짧은 단락으로 구성해주세요
- 각 단락은 2-3문장으로 제한해주세요  
- 단락 사이에는 빈 줄을 추가해주세요
- 긴 문장보다는 읽기 쉬운 짧은 문장을 선호합니다`;
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


