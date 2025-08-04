// 🎮 퀴즈 시스템 관련 함수들

// 🎮 퀴즈 시스템 설정 (쉬운 관리를 위한 구역)
const QUIZ_CONFIG = {
    // 🛒 쇼핑몰 설정 (나중에 쉽게 변경)
    SHOP_URL: "https://suumt.com", // 실제 쇼핑몰 URL
    SPECIAL_PRODUCT_PATH: "/product/detail.html?product_no=123",
    
    // 🎁 상품 설정 (2개 상품 로테이션)
    PRODUCTS: [
        {
            // 첫 번째 상품: 숨트 호흡운동기구
            id: 'suumt_device',
            name: "숨트 호흡운동기구",
            originalPrice: "65,900원",
            discountPrice: "55,900원",
            discountPercent: 15,
            image: "./images/suumt-product.png",
            description: "앱 사용자만을 위한 특별가",
            specialPath: "/product/detail.html?product_no=123"
        },
        {
            // 두 번째 상품: 다른 주력 상품
            id: 'suumt_accessory',
            name: "숨실틈 디퓨저 세트",
            originalPrice: "29,500원", 
            discountPrice: "24,900원",
            discountPercent: 15,
            image: "./images/suumt-accessory.png",
            description: "앱 사용자만을 위한 특별가",
            specialPath: "/product/detail.html?product_no=456"
        }
    ],
    
    // 🔧 퀴즈 활성화 설정
    QUIZ_ENABLED: true,
    QUIZ_SKIP_ALLOWED: true,
    OFFER_DELAY: 5000 // 5초 후 퀴즈 제안
};

// 🧠 퀴즈 문제 풀 (6문제 중 2문제 랜덤 선택)
const QUIZ_QUESTIONS = [
    {
        question: "호흡근 운동을 하면 어떤 변화가 생길까요?",
        options: ["숨이 더 차진다", "더 깊게 숨쉴 수 있다", "변화가 없다"],
        correct: 1,
        explanation: "호흡근이 강해지면 폐활량이 늘어나고 더 깊게 숨쉴 수 있어요!"
    },
    {
        question: "운동할 때 올바른 호흡법은?",
        options: ["숨을 참으며 운동", "일정한 리듬으로 호흡", "무작정 빠르게 호흡"],
        correct: 1,
        explanation: "규칙적인 호흡이 운동 효과를 극대화하고 부상을 예방해요!"
    },
    {
        question: "스트레스 해소에 좋은 호흡법은?",
        options: ["4초 들이쉬고 4초 내쉬기", "빠르게 얕게 호흡", "호흡 참기"],
        correct: 0,
        explanation: "깊고 천천히 하는 호흡이 마음을 진정시키고 스트레스를 줄여줘요!"
    },
    {
        question: "호흡근을 강화하면 얻는 가장 큰 효과는?",
        options: ["체중 감량", "지구력 향상", "근육량 증가"],
        correct: 1,
        explanation: "호흡근 강화로 산소 공급이 원활해져 전체적인 지구력이 향상돼요!"
    },
    {
        question: "일상에서 호흡을 의식하면 좋은 점은?",
        options: ["집중력 향상", "소화 촉진", "시력 개선"],
        correct: 0,
        explanation: "의식적인 호흡은 뇌에 산소를 충분히 공급해 집중력을 높여줘요!"
    },
    {
        question: "깊은 호흡의 가장 중요한 포인트는?",
        options: ["빠른 속도", "배까지 내려가는 느낌", "소리 내기"],
        correct: 1,
        explanation: "배까지 공기가 내려가는 복식호흡이 가장 효과적이에요!"
    }
];

// 🎁 상품 로테이션 시스템
function getTotalQuizCount() {
    return parseInt(localStorage.getItem('totalQuizCount') || '0');
}

function incrementQuizCount() {
    const count = getTotalQuizCount() + 1;
    localStorage.setItem('totalQuizCount', count.toString());
    return count;
}

function getCurrentProduct() {
    const quizCount = getTotalQuizCount();
    const productIndex = quizCount % 2; // 0 또는 1
    return QUIZ_CONFIG.PRODUCTS[productIndex];
}

// 🎮 퀴즈 문제 랜덤 선택 함수
function selectRandomQuestions() {
    const questionIndices = Array.from({length: QUIZ_QUESTIONS.length}, (_, i) => i);
    
    // 피셔-예이츠 셔플 알고리즘
    for (let i = questionIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionIndices[i], questionIndices[j]] = [questionIndices[j], questionIndices[i]];
    }
    
    // 처음 2개 문제 선택
    selectedQuestions = questionIndices.slice(0, 2);
    console.log('🎯 선택된 문제:', selectedQuestions);
}

