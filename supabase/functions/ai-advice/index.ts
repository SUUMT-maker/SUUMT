// @ts-nocheck
/* global Deno */
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

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
  userId: string;
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

interface UserHistory {
  pastSessions: number;
  pastCompletionRate: number;
  consecutiveDays: number;
  averageResistance: number;
  recentTrend: string;
}

interface CombinedStats {
  totalSessions: number;
  completionRate: number;
  consecutiveDays: number;
  averageResistance: number;
  recentTrend: string;
  progressDirection: string;
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
    console.log('📊 받은 요청 데이터:', requestBody);

    const { exerciseData, sessionId } = requestBody;
    
    if (!exerciseData || !exerciseData.userId) {
      throw new Error('사용자 ID가 필요합니다.');
    }

    console.log('🏃‍♀️ 현재 세션 데이터:', exerciseData);

    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const { createClient } = await import("npm:@supabase/supabase-js@2.39.8");
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // 📊 1단계: 과거 운동 기록 조회 (현재 세션 제외)
    console.log('📈 과거 운동 기록 조회 시작...');
    const pastHistory = await getPastExerciseHistory(supabase, exerciseData.userId);
    console.log('📊 과거 기록:', pastHistory);

    // 🔄 2단계: 과거 + 현재 세션 조합해서 통계 계산
    console.log('🔄 과거 + 현재 세션 조합 중...');
    const combinedStats = combineHistoryWithCurrentSession(pastHistory, exerciseData);
    console.log('📈 조합된 통계:', combinedStats);

