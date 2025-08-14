// 🎯 간소화된 code.gs - AI 조언만 제공
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

// 🚨 CORS 프리플라이트 처리
function doOptions(e) {
  console.log('🌐 OPTIONS 요청 받음 (CORS 프리플라이트)');
  
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .setHeader('Access-Control-Max-Age', '3600');
}

// GET 요청 처리 (AI 조언 전용)
function doGet(e) {
  try {
    console.log('🌐 GET 요청 받음:', e ? e.parameter : 'null');
    
    // 🔒 파라미터 확인
    if (!e || !e.parameter) {
      console.log('⚠️ 파라미터 없음 - HTML 반환');
      return setCorsHeaders(
        HtmlService.createTemplateFromFile('index')
          .evaluate()
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      );
    }
    
    // 🤖 AI 조언 요청 처리
    if (e.parameter.function === 'getAIAdvice') {
      console.log('🤖 AI 조언 GET 요청:', e.parameter);
      
      const exerciseData = {
        exerciseTime: e.parameter.exerciseTime || '0:00',
        completedSets: parseInt(e.parameter.completedSets) || 0,
        completedBreaths: parseInt(e.parameter.completedBreaths) || 0,
        isAborted: e.parameter.isAborted === 'true',
        userFeedback: e.parameter.userFeedback || null,
        resistanceSettings: {
          inhale: parseInt(e.parameter.inhaleResistance) || 1,
          exhale: parseInt(e.parameter.exhaleResistance) || 1
        }
      };
      
      console.log('📊 AI 처리할 데이터:', exerciseData);
      
      const geminiResult = getTrainerAdvice(exerciseData);
      
      const result = {
        success: true,
        advice: geminiResult,
        debug: {
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('✅ AI 조언 GET 결과:', result);
      
      return setCorsHeaders(
        ContentService
          .createTextOutput(JSON.stringify(result))
          .setMimeType(ContentService.MimeType.JSON)
      );
    }
    
    // 기본 HTML 반환
    return setCorsHeaders(
      HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    );
      
  } catch (error) {
    console.error('❌ doGet 오류:', error);
    
    return setCorsHeaders(
      ContentService
        .createTextOutput(JSON.stringify({ 
          success: false, 
          message: 'GET Error: ' + error.toString()
        }))
        .setMimeType(ContentService.MimeType.JSON)
    );
  }
}

// 🆕 CORS 헤더 설정 함수
function setCorsHeaders(output) {
  if (output.setHeader) {
    // ContentService인 경우
    return output
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      .setHeader('Access-Control-Max-Age', '3600')
      .setHeader('Cache-Control', 'no-cache');
  } else {
    // HtmlOutput인 경우
    return output;
  }
}

// HTML 파일 포함
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 🤖 Gemini API 호출 (기존 잘 되던 방식 그대로 유지)
function getTrainerAdvice(exerciseData) {
  if (!exerciseData) {
    exerciseData = {};
  }
  
  try {
    console.log('🤖 Gemini API 호출 시작...');
    
    // 🔧 안전한 속성 접근
    const inhaleResistance = exerciseData.resistanceSettings && exerciseData.resistanceSettings.inhale ? exerciseData.resistanceSettings.inhale : 1;
    const exhaleResistance = exerciseData.resistanceSettings && exerciseData.resistanceSettings.exhale ? exerciseData.resistanceSettings.exhale : 1;
    const userFeedback = exerciseData.userFeedback || null;
    const completedSets = exerciseData.completedSets || 0;
    const completedBreaths = exerciseData.completedBreaths || 0;
    const exerciseTime = exerciseData.exerciseTime || '0:00';
    const isAborted = exerciseData.isAborted || false;
    
    // 🔧 피드백 텍스트 생성
    let feedbackText = '피드백 없음';
    if (userFeedback) {
      if (userFeedback === 'easy') {
        feedbackText = isAborted ? '중단했지만 편했음' : '너무 편했음';
      } else if (userFeedback === 'perfect') {
        feedbackText = isAborted ? '중단했지만 적당했음' : '딱 좋았음';
      } else if (userFeedback === 'hard') {
        feedbackText = isAborted ? '힘들어서 중단함' : '너무 힘들었음';
      }
    }
    
    // 🔧 간단한 사용자 통계 (로컬스토리지 기반이므로 서버에서는 기본값)
    const userStats = {
      totalExercises: 1,
      consecutiveDays: 1,
      totalSets: completedSets
    };
    
    const prompt = '당신은 숨트레이너 앱의 전문 AI 호흡 코치입니다. 사용자의 개별 트레이닝 결과와 피드백을 바탕으로 두 가지 조언을 해주세요.\n\n' +
      '### 🏋️‍♂️ 숨트(SUUMT) 호흡운동기구 정보:\n' +
      '- 들숨과 날숨을 동시에 트레이닝할 수 있는 세계 유일한 호흡운동기구\n' +
      '- 저항 조절 가능 (들숨 1-6단계, 날숨 1-5단계)\n' +
      '- 반드시 기구를 통한 입 호흡만 허용 (코 호흡 절대 금지)\n' +
      '- 숨트 프로토콜: 들숨 3초 → 멈춤 1초 → 날숨 3초 → 멈춤 1초\n' +
      '- 권장 세션: 2세트 × 10회, 세트간 2분 휴식\n\n' +
      '### 📊 오늘의 트레이닝 결과:\n' +
      '- 저항 설정: 들숨(Inhale) ' + inhaleResistance + '단계, 날숨(Exhale) ' + exhaleResistance + '단계\n' +
      '- 완료 세트: ' + completedSets + '/2세트\n' +
      '- 완료 호흡 횟수: ' + completedBreaths + '/20회\n' +
      '- 소요 시간: ' + exerciseTime + '\n' +
      '- 완주 여부: ' + (isAborted ? '중간 중단' : '완주 성공') + '\n' +
      '- 사용자 피드백: ' + feedbackText + '\n\n' +
      '### 💬 조언 요청:\n' +
      '다음 두 섹션으로 나누어 응답해주세요:\n\n' +
      '1. **저항 강도 분석** (100-150자):\n' +
      '   - 사용자 피드백과 완주/중단 상황을 종합한 구체적인 강도 조절 방향\n' +
      '   - 중단한 경우: 안전을 우선한 강도 하향 조정이나 격려\n' +
      '   - 완주한 경우: 피드백에 따른 점진적 발전 방안\n' +
      '   - 친근하고 이해하기 쉬운 표현\n\n' +
      '2. **종합 트레이닝 조언** (100-150자):\n' +
      '   - 중단/완주 여부를 고려한 전체적인 트레이닝 성과 분석\n' +
      '   - 중단한 경우: 도전한 것 자체를 격려하고 다음 목표 제시\n' +
      '   - 완주한 경우: 성취 칭찬과 개인 기록 발전상황 언급\n' +
      '   - 동기부여와 지속적인 트레이닝 격려\n\n' +
      '⚠️ 절대 금지사항:\n' +
      '- "코로 호흡", "코 호흡", "비강 호흡" 등 코 관련 표현 절대 금지\n' +
      '- 숨트는 반드시 입으로만 호흡하는 기구임을 항상 기억\n\n' +
      '⚠️ 중요한 피드백 로직:\n' +
      '- "너무 편했음" → 저항 1단계 상향 조언\n' +
      '- "딱 좋았음" → 현재 강도 유지 조언 (매우 중요!)\n' +
      '- "너무 힘들었음" → 저항 1단계 하향 조언\n\n' +
      '📝 가독성 개선:\n' +
      '- 줄바꿈을 활용해서 단락 구분\n' +
      '- 이모지로 각 섹션 구분\n\n'
      '🚨 중요: 반드시 아래 형식을 정확히 따라주세요!\n' +
      '응답 형식 (정확히 이 태그를 사용):\n' +
      '###INTENSITY### 강도분석내용 ###INTENSITY###\n' +
      '###COMPREHENSIVE### 종합조언내용 ###COMPREHENSIVE###';
      

    console.log('📝 Gemini 프롬프트 준비 완료');

    const response = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 1024,
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
      }
    );

    console.log('🌐 Gemini API 응답 상태:', response.getResponseCode());

    if (response.getResponseCode() !== 200) {
      console.error('❌ API 응답 오류:', response.getContentText());
      throw new Error('API Error: ' + response.getResponseCode());
    }

    const result = JSON.parse(response.getContentText());
    console.log('📦 API 응답 데이터 받음');

    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No candidates in response');
    }

    const fullText = result.candidates[0].content.parts[0].text.trim();
    console.log('✨ Gemini 응답 텍스트:', fullText);
    
    let intensityAdvice = '';
    let comprehensiveAdvice = '';
    
    // 🔧 태그 파싱 시도
    const intensityMatch1 = fullText.match(/###INTENSITY###\s*(.*?)\s*###INTENSITY###/s);
    const comprehensiveMatch1 = fullText.match(/###COMPREHENSIVE###\s*(.*?)\s*###COMPREHENSIVE###/s);
    
    if (intensityMatch1 && comprehensiveMatch1) {
      intensityAdvice = intensityMatch1[1].trim();
      comprehensiveAdvice = comprehensiveMatch1[1].trim();
      console.log('✅ 태그 파싱 성공');
    } else {
      // 대체 파싱 방법들
      const paragraphs = fullText.split('\n').filter(function(p) { return p.trim().length > 50; });
      
      if (paragraphs.length >= 2) {
        intensityAdvice = paragraphs[0].trim();
        comprehensiveAdvice = paragraphs[1].trim();
        console.log('✅ 문단 분리 파싱 성공');
      } else if (paragraphs.length === 1) {
        const sentences = fullText.split('.').filter(function(s) { return s.trim().length > 30; });
        
        if (sentences.length >= 2) {
          intensityAdvice = sentences.slice(0, Math.ceil(sentences.length/2)).join('.').trim() + '.';
          comprehensiveAdvice = sentences.slice(Math.ceil(sentences.length/2)).join('.').trim() + '.';
          console.log('✅ 문장 분리 파싱 성공');
        } else {
          const midPoint = Math.floor(fullText.length / 2);
          const splitPoint = fullText.indexOf(' ', midPoint);
          
          if (splitPoint > 0) {
            intensityAdvice = fullText.substring(0, splitPoint).trim();
            comprehensiveAdvice = fullText.substring(splitPoint).trim();
            console.log('✅ 텍스트 분할 파싱 성공');
          } else {
            intensityAdvice = getDefaultIntensityAdvice(userFeedback, isAborted, { inhale: inhaleResistance, exhale: exhaleResistance });
            comprehensiveAdvice = fullText;
            console.log('⚠️ 기본값 + 전체 텍스트 사용');
          }
        }
      } else {
        intensityAdvice = getDefaultIntensityAdvice(userFeedback, isAborted, { inhale: inhaleResistance, exhale: exhaleResistance });
        comprehensiveAdvice = fullText || '계속해서 꾸준히 트레이닝하시면 더 큰 발전을 경험하실 수 있을 것입니다!';
        console.log('⚠️ 텍스트 부족, 기본값 사용');
      }
    }
    
    console.log('💭 파싱된 강도 분석:', intensityAdvice);
    console.log('🌟 파싱된 종합 조언:', comprehensiveAdvice);
    console.log('✅ AI 조언 생성 완료');
    
    return {
      intensityAdvice: intensityAdvice,
      comprehensiveAdvice: comprehensiveAdvice
    };
    
  } catch (error) {
    console.error('🚨 Gemini API 오류:', error);
    
    return {
      intensityAdvice: getDefaultIntensityAdvice(exerciseData.userFeedback, exerciseData.isAborted, exerciseData.resistanceSettings),
      comprehensiveAdvice: getDefaultComprehensiveAdvice(exerciseData)
    };
  }
}

// 🆕 기본 강도 조언 함수
function getDefaultIntensityAdvice(feedback, isAborted, resistanceSettings) {
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
  
  // 중단한 경우 저항레벨에 따른 조언
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
      easy: "들숨(Inhale) " + inhale + "단계, 날숨(Exhale) " + exhale + "단계인데도 쉬우셨다니! 지루하셨을 것 같아요. 다음엔 들숨과 날숨을 각각 1-2단계씩 올려서 도전해보세요!",
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
      hard: "들숨(Inhale) " + inhale + "단계, 날숨(Exhale) " + exhale + "단계는 정말 높은 강도예요! 무리하지 마시고 들숨과 날숨을 모두 2단계 정도 낮춰서 안전하게 운동하세요."
    }
  };
  
  return adviceMatrix[resistanceLevel][feedback] || "다음 트레이닝에서는 컨디션에 맞게 들숨(Inhale)과 날숨(Exhale) 강도를 조절해보세요!";
}