// 🎮 새로운 기능: 퀴즈 제안 화면 (타이머 연속성 개선)
function showQuizOffer() {
    console.log('🎮 showQuizOffer 함수 시작');
    
    document.getElementById('restSection').style.display = 'none';
    document.getElementById('quizOfferSection').classList.add('active');
    
    // 타이머 시작 (5초 대기 후 선택 카드가 표시되므로)
    globalRestTime = 120; // 2분
    startGlobalRestTimer();
    
    console.log('⏰ 퀴즈 제안 타이머 시작됨');
    
    // GA 이벤트: 퀴즈 제안 노출
    gtag('event', 'quiz_offer_shown', {
        set_number: currentSet - 1,
        remaining_rest_time: globalRestTime
    });
}

// 🎮 새로운 기능: 퀴즈 시작
function startQuiz() {
    console.log('🎮 startQuiz 함수 시작');
    
    document.getElementById('quizOfferSection').classList.remove('active');
    document.getElementById('quizProgressSection').classList.add('active');
    
    // 퀴즈 상태 초기화
    currentQuizQuestion = 0;
    quizCorrectAnswers = 0;
    quizStartTime = getCurrentUserTime();
    
    // 🎯 랜덤 2문제 선택
    selectRandomQuestions();
    
    // 타이머 시작
    globalRestTime = 120; // 2분
    startGlobalRestTimer();
    
    console.log('⏰ 퀴즈 타이머 시작됨');
    
    // GA 이벤트: 퀴즈 시작
    gtag('event', 'quiz_started', {
        set_number: currentSet - 1,
        remaining_rest_time: parseInt(document.getElementById('restCountdown').textContent),
        selected_questions: selectedQuestions
    });
    
    showQuizQuestion();
}

// 🎮 새로운 기능: 퀴즈 문제 표시 (랜덤 문제 지원)
function showQuizQuestion() {
    const questionIndex = selectedQuestions[currentQuizQuestion];
    const question = QUIZ_QUESTIONS[questionIndex];
    const questionEl = document.getElementById('quizQuestion');
    const optionsEl = document.getElementById('quizOptions');
    const explanationEl = document.getElementById('quizExplanation');
    const progressFillEl = document.getElementById('quizProgressFill');
    const progressTextEl = document.getElementById('quizProgressText');
    const quizCountdownEl = document.getElementById('quizCountdown');
    
    // 문제 표시
    questionEl.textContent = question.question;
    
    // 선택지 생성
    optionsEl.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'quiz-option';
        optionEl.textContent = option;
        optionEl.onclick = () => selectQuizAnswer(index, questionIndex);
        optionsEl.appendChild(optionEl);
    });
    
    // 설명 숨기기
    explanationEl.style.display = 'none';
    
    // 진행률 업데이트 (2문제 기준)
    const progress = ((currentQuizQuestion + 1) / 2) * 100;
    progressFillEl.style.width = `${progress}%`;
    progressTextEl.textContent = `문제 ${currentQuizQuestion + 1} / 2`;
    
    // 카운트다운 동기화
    const syncInterval = setInterval(() => {
        const restCountdownEl = document.getElementById('restCountdown');
        const currentTime = restCountdownEl.textContent;
        quizCountdownEl.textContent = currentTime;
        
        if (parseInt(currentTime) <= 0) {
            clearInterval(syncInterval);
        }
    }, 1000);
}

// 🎮 새로운 기능: 퀴즈 답안 선택 (배지 추적 추가)
function selectQuizAnswer(selectedIndex, questionIndex) {
    const question = QUIZ_QUESTIONS[questionIndex];
    const optionsEl = document.getElementById('quizOptions');
    const explanationEl = document.getElementById('quizExplanation');
    const options = optionsEl.querySelectorAll('.quiz-option');
    
    // 선택지 비활성화
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // 정답/오답 표시
    options[selectedIndex].classList.add(selectedIndex === question.correct ? 'correct' : 'incorrect');
    if (selectedIndex !== question.correct) {
        options[question.correct].classList.add('correct');
    }
    
    // 정답 카운트
    if (selectedIndex === question.correct) {
        quizCorrectAnswers++;
    }
    
    // 🎮 푼 문제 기록 (배지용)
    addSolvedQuestion(questionIndex);
    
    // 설명 표시
    explanationEl.textContent = question.explanation;
    explanationEl.style.display = 'block';
    
    // GA 이벤트: 답안 선택
    gtag('event', 'quiz_answer_selected', {
        question_number: currentQuizQuestion + 1,
        question_index: questionIndex,
        selected_answer: selectedIndex,
        correct_answer: question.correct,
        is_correct: selectedIndex === question.correct
    });
    
    // 2초 후 다음 문제 또는 결과 화면
    setTimeout(() => {
        currentQuizQuestion++;
        if (currentQuizQuestion < 2) { // 2문제로 변경
            showQuizQuestion();
        } else {
            showQuizResult();
        }
    }, 2500);
}

// 🎮 새로운 기능: 퀴즈 결과 화면
function showQuizResult() {
    document.getElementById('quizProgressSection').classList.remove('active');
    document.getElementById('quizRewardSection').classList.add('active');
    
    const quizEndTime = getCurrentUserTime();
    const quizDuration = Math.floor((quizEndTime - quizStartTime) / 1000);
    
    // 🎮 퀴즈 완료 배지 처리
    handleQuizCompletionBadges();
    
    // 보상 내용 업데이트 (현재 상품 로테이션 사용)
    updateRewardContent();
    
    // GA 이벤트: 퀴즈 완료
    gtag('event', 'quiz_completed', {
        correct_answers: quizCorrectAnswers,
        total_questions: 2,
        quiz_duration_seconds: quizDuration,
        accuracy_percentage: Math.round((quizCorrectAnswers / 2) * 100)
    });
}