    // 🤖 3단계: 조합된 데이터로 개인화된 AI 조언 생성
    console.log('🤖 개인화된 AI 조언 생성 시작...');
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }

    const personalizedPrompt = generateCombinedPrompt(exerciseData, combinedStats);
    const geminiResponse = await callGeminiAPI(geminiApiKey, personalizedPrompt);
    const aiAdvice = parseAIResponse(geminiResponse) || getDefaultAdvice(exerciseData, combinedStats);

    console.log('🎯 생성된 AI 조언:', aiAdvice);

    // 💾 4단계: 현재 세션을 exercise_sessions에 저장
    console.log('💾 현재 세션 저장 시작...');
    
    const sessionData = {
      user_id: exerciseData.userId,
      exercise_date: new Date().toISOString().split('T')[0],
      exercise_time: exerciseData.exerciseTime || '0:00',
      completed_sets: exerciseData.completedSets || 0,
      completed_breaths: exerciseData.completedBreaths || 0,
      total_target_breaths: 20,
      is_aborted: exerciseData.isAborted || false,
      user_feedback: exerciseData.userFeedback || null,
      inhale_resistance: exerciseData.resistanceSettings?.inhale || 1,
      exhale_resistance: exerciseData.resistanceSettings?.exhale || 1,
    };

    const { data: savedSession, error: sessionError } = await supabase
      .from('exercise_sessions')
      .insert(sessionData)
      .select('id, created_at')
      .single();

    if (sessionError) {
      console.warn('⚠️ 세션 저장 실패 (AI 조언에는 영향 없음):', sessionError);
    } else {
      console.log('✅ 세션 저장 완료:', savedSession);
      
      // 📝 5단계: AI 조언 저장 (선택사항)
      try {
        console.log('💾 AI 조언 저장 시작...');
        
        const adviceRecord = {
          session_id: savedSession?.id || null,
          intensity_advice: '',               // 빈 문자열 (NOT NULL 제약조건 해결)
          comprehensive_advice: aiAdvice,     // AI 응답을 여기에 저장 (프론트엔드에서 사용)
          gemini_raw_response: null,          // 사용하지 않음
        };

        const { data: savedAdvice, error: adviceError } = await supabase
          .from('ai_advice')
          .insert(adviceRecord)
          .select('id, created_at')
          .single();

        if (adviceError) {
          console.warn('⚠️ AI 조언 저장 실패 (기능에는 영향 없음):', adviceError);
          console.warn('세션 ID:', savedSession?.id);
          console.warn('AI 조언 내용:', aiAdvice);
        } else {
          console.log('✅ AI 조언 저장 완료:', savedAdvice);
        }
      } catch (saveError) {
        console.warn('⚠️ AI 조언 저장 중 오류 (기능 계속):', saveError);
      }
    }

    // 🚀 6단계: 클라이언트에 응답
    return new Response(JSON.stringify({
      success: true,
      advice: {
        intensityAdvice: '',
        comprehensiveAdvice: aiAdvice
      },
      sessionId: savedSession?.id || sessionId,
      userStats: combinedStats,
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
      advice: {
        intensityAdvice: '',
        comprehensiveAdvice: '운동을 완료하셨습니다! 꾸준한 노력이 성과로 이어질 거예요.'
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

// 📊 과거 운동 기록 조회 (현재 세션 제외)
async function getPastExerciseHistory(supabase: any, userId: string): Promise<UserHistory> {
  try {
    // 최근 7일 운동 기록 조회 (30일 → 7일로 변경)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: sessions, error } = await supabase
      .from('exercise_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('과거 기록 조회 오류:', error);
      return getDefaultPastHistory();
    }

    if (!sessions || sessions.length === 0) {
      console.log('과거 기록 없음 - 신규 사용자');
      return getDefaultPastHistory();
    }

    // 과거 기록 통계 계산
    const pastSessions = sessions.length;
    const completedSessions = sessions.filter(s => !s.is_aborted).length;
    const pastCompletionRate = Math.round((completedSessions / pastSessions) * 100);

    // 연속 운동일 계산 (어제까지)
    const consecutiveDays = calculateConsecutiveDaysUntilYesterday(sessions);

    // 평균 저항 강도
    const avgInhale = sessions.reduce((sum, s) => sum + s.inhale_resistance, 0) / sessions.length;
    const avgExhale = sessions.reduce((sum, s) => sum + s.exhale_resistance, 0) / sessions.length;
    const averageResistance = (avgInhale + avgExhale) / 2;

    // 최근 트렌드
    const recentTrend = analyzeRecentTrend(sessions);

    return {
      pastSessions,
      pastCompletionRate,
      consecutiveDays,
      averageResistance: Math.round(averageResistance * 10) / 10,
      recentTrend,
    };

  } catch (error) {
    console.error('과거 기록 분석 오류:', error);
    return getDefaultPastHistory();
  }
}

// 🔄 과거 + 현재 세션 조합
function combineHistoryWithCurrentSession(pastHistory: UserHistory, currentSession: ExerciseData): CombinedStats {
  const currentResistance = (currentSession.resistanceSettings.inhale + currentSession.resistanceSettings.exhale) / 2;
  
  // 현재 세션을 포함한 전체 통계 계산
  const totalSessions = pastHistory.pastSessions + 1; // 현재 세션 포함
  
  // 완료율 재계산 (현재 세션 포함)
  const pastCompletedSessions = Math.round(pastHistory.pastSessions * pastHistory.pastCompletionRate / 100);
  const currentCompleted = currentSession.isAborted ? 0 : 1;
  const totalCompletedSessions = pastCompletedSessions + currentCompleted;
  const completionRate = Math.round((totalCompletedSessions / totalSessions) * 100);

  // 연속일 업데이트 (오늘 운동 완료 시 +1)
  const consecutiveDays = currentSession.isAborted 
    ? 0  // 중단 시 연속일 리셋
    : pastHistory.consecutiveDays + 1; // 완료 시 +1

  // 평균 저항 재계산 (현재 세션 포함)
  const totalResistance = (pastHistory.averageResistance * pastHistory.pastSessions) + currentResistance;
  const averageResistance = Math.round((totalResistance / totalSessions) * 10) / 10;

  // 진전 방향 분석
  const progressDirection = analyzeProgressDirection(pastHistory, currentSession);

  return {
    totalSessions,
    completionRate,
    consecutiveDays,
    averageResistance,
    recentTrend: pastHistory.recentTrend,
    progressDirection,
  };
}

// 📈 진전 방향 분석
function analyzeProgressDirection(pastHistory: UserHistory, currentSession: ExerciseData): string {
  const currentResistance = (currentSession.resistanceSettings.inhale + currentSession.resistanceSettings.exhale) / 2;
  
  if (pastHistory.pastSessions === 0) {
    return 'first_session'; // 첫 세션
  }
  
  if (currentSession.isAborted) {
    return 'needs_adjustment'; // 중단됨 - 조정 필요
  }
  
  if (currentResistance > pastHistory.averageResistance) {
    return 'challenging_up'; // 강도 증가 도전
  } else if (currentResistance < pastHistory.averageResistance) {
    return 'stepped_down'; // 강도 감소
  } else {
    return 'maintaining'; // 현재 강도 유지
  }
}

// 어제까지의 연속일 계산
function calculateConsecutiveDaysUntilYesterday(sessions: any[]): number {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const uniqueDates = [...new Set(sessions.map(s => s.created_at.split('T')[0]))].sort().reverse();
  
  let consecutive = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    const checkDate = new Date(yesterday);
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

// 최근 트렌드 분석
function analyzeRecentTrend(sessions: any[]): string {
  if (sessions.length < 3) return 'stable';
  
  const recent = sessions.slice(0, 7);
  const completionRate = recent.filter(s => !s.is_aborted).length / recent.length;
  
  if (completionRate >= 0.9) return 'excellent';
  if (completionRate >= 0.7) return 'good';
  if (completionRate >= 0.5) return 'stable';
  return 'needs_encouragement';
}

// 기본 과거 기록 (신규 사용자)
function getDefaultPastHistory(): UserHistory {
  return {
    pastSessions: 0,
    pastCompletionRate: 0,
    consecutiveDays: 0,
    averageResistance: 1.0,
    recentTrend: 'stable',
  };
}

// 🔥 추가할 함수 2: 최근 패턴 컨텍스트 생성
function generateRecentPatternContext(combinedStats: CombinedStats): string {
  const { totalSessions, consecutiveDays } = combinedStats;
  
  if (totalSessions === 1) {
    return "첫 번째 운동입니다";
  }
  
  if (consecutiveDays >= 2) {
    return "어제도 완료하셨네요";
  }
  
  if (totalSessions >= 3) {
    return "최근 꾸준히 하고 계시네요";
  }
  
  return "며칠만에 다시 하시는군요";
}

// 🔄 피드백 한국어 변환
function translateFeedbackToKorean(feedback: string | null): string {
  if (!feedback) return '미제공';
  
  const feedbackMap: { [key: string]: string } = {
    'easy': '쉬웠음',
    'perfect': '적당함', 
    'hard': '힘들었음'
  };
  
  return feedbackMap[feedback] || feedback;
}

// 🤖 조합된 데이터로 프롬프트 생성
function generateCombinedPrompt(exerciseData: ExerciseData, combinedStats: CombinedStats): string {
  const { resistanceSettings, userFeedback, completedSets, completedBreaths, exerciseTime, isAborted } = exerciseData;
  const recentPatternContext = generateRecentPatternContext(combinedStats);

  return `당신은 숨트레이너 앱의 친근한 호흡운동 코치입니다.

📊 오늘 운동 데이터:
- 저항 설정: 들숨${resistanceSettings.inhale}/날숨${resistanceSettings.exhale}
- 운동 성과: ${completedSets}세트 ${completedBreaths}회, ${exerciseTime}
- 완료 상태: ${isAborted ? '중단됨' : '완료'}
- 체감 난이도: ${translateFeedbackToKorean(userFeedback)}

📅 최근 패턴: ${recentPatternContext}

🎯 응답 요청:
다음 내용을 포함한 2-3문장의 자연스러운 조언을 작성해주세요:
1. **저항 강도 조절**: 사용자 피드백을 고려한 구체적 조언
   - 쉬웠음 & 완료 → 1단계 상향 제안
   - 적당함 & 완료 → 현재 강도 유지
   - 힘들었음 또는 중단 → 1단계 하향 제안
2. **성과 인정 및 격려**: 오늘 성과 인정 + 따뜻한 격려와 동기부여

친근하고 간결하게, 태그나 구분자 없이 자연스러운 하나의 조언으로 작성해주세요.`;
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
          maxOutputTokens: 300,
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

// 🔄 기본 조언 (AI 실패 시)
function getDefaultAdvice(exerciseData: ExerciseData, combinedStats: CombinedStats): string {
  const { completedSets, isAborted, userFeedback } = exerciseData;
  const { totalSessions, consecutiveDays } = combinedStats;

  if (totalSessions === 1) {
    return isAborted 
      ? "첫 도전에서 중단하셨지만 용기내서 시작한 것이 대단해요! 다음에는 강도를 낮춰서 완주에 집중해보세요."
      : "첫 번째 숨트 운동을 완주하셨네요! 정말 멋진 시작이에요. 꾸준히 하시면 더 큰 변화를 경험하실 거예요!";
  }

  if (isAborted) {
    return consecutiveDays > 0 
      ? `${consecutiveDays}일 연속 기록이 있으신데 오늘은 중단하셨네요. 괜찮아요! 컨디션에 맞춰 강도를 조절해보세요.`
      : `${totalSessions}번째 운동에서 중단하셨지만 도전하신 것만으로도 의미있어요. 다음엔 더 편안한 강도로 시작해보세요!`;
  }

  if (consecutiveDays >= 7) {
    return `${consecutiveDays}일 연속! 정말 대단한 의지력이에요. ${userFeedback === 'easy' ? '이제 강도를 올려볼 때가 된 것 같네요!' : '이 페이스를 잘 유지하고 계세요!'}`;
  }

  return `${totalSessions}번째 운동 완주! ${userFeedback ? (userFeedback === 'perfect' ? '완벽한 강도네요!' : userFeedback === 'easy' ? '다음엔 조금 더 도전해볼까요?' : '무리하지 마세요!') : '꾸준히 하시는 모습이 보기 좋아요!'} 계속 화이팅!`;
}