// 🆕 기본 종합 조언 함수
function getDefaultComprehensiveAdvice(exerciseData) {
  const isAborted = exerciseData && exerciseData.isAborted ? exerciseData.isAborted : false;
  const exerciseTime = exerciseData && exerciseData.exerciseTime ? exerciseData.exerciseTime : '0:00';
  const completedSets = exerciseData && exerciseData.completedSets ? exerciseData.completedSets : 0;
  const completedBreaths = exerciseData && exerciseData.completedBreaths ? exerciseData.completedBreaths : 0;
  
  if (isAborted) {
    const abortedAdvices = [
      '중간에 멈추셨지만 ' + exerciseTime + ' 동안 노력하신 모습이 멋져요! 포기하지 않고 도전하는 마음이 중요해요. 다음엔 더 편안한 강도로 완주해봐요.',
      completedSets + '세트까지 진행하시고 중단하셨네요. 그래도 ' + completedBreaths + '회 호흡하신 것만으로도 의미 있는 운동이었어요! 점진적으로 늘려가면 됩니다.',
      '무리하지 않고 중단하신 것도 현명한 판단이에요. 안전이 최우선이니까요! 다음에는 조금 더 낮은 강도로 시작해서 완주의 성취감을 느껴보세요.'
    ];
    
    const index = Math.floor(Math.random() * abortedAdvices.length);
    return abortedAdvices[index];
  }
  
  const completeAdvices = [
    completedSets + '세트 완주하셨네요! ' + exerciseTime + ' 동안 집중하신 모습이 인상적이에요. 꾸준한 트레이닝으로 호흡근이 점점 강해지고 있어요!',
    '체계적인 트레이닝을 완료하셨어요! 꾸준히 도전하는 의지가 정말 멋져요. 숨트만의 특별한 저항 시스템으로 호흡 효율성이 크게 개선되고 있습니다.',
    completedBreaths + '회의 의식적인 호흡으로 호흡근육이 한층 발달했습니다. 꾸준한 트레이닝으로 일상에서도 더 편안한 호흡을 경험하게 될 거예요!'
  ];
  
  const index = Math.floor(Math.random() * completeAdvices.length);
  return completeAdvices[index];
}

// 🧪 테스트 함수
function testAIAdvice() {
  console.log('🧪 AI 조언 테스트 시작...');
  
  const testData = {
    exerciseTime: '5:30',
    completedSets: 2,
    completedBreaths: 20,
    isAborted: false,
    userFeedback: 'perfect',
    resistanceSettings: {
      inhale: 3,
      exhale: 2
    }
  };
  
  const result = getTrainerAdvice(testData);
  
  console.log('🎯 테스트 결과:');
  console.log('강도 분석:', result.intensityAdvice);
  console.log('종합 조언:', result.comprehensiveAdvice);
  console.log('응답 타입:', typeof result);
  console.log('전체 결과:', result);
  
  return result;
}