// 🎮 새로운 기능: 보상 내용 업데이트 (상품 로테이션 적용)
function updateRewardContent() {
    const rewardSubtitle = document.getElementById('quizRewardSubtitle');
    const productName = document.getElementById('rewardProductName');
    const productDescription = document.getElementById('rewardProductDescription');
    const productImage = document.getElementById('rewardProductImage');
    const originalPrice = document.getElementById('rewardOriginalPrice');
    const discountPrice = document.getElementById('rewardDiscountPrice');
    const discountBadge = document.getElementById('rewardDiscountBadge');
    
    // 정답 개수에 따른 메시지
    if (quizCorrectAnswers === 2) {
        rewardSubtitle.textContent = '🌟 완벽! 모든 문제를 맞혔어요!';
    } else if (quizCorrectAnswers >= 1) {
        rewardSubtitle.textContent = `👍 훌륭해요! ${quizCorrectAnswers}문제 정답!`;
    } else {
        rewardSubtitle.textContent = `💪 좋아요! 도전해주셔서 감사해요!`;
    }
    
    // 🎁 현재 상품 로테이션 적용
    const currentProduct = getCurrentProduct();
    
    productName.textContent = currentProduct.name;
    productDescription.textContent = currentProduct.description;
    productImage.src = currentProduct.image;
    originalPrice.textContent = currentProduct.originalPrice;
    discountPrice.textContent = currentProduct.discountPrice;
    discountBadge.textContent = `${currentProduct.discountPercent}% 할인`;
    
    // 퀴즈 카운트 증가
    incrementQuizCount();
}

// 🎮 새로운 기능: 특가 확인하기 (새 탭으로 열기)
function checkSpecialOffer() {
    const shopUrl = generateShopUrl();
    
    // GA 이벤트: 특가 확인
    gtag('event', 'special_offer_checked', {
        correct_answers: quizCorrectAnswers,
        total_questions: 2,
        discount_percentage: getCurrentProduct().discountPercent,
        shop_url: shopUrl,
        open_method: 'new_tab'
    });
    
    // 새 탭에서 쇼핑몰 열기 (앱은 그대로 유지)
    window.open(shopUrl, '_blank');
    
    // 사용자에게 피드백 제공
    const checkButton = document.querySelector('.quiz-check-button');
    const originalText = checkButton.textContent;
    checkButton.textContent = '✅ 새 탭에서 열림';
    checkButton.style.background = 'rgba(76, 175, 80, 0.9)';
    checkButton.style.color = 'white';
    
    // 3초 후 원래 상태로 복원
    setTimeout(() => {
        checkButton.textContent = originalText;
        checkButton.style.background = '';
        checkButton.style.color = '';
    }, 3000);
}

// 🎮 새로운 기능: 쇼핑몰 URL 생성 (상품 로테이션 적용)
function generateShopUrl() {
    const currentProduct = getCurrentProduct();
    const baseUrl = `${QUIZ_CONFIG.SHOP_URL}${currentProduct.specialPath}`;
    const params = new URLSearchParams({
        utm_source: 'breath_app',
        utm_medium: 'quiz_reward',
        utm_campaign: 'rest_quiz',
        utm_content: `${quizCorrectAnswers}_of_2_correct`,
        quiz_score: quizCorrectAnswers,
        discount: currentProduct.discountPercent,
        product_id: currentProduct.id,
        questions_solved: getSolvedQuestionsCount()
    });
    
    return `${baseUrl}?${params.toString()}`;
}

// 🎮 새로운 기능: 퀴즈 후 다음 세트로
function continueToNextSet() {
    console.log('🎮 continueToNextSet 함수 시작');
    
    // 퀴즈 관련 화면 모두 숨기기
    document.getElementById('quizRewardSection').classList.remove('active');
    
    // 기존 휴식 타이머 정리
    stopGlobalRestTimer();
    clearTimeout(quizOfferTimer);
    
    console.log('⏰ 퀴즈 타이머 정리 완료');
    
    // 다음 세트 시작
    startNextSet();
}

// 🎮 새로운 기능: 휴식만 선택
function chooseRestOnly() {
    console.log('🎮 chooseRestOnly 함수 시작');
    
    document.getElementById('quizOfferSection').classList.remove('active');
    
    // 타이머 시작
    globalRestTime = 120; // 2분
    startGlobalRestTimer();
    
    console.log('⏰ 휴식 타이머 시작됨');
    
    // GA 이벤트: 휴식만 선택
    gtag('event', 'quiz_declined', {
        set_number: currentSet - 1,
        remaining_rest_time: parseInt(document.getElementById('restCountdown').textContent)
    });
    
    showNormalRest();
}
