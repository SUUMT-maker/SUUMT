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
    const aiAdvice = parseGeminiResponse(geminiResponse, exerciseData);

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
    console.error('🚨 Edge Function 오류:', error);

    // 오류 응답
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// 🚀 최적화된 프롬프트 생성 함수
function generatePrompt(exerciseData: ExerciseData): string {
  const { resistanceSettings, userFeedback, completedSets, completedBreaths, exerciseTime, isAborted } = exerciseData;

  return `
사용자 오늘 세션 요약 (JSON):
{
  "inhale": ${resistanceSettings.inhale},
  "exhale": ${resistanceSettings.exhale},
  "sets": ${completedSets},
  "breaths": ${completedBreaths},
  "duration": "${exerciseTime}",
  "aborted": ${isAborted},
  "feedback": "${userFeedback || 'none'}"
}

출력:
###INTENSITY### 강도조절 한 문장 ###INTENSITY###
###COMPREHENSIVE### 종합격려 한 문장 ###COMPREHENSIVE###

규칙:
- 한국어 출력
- 각 문장 최대 100자
- 친근하고 간결하게
- 코 호흡 관련 표현 금지
- 피드백 기반 강도 조절: easy→상향, perfect→유지, hard→하향
`;
}

// 🎯 최적화된 Gemini API 호출 함수
async function callGeminiAPI(apiKey: string, prompt: string): Promise<GeminiResponse> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256, // 🎯 토큰 사용량 75% 감소
        candidateCount: 1
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API 호출 실패: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

function parseGeminiResponse(geminiResponse: GeminiResponse, exerciseData: ExerciseData): AIAdviceResponse {
  try {
    const responseText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!responseText) {
      throw new Error('Gemini API에서 빈 응답을 받았습니다.');
    }

    console.log('✨ Gemini 응답 텍스트:', responseText);
    
    let intensityAdvice = '';
    let comprehensiveAdvice = '';
    
    // Google Apps Script와 동일한 태그 파싱 로직
    const intensityMatch = responseText.match(/###INTENSITY###\s*(.*?)\s*###INTENSITY###/s);
    const comprehensiveMatch = responseText.match(/###COMPREHENSIVE###\s*(.*?)\s*###COMPREHENSIVE###/s);
    
    if (intensityMatch && comprehensiveMatch) {
      intensityAdvice = intensityMatch[1].trim();
      comprehensiveAdvice = comprehensiveMatch[1].trim();
      console.log('✅ 태그 파싱 성공');
    } else {
      // Google Apps Script와 동일한 대체 파싱 방법들
      const paragraphs = responseText.split('\n').filter((p) => p.trim().length > 50);
      
      if (paragraphs.length >= 2) {
        intensityAdvice = paragraphs[0].trim();
        comprehensiveAdvice = paragraphs[1].trim();
        console.log('✅ 문단 분리 파싱 성공');
      } else if (paragraphs.length === 1) {
        const sentences = responseText.split('.').filter((s) => s.trim().length > 30);
        
        if (sentences.length >= 2) {
          intensityAdvice = sentences.slice(0, Math.ceil(sentences.length / 2)).join('.').trim() + '.';
          comprehensiveAdvice = sentences.slice(Math.ceil(sentences.length / 2)).join('.').trim() + '.';
          console.log('✅ 문장 분리 파싱 성공');
        } else {
          const midPoint = Math.floor(responseText.length / 2);
          const splitPoint = responseText.indexOf(' ', midPoint);
          
          if (splitPoint > 0) {
            intensityAdvice = responseText.substring(0, splitPoint).trim();
            comprehensiveAdvice = responseText.substring(splitPoint).trim();
            console.log('✅ 텍스트 분할 파싱 성공');
          } else {
            intensityAdvice = getDefaultIntensityAdvice(exerciseData.userFeedback, exerciseData.isAborted, exerciseData.resistanceSettings);
            comprehensiveAdvice = responseText;
            console.log('⚠️ 기본값 + 전체 텍스트 사용');
          }
        }
      } else {
        intensityAdvice = getDefaultIntensityAdvice(exerciseData.userFeedback, exerciseData.isAborted, exerciseData.resistanceSettings);
        comprehensiveAdvice = responseText || '계속해서 꾸준히 트레이닝하시면 더 큰 발전을 경험하실 수 있을 것입니다!';
        console.log('⚠️ 텍스트 부족, 기본값 사용');
      }
    }
    
    console.log('💭 파싱된 강도 분석:', intensityAdvice);
    console.log('🌟 파싱된 종합 조언:', comprehensiveAdvice);
    
    return {
      intensityAdvice: intensityAdvice.trim(),
      comprehensiveAdvice: comprehensiveAdvice.trim(),
    };

  } catch (error) {
    console.error('응답 파싱 오류:', error);
    
    // 오류 시 기본 조언 반환
    return {
      intensityAdvice: getDefaultIntensityAdvice(exerciseData.userFeedback, exerciseData.isAborted, exerciseData.resistanceSettings),
      comprehensiveAdvice: getDefaultComprehensiveAdvice(exerciseData),
    };
  }
}

// Google Apps Script와 동일한 기본 조언 함수들
function getDefaultIntensityAdvice(feedback: string | null, isAborted: boolean, resistanceSettings: { inhale: number; exhale: number }): string {
  if (!feedback) {
    if (isAborted) {
      return "중단하셨지만 괜찮아요! 다음엔 피드백을 남겨주시면 더 적절한 강도로 조절해드릴게요.";
    }
    return "다음 트레이닝에서는 운동 후 피드백을 남겨주시면 더 정확한 강도 조절 분석을 드릴 수 있어요!";
  }
  
  if (!isAborted) {
    const completeAdvices = {
      easy: "아직 여유가 있으시네요! 다음에는 들숨(Inhale)과 날숨(Exhale)을 각각 1단계씩 올려보세요. 너무 갑작스럽지 않게 점진적으로 올리는 게 안전해요.",
      perfect: "완벽한 강도예요! 현재 들숨(Inhale)과 날숨(Exhale) 설정을 2주 정도 더 유지하시다가 익숙해지면 그때 한 단계씩 도전해봐요.",
      hard: "무리하지 마세요! 다음에는 들숨(Inhale)과 날숨(Exhale)을 각각 1단계씩 낮춰서 안전하게 운동해봐요. 꾸준함이 강도보다 훨씬 중요합니다."
    };
    return completeAdvices[feedback] || completeAdvices.perfect;
  }
  
  // 중단한 경우 저항레벨에 따른 조언 (Google Apps Script와 동일)
  const inhale = resistanceSettings && resistanceSettings.inhale ? resistanceSettings.inhale : 1;
  const exhale = resistanceSettings && resistanceSettings.exhale ? resistanceSettings.exhale : 1;
  
  const maxResistance = Math.max(inhale, exhale);
  let resistanceLevel;
  
  if (maxResistance <= 2) {
    resistanceLevel = 'low';
  } else if (maxResistance <= 4) {
    resistanceLevel = 'medium';
  } else {
    resistanceLevel = 'high';
  }
  
  const adviceMatrix = {
    low: {
      easy: `들숨(Inhale) ${inhale}단계, 날숨(Exhale) ${exhale}단계인데도 쉬우셨다니! 지루하셨을 것 같아요. 다음엔 들숨과 날숨을 각각 1-2단계씩 올려서 도전해보세요!`,
      perfect: "적당한 강도였는데 중단하셨네요. 다음엔 시간 여유를 두고 현재 들숨(Inhale)과 날숨(Exhale) 강도 그대로 완주에 도전해보세요!",
      hard: "낮은 강도인데 힘드셨다니 컨디션이 좋지 않으셨나봐요. 오늘은 충분히 휴식하시고 다음에 다시 도전해보세요!"
    },
    medium: {
      easy: "중간 강도인데 여유가 있으시네요! 실력이 늘었어요. 다음엔 들숨(Inhale)과 날숨(Exhale)을 모두 1단계씩 올려보시겠어요?",
      perfect: "적절한 강도로 운동하시다 중단하셨네요. 다음엔 현재 들숨(Inhale)과 날숨(Exhale) 강도 그대로 끝까지 완주해보시겠어요?",
      hard: "중간 강도가 힘드셨군요. 무리하지 마시고 들숨(Inhale)과 날숨(Exhale)을 각각 1단계씩 낮춰서 안전하게 운동하세요."
    },
    high: {
      easy: "고강도인데도 쉬우셨다니 정말 대단해요! 호흡근이 많이 발달하셨네요. 현재 들숨(Inhale)과 날숨(Exhale) 강도를 유지하시거나 더 도전해보세요!",
      perfect: "고강도로 적절히 운동하시다 현명하게 중단하셨네요. 현재 들숨(Inhale)과 날숨(Exhale) 강도면 충분히 효과적이에요!",
      hard: `들숨(Inhale) ${inhale}단계, 날숨(Exhale) ${exhale}단계는 정말 높은 강도예요! 무리하지 마시고 들숨과 날숨을 모두 2단계 정도 낮춰서 안전하게 운동하세요.`
    }
  };
  
  return adviceMatrix[resistanceLevel][feedback] || "다음 트레이닝에서는 컨디션에 맞게 들숨(Inhale)과 날숨(Exhale) 강도를 조절해보세요!";
}

function getDefaultComprehensiveAdvice(exerciseData: ExerciseData): string {
  const isAborted = exerciseData && exerciseData.isAborted ? exerciseData.isAborted : false;
  const exerciseTime = exerciseData && exerciseData.exerciseTime ? exerciseData.exerciseTime : '0:00';
  const completedSets = exerciseData && exerciseData.completedSets ? exerciseData.completedSets : 0;
  const completedBreaths = exerciseData && exerciseData.completedBreaths ? exerciseData.completedBreaths : 0;
  
  if (isAborted) {
    const abortedAdvices = [
      `${exerciseTime} 동안 노력하신 모습이 멋져요! 포기하지 않고 도전하는 마음이 중요해요. 다음엔 더 편안한 강도로 완주해봐요.`,
      `${completedSets}세트까지 진행하시고 중단하셨네요. 그래도 ${completedBreaths}회 호흡하신 것만으로도 의미 있는 운동이었어요! 점진적으로 늘려가면 됩니다.`,
      '무리하지 않고 중단하신 것도 현명한 판단이에요. 안전이 최우선이니까요! 다음에는 조금 더 낮은 강도로 시작해서 완주의 성취감을 느껴보세요.'
    ];
    
    const index = Math.floor(Math.random() * abortedAdvices.length);
    return abortedAdvices[index];
  }
  
  const completeAdvices = [
    `${completedSets}세트 완주하셨네요! ${exerciseTime} 동안 집중하신 모습이 인상적이에요. 꾸준한 트레이닝으로 호흡근이 점점 강해지고 있어요!`,
    '체계적인 트레이닝을 완료하셨어요! 꾸준히 도전하는 의지가 정말 멋져요. 숨트만의 특별한 저항 시스템으로 호흡 효율성이 크게 개선되고 있습니다.',
    `${completedBreaths}회의 의식적인 호흡으로 호흡근육이 한층 발달했습니다. 꾸준한 트레이닝으로 일상에서도 더 편안한 호흡을 경험하게 될 거예요!`
  ];
  
  const index = Math.floor(Math.random() * completeAdvices.length);
  return completeAdvices[index];
}
