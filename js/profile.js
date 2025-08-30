// 🙋‍♂️ 프로필탭 인라인 구현 (dashboard.js 패턴)
// ✨ 실시간 리뷰 캐러셀, 배지 시스템, 성장 통계 포함

// 📱 프로필탭 HTML 구조
const PROFILE_HTML = `
<div class="profile-screen-container" style="padding-top: max(40px, env(safe-area-inset-top));">
    
    <!-- 1. 프로필 헤더 (레벨 시스템 포함) -->
    <div class="main-header" style="padding: 20px; margin-bottom: 24px;">
        <div class="user-greeting">
            <div class="user-info" style="display: flex; align-items: center; gap: 12px;">
                <div class="user-avatar" style="width: 48px; height: 48px; background: #EEF1F3; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <img src="images/suumt-logo.png" alt="숨트레이너" style="width: 32px; height: 32px; border-radius: 50%;" onerror="this.parentNode.innerHTML='🤖';">
                </div>
                <div class="user-text" style="flex: 1;">
                    <h3 id="profileNickname" style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 4px 0;">AI 숨트레이너 님</h3>
                    <p class="greeting-message" style="font-size: 14px; font-weight: 400; color: #1f2937; margin: 0 0 8px 0;">나의 호흡 운동 여정을 확인해보세요</p>
                    

                </div>
            </div>
        </div>
    </div>

    <!-- 레벨시스템 카드 영역 -->

    <!-- 2. 나의 레벨 시스템 카드 -->
    <div id="profileLevelCard" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 32px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;">
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #F1F5F9;">
            <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0;">나의 레벨</h3>
        </div>
        
        <div class="level-container" style="display: flex; justify-content: center; align-items: center; margin-bottom: 20px; position: relative;">
            <div class="level-loader">
                <div class="level-waves" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; border-radius: 50%; background: rgb(30, 146, 255); box-shadow: inset 0 0 50px rgba(0,0,0,.3); transition: height 0.5s ease-in-out;"></div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="text-align: center; padding: 16px; background: #F8F9FA; border-radius: 16px;">
                <div id="dailyExpAmount" style="font-size: 24px; font-weight: 700; color: #3B82F6; margin-bottom: 4px;">0</div>
                <div style="font-size: 12px; color: #6B7280;">일일미션 EXP</div>
            </div>
            <div style="text-align: center; padding: 16px; background: #F8F9FA; border-radius: 16px;">
                <div id="weeklyExpAmount" style="font-size: 24px; font-weight: 700; color: #8B5CF6; margin-bottom: 4px;">0</div>
                <div style="font-size: 12px; color: #6B7280;">주간챌린지 EXP</div>
            </div>
        </div>
    </div>

    <!-- 3. 배지 컬렉션 -->
    <div id="profileBadgesSection" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 32px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;">
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #F1F5F9;">
            <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0;">배지 컬렉션</h3>
        </div>
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; color: #6b7280; font-weight: 600;">배지 수집 진행률</span>
                <span id="profileBadgesCount" style="font-size: 12px; color: #6b7280; font-weight: 600;">0/15</span>
            </div>
            <div style="background: #f3f4f6; border-radius: 8px; height: 8px; overflow: hidden;">
                <div id="profileBadgesBar" style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: 0%; transition: width 0.3s ease; border-radius: 8px;"></div>
            </div>
        </div>
        <div id="profileBadgesGrid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
            <!-- 15개 배지들이 JavaScript로 생성됨 (5x3 그리드) -->
        </div>
    </div>

    <!-- 4. 숨트 커뮤니티 (리뷰 캐러셀 시스템) -->
    <div id="profileCommunitySection" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #F1F5F9;">
            <h3 style="font-size: 18px; font-weight: 700; color: #1f2937; margin: 0;">함께하는 숨트 커뮤니티</h3>
        </div>
        
        <!-- 실시간 통계 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div style="text-align: center;">
                <div id="profileTodayActive" style="font-size: 24px; font-weight: 700; color: #3B82F6; visibility: hidden;">0,000</div>
                <div style="font-size: 12px; color: #6B7280;">오늘 활동 중</div>
            </div>
            <div style="text-align: center;">
                <div id="profileTotalUsers" style="font-size: 24px; font-weight: 700; color: #1f2937; visibility: hidden;">00,000</div>
                <div style="font-size: 12px; color: #6B7280;">전체 사용자</div>
            </div>
        </div>
        
        <!-- 리뷰 캐러셀 -->
        <div class="reviews-carousel" style="background: #F8F9FA; border-radius: 16px; padding: 16px; overflow: hidden; position: relative; height: 160px;">
            <div class="reviews-slider" id="profileReviewsSlider" style="display: flex; transition: transform 0.3s ease; height: 100%;">
                <!-- 리뷰 카드들이 JavaScript로 생성됨 -->
            </div>
            <div class="carousel-dots" id="profileCarouselDots" style="display: flex; justify-content: center; gap: 6px; margin-top: 12px;">
                <!-- 점들이 JavaScript로 생성됨 -->
            </div>
        </div>
    </div>

    <!-- 5. 계정 관리 (단순화) -->
    <div style="margin: 0 20px 60px; padding: 20px; text-align: center;">
        <button id="logoutButton" style="background: none; border: none; color: #9ca3af; font-size: 13px; font-weight: 400; cursor: pointer; text-decoration: underline; transition: color 0.3s ease; padding: 8px;">
            계정 및 데이터 완전 삭제
        </button>
        
        <div style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 8px; line-height: 1.4; max-width: 280px; margin-left: auto; margin-right: auto;">
            이 작업은 되돌릴 수 없습니다. 모든 운동 기록, 배지, AI 조언 등 개인 데이터가 영구적으로 삭제됩니다.
        </div>
    </div>

</div>
`;

// 🎨 프로필탭 CSS 스타일
const PROFILE_CSS = `
<style>
.profile-screen-container {
    min-height: 100vh;
    background: #F8F9FA;
    padding-bottom: 80px;
}

.level-loader {
    width: 200px;
    height: 200px;
    overflow: hidden;
    border: 1px solid transparent;
    box-shadow: 0 0 0 4px rgb(25, 116, 253);
    border-radius: 50%;
    position: relative;
}

#logoutButton:hover {
    color: #6b7280 !important;
    background: none !important;
    transform: none !important;
    box-shadow: none !important;
}

.badge-item {
    aspect-ratio: 1;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
}

.badge-item.earned {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.badge-item.locked {
    background: #F3F4F6;
    color: #9CA3AF;
    border: 2px dashed #D1D5DB;
}

.badge-item:hover.earned {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5);
}

.badge-icon {
    font-size: 16px;
    margin-bottom: 2px;
}

.badge-name {
    font-size: 8px;
    font-weight: 600;
    line-height: 1.1;
    word-break: keep-all;
}

/* 리뷰 캐러셀 스타일 */
.reviews-carousel {
    background: #F8F9FA;
    border-radius: 16px;
    padding: 16px 16px 24px 16px;
    overflow: hidden;
    position: relative;
    height: 160px; /* 카드 높이 140px에 맞춰 전체 높이 증가 */
}

    .reviews-slider {
        display: flex;
        transition: transform 0.3s ease;
        height: calc(100% - 24px);
    }

.review-card {
    min-width: 100%;
    padding: 0 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
}

.review-text {
    font-size: 13px;
    color: #333;
    line-height: 1.5;
    margin-bottom: 8px;
    text-align: center;
    word-break: keep-all;
}

.review-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 16px 16px 16px; /* 상단 패딩 증가로 잘림 방지 */
    height: 140px;
}

.review-header-center {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px; /* 12px → 8px 여백 줄여서 라인 아래로 */
}

.review-avatar-icon {
    width: 22px; /* 24px → 22px 약간 줄이기 */
    height: 22px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    font-size: 11px; /* 12px → 11px */
    /* 완벽한 중앙 정렬 */
    text-align: center;
    line-height: 1;
    position: relative;
}

.review-avatar-icon::before {
    content: "👤";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.review-name {
    font-size: 10px;
    font-weight: 600;
    color: #666;
    /* Courier New 제거 - 시스템 폰트로 통일 */
}

.review-rating {
    font-size: 12px;
    color: #FFD700;
}

.review-text {
    font-size: 13px;
    color: #333;
    line-height: 1.4;
    text-align: center;
    word-break: keep-all;
    max-width: 90%;
    margin-bottom: 20px;
}

.carousel-dots {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 0;
}

.carousel-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ccc;
    transition: all 0.3s ease;
    cursor: pointer;
}

.carousel-dot.active {
    background: #4facfe;
    transform: scale(1.2);
}

@media (max-width: 480px) {
    .profile-screen-container {
        padding-bottom: 100px;
    }
    
    #profileHeader {
        margin: max(20px, env(safe-area-inset-top)) 16px 20px !important;
        padding: 24px 20px !important;
    }
    
    #profileBadgesSection,
    #profileCommunitySection {
        margin: 0 16px 20px !important;
        padding: 20px !important;
    }
    
    .badge-icon {
        font-size: 14px;
    }
    
    .badge-name {
        font-size: 7px;
    }
    
    #profileBadgesGrid {
        gap: 6px !important;
    }
    
    .reviews-carousel {
        height: 120px !important;
    }
    
    .review-text {
        font-size: 12px !important;
    }
}

.level-waves::before,
.level-waves::after {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: 0;
    left: 50%;
    transform: var(--wave-transform, translate(-50%, -75%));
    /* 기타 속성은 그대로 둡니다. */
    background: #000;
}

.level-waves::before {
    border-radius: 45%;
    background: rgb(248, 248, 248);
    animation: wave-slosh 5s ease-in-out infinite alternate;
}

.level-waves::after {
    border-radius: 40%;
    background: rgba(255, 255, 255, .5);
    animation: wave-slosh 10s ease-in-out infinite alternate;
}

@keyframes wave-slosh {
    0% {
        transform: translate(-50%, -75%) translateX(0) translateY(0) rotate(0deg);
    }
    25% {
        transform: translate(-50%, -75%) translateX(-5%) translateY(2.5px) rotate(-5deg);
    }
    50% {
        transform: translate(-50%, -75%) translateX(0) translateY(5px) rotate(0deg);
    }
    75% {
        transform: translate(-50%, -75%) translateX(5%) translateY(2.5px) rotate(5deg);
    }
    100% {
        transform: translate(-50%, -75%) translateX(0) translateY(0) rotate(0deg);
    }
}
</style>
`;

// 레벨시스템 설정 (7단계)
const LEVEL_CONFIG = [
    { level: 1, title: "호흡 새싹", minExp: 0, maxExp: 500, icon: "🌱" },
    { level: 2, title: "호흡 새싹", minExp: 500, maxExp: 1200, icon: "🌱" },
    { level: 3, title: "호흡 나무", minExp: 1200, maxExp: 2200, icon: "🌳" },
    { level: 4, title: "호흡 숲", minExp: 2200, maxExp: 3500, icon: "🌲" },
    { level: 5, title: "호흡 마스터", minExp: 3500, maxExp: 5200, icon: "🧘‍♂️" },
    { level: 6, title: "호흡 달인", minExp: 5200, maxExp: 7500, icon: "🌟" },
    { level: 7, title: "호흡 신", minExp: 7500, maxExp: 999999, icon: "👑" }
];

// 🧠 프로필 대시보드 클래스
class ProfileDashboard {
    constructor() {
        this.userId = null;
        this.supabaseClient = null;
        this.exerciseData = [];
        this.userInfo = null;
        this.reviewCarouselInterval = null;
        this.currentReviewIndex = 0;
    }

    // 🔧 초기화
    async init() {
        this.userId = window.currentUserId;
        this.supabaseClient = window.supabaseClient;
        
        console.log('🙋‍♂️ 프로필 대시보드 초기화:', this.userId);
        
        if (!this.userId || !this.supabaseClient) {
            console.warn('⚠️ 비로그인 상태로 프로필 표시');
        }
        
        return true;
    }

    // 📊 운동 데이터 가져오기
    async fetchExerciseData() {
        if (!this.userId || !this.supabaseClient) {
            this.exerciseData = [];
            return [];
        }

        try {
            const { data, error } = await this.supabaseClient
                .from('exercise_sessions')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ 운동 데이터 조회 실패:', error);
                return [];
            }

            console.log(`✅ ${data?.length || 0}개의 운동 기록 조회 완료`);
            this.exerciseData = data || [];
            return this.exerciseData;

        } catch (err) {
            console.error('❌ 운동 데이터 조회 중 오류:', err);
            return [];
        }
    }

    // 👤 사용자 정보 가져오기
    async fetchUserInfo() {
        // 기존 getUserInfo 함수 재사용
        if (typeof window.getUserInfo === 'function') {
            this.userInfo = await window.getUserInfo();
        } else {
            this.userInfo = {
                nickname: 'AI 숨트레이너',
                isLoggedIn: false
            };
        }
        
        console.log('👤 사용자 정보:', this.userInfo);
        return this.userInfo;
    }

    // 📈 성장 통계 계산


    // 📅 연속 일수 계산
    calculateConsecutiveDays() {
        if (!this.exerciseData.length) return 0;
        
        const dailyGoal = 40; // 하루 목표 호흡 수
        const today = new Date();
        let consecutive = 0;
        
        for (let i = 0; i < 30; i++) { // 최근 30일까지 확인
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            const dayData = this.exerciseData.filter(session => {
                const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
                return sessionDate === dateStr;
            });
            
            const dayBreaths = dayData.reduce((sum, session) => 
                sum + (session.completed_breaths || 0), 0);
            
            if (dayBreaths >= dailyGoal) {
                consecutive++;
            } else {
                break;
            }
        }
        
        return consecutive;
    }

    // 🏆 배지 시스템 (기존 BADGES_CONFIG 15개 사용)
    getBadgesConfig() {
        // 기존 BADGES_CONFIG 15개 그대로 사용
        if (typeof window.BADGES_CONFIG !== 'undefined') {
            return window.BADGES_CONFIG;
        }
        
        // BADGES_CONFIG가 없으면 전역에서 찾기
        if (typeof BADGES_CONFIG !== 'undefined') {
            return BADGES_CONFIG;
        }
        
        console.warn('⚠️ BADGES_CONFIG를 찾을 수 없습니다.');
        return [];
    }

    // 🫁 커뮤니티 리뷰 캐러셀 초기화 (기존 시스템 활용)
    initCommunityCarousel() {
        // 기존 SOCIAL_PROOF_REVIEWS 데이터 활용
        const reviewsData = this.getReviewsData();
        
        // 실시간 통계 업데이트
        this.updateCommunityStats();
        
        // 리뷰 캐러셀 초기화
        this.setupReviewCarousel(reviewsData);
        
        console.log('🫁 커뮤니티 리뷰 캐러셀 초기화 완료');
    }

    // 🫁 리뷰 데이터 가져오기 (기존 SOCIAL_PROOF_REVIEWS 활용)
    getReviewsData() {
        // 기존 SOCIAL_PROOF_REVIEWS가 있으면 사용
        if (typeof window.SOCIAL_PROOF_REVIEWS !== 'undefined') {
            return window.SOCIAL_PROOF_REVIEWS;
        }
        
        // 없으면 기본 리뷰 데이터 제공
        return [
            {
                text: "숨트로 폐활량이 정말 늘었어요!<br>계단 오를 때 숨이 덜 차요 👍",
                author: "brea****(30대)",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "김"
            },
            {
                text: "운동 후 호흡이 훨씬 편해졌습니다.<br>꾸준히 하니까 확실히 달라져요!",
                author: "vita****(30대)", 
                rating: "⭐⭐⭐⭐⭐",
                avatar: "박"
            },
            {
                text: "처음엔 힘들었는데 이제 2단계까지!<br>성취감 최고예요!",
                author: "brea****(30대)",
                rating: "⭐⭐⭐⭐⭐", 
                avatar: "이"
            },
            {
                text: "숨트 앱 덕분에 매일 꾸준히 하게 되네요.<br>UI도 예쁘고 재미있어요!",
                author: "vita****(20대)",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "정"
            },
            {
                text: "호흡근 운동이 이렇게 중요한 줄 몰랐어요.<br>숨트 강력 추천합니다!",
                author: "acti****(30대)",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "최"
            },
            {
                text: "40대 되니까 체력 관리가 정말 중요하더라고요.<br>숨트로 꾸준히 하니까 몸이 가벼워졌어요!",
                author: "brea****(40대)",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "이"
            },
            {
                text: "나이 들어서도 건강하게 살려면 호흡이 기본.<br>매일 10분씩이라도 하니까 확실히 달라져요.",
                author: "brea****(50대)", 
                rating: "⭐⭐⭐⭐⭐",
                avatar: "김"
            },
            {
                text: "손자들과 놀아줄 체력을 위해 시작했는데<br>생각보다 재미있고 효과도 좋네요!",
                author: "vita****(60대)",
                rating: "⭐⭐⭐⭐⭐", 
                avatar: "박"
            },
            {
                text: "복잡한 운동은 힘든데 숨트는 간단해서 좋아요.<br>집에서 편하게 할 수 있어서 만족합니다.",
                author: "acti****(30대)",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "최"
            },
            {
                text: "40년 넘게 살면서 호흡 운동이 이렇게 중요한 줄<br>이제야 알았네요. 늦었지만 열심히 하고 있어요!",
                author: "vita****(40대)",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "정"
            }
        ];
    }

    // 🫁 실시간 통계 업데이트 
    updateCommunityStats() {
        // 기존 generateSmartLiveData 함수 활용
        let liveData;
        if (typeof window.generateSmartLiveData === 'function') {
            liveData = window.generateSmartLiveData();
        } else {
            liveData = this.generateFallbackCommunityData();
        }
        
        // 통계 숫자 업데이트
        const todayActiveEl = document.getElementById('profileTodayActive');
        const totalUsersEl = document.getElementById('profileTotalUsers');
        
        if (todayActiveEl) {
            todayActiveEl.style.visibility = 'visible';
            todayActiveEl.textContent = liveData.todayActive.toLocaleString();
        }
        if (totalUsersEl) {
            totalUsersEl.style.visibility = 'visible';
            totalUsersEl.textContent = liveData.totalUsers.toLocaleString();
        }
    }

    // 🫁 폴백용 커뮤니티 데이터 생성
    generateFallbackCommunityData() {
        return window.communityDataCache.getData();
    }

    // 🫁 리뷰 캐러셀 설정
    setupReviewCarousel(reviewsData) {
        const reviewsSlider = document.getElementById('profileReviewsSlider');
        const carouselDots = document.getElementById('profileCarouselDots');
        
        if (!reviewsSlider || !carouselDots) return;
        
        // 리뷰 카드들 생성
        reviewsSlider.innerHTML = '';
        reviewsData.forEach((review, index) => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            reviewCard.innerHTML = `
                <div class="review-content">
                    <div class="review-header-center" style="display: flex; align-items: center; gap: 6px; justify-content: center; margin-bottom: 8px;">
                        <span class="review-name">${review.author}</span>
                        <span class="review-rating">${review.rating}</span>
                    </div>
                    <div class="review-text">${review.text}</div>
                </div>
            `;
            reviewsSlider.appendChild(reviewCard);
        });
        

        
        // 캐러셀 점들 생성
        // 기존 도트 이벤트 완전 정리
        carouselDots.innerHTML = '';
        reviewsData.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToReview(index));
            carouselDots.appendChild(dot);
        });
        
        // 자동 슬라이드 시작
        this.startReviewAutoSlide(reviewsData.length);
        this.currentReviewIndex = 0;
    }

    // 🫁 특정 리뷰로 이동
    goToReview(index) {
        const reviewsSlider = document.getElementById('profileReviewsSlider');
        const carouselDots = document.getElementById('profileCarouselDots');
        
        if (!reviewsSlider || !carouselDots) return;
        
        this.currentReviewIndex = index;
        
        // 슬라이더 이동 (기존 시스템과 동일)
        reviewsSlider.style.transform = `translateX(-${index * 100}%)`;
        
        // 점 활성화 상태 업데이트
        carouselDots.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // 🫁 자동 슬라이드 시작
    startReviewAutoSlide(totalReviews) {
        // 기존 인터벌 정리 강화
        if (this.reviewCarouselInterval) {
            clearInterval(this.reviewCarouselInterval);
            this.reviewCarouselInterval = null;
        }
        
        // 6000 → 4000으로 변경
        this.reviewCarouselInterval = setInterval(() => {
            this.currentReviewIndex = (this.currentReviewIndex + 1) % totalReviews;
            this.goToReview(this.currentReviewIndex);
        }, 4000);
        
        console.log('🫁 리뷰 자동 슬라이드 시작 (4초 간격)');
    }

    // 📈 오늘 운동 횟수 계산
    getTodayExerciseCount() {
        const today = new Date().toISOString().split('T')[0];
        return this.exerciseData.filter(session => {
            const sessionDate = new Date(session.created_at).toISOString().split('T')[0];
            return sessionDate === today;
        }).length;
    }

    // 🏆 배지 획득 상태 확인 (기존 함수 재사용)
    getEarnedBadges() {
        // 기존 getEarnedBadges 함수 재사용
        if (typeof window.getEarnedBadges === 'function') {
            return window.getEarnedBadges();
        }
        
        // 직접 localStorage에서 가져오기
        try {
            return JSON.parse(localStorage.getItem('earnedBadges') || '[]');
        } catch {
            return [];
        }
    }

    // 🏆 새로운 배지 체크 (프로필탭에서는 사용 안함 - 자동 획득 방지)
    // 이 함수는 운동 완료 후나 퀴즈 완료 후에만 호출되어야 함
    checkAndShowNewBadges() {
        console.log('⚠️ 프로필탭에서는 배지 자동 체크를 하지 않습니다.');
        console.log('💡 배지 획득은 운동 완료 후나 퀴즈 완료 후에만 실행됩니다.');
        
        // 프로필탭에서는 실행하지 않음
        return [];
        

    }



    // 🎨 UI 업데이트
    async updateUI() {
        // 사용자 정보 업데이트
        await this.fetchUserInfo();
        const nicknameEl = document.getElementById('profileNickname');
        if (nicknameEl && this.userInfo) {
            nicknameEl.textContent = this.userInfo.nickname + ' 님';  // "님" 추가
        }

        // 운동 데이터 가져오기
        await this.fetchExerciseData();
        


        // 배지 시스템 업데이트 (표시만, 자동 획득 안함)
        this.updateBadgesDisplay();

        // 커뮤니티 리뷰 캐러셀 초기화 (실제 리뷰 시스템)
        this.initCommunityCarousel();

        // 레벨시스템 업데이트
        await this.updateLevelSystemUI();

    }

    // 🏆 배지 표시 업데이트 (프로필탭용 - 표시만, 획득 로직 제거)
    updateBadgesDisplay() {
        const badgesConfig = this.getBadgesConfig();
        const earnedBadges = this.getEarnedBadges();

        // 배지 수집 진행률 업데이트
        const badgesCountEl = document.getElementById('profileBadgesCount');
        const badgesBarEl = document.getElementById('profileBadgesBar');

        if (badgesCountEl) {
            badgesCountEl.textContent = `${earnedBadges.length}/${badgesConfig.length}`;
        }

        if (badgesBarEl) {
            const percentage = badgesConfig.length > 0 ? (earnedBadges.length / badgesConfig.length) * 100 : 0;
            badgesBarEl.style.width = `${percentage}%`;
        }

        // 배지 그리드 업데이트 (5x3 그리드로 15개 표시)
        const gridEl = document.getElementById('profileBadgesGrid');
        if (!gridEl) return;

        gridEl.innerHTML = badgesConfig.map(badge => {
            const isEarned = earnedBadges.includes(badge.id);
            
            return `
                <div class="badge-item ${isEarned ? 'earned' : 'locked'}" 
                     title="${badge.description}" 
                     data-badge-id="${badge.id}">
                    <div class="badge-icon">${isEarned ? badge.icon : '?'}</div>
                    <div class="badge-name">${isEarned ? badge.name : (badge.hint || badge.name)}</div>
                </div>
            `;
        }).join('');

        console.log('🏆 프로필탭 배지 표시 완료 (금색/회색만 표시)');
    }

    // 🚪 완전한 데이터 삭제 시스템
    async handleLogout() {
        // 1단계: 사용자 확인
        const confirmed = confirm(
            '정말로 모든 데이터를 영구적으로 삭제하시겠습니까?\n\n' +
            '⚠️ 이 작업은 되돌릴 수 없습니다.\n' +
            '다음 데이터가 완전히 삭제됩니다:\n\n' +
            '• 모든 운동 기록 (로컬 + 서버)\n' +
            '• AI 조언 및 분석 데이터\n' +
            '• 동기부여 메시지 기록\n' +
            '• 획득한 배지 및 레벨 정보\n' +
            '• 계정 설정 정보\n\n' +
            '계속하시겠습니까?'
        );

        if (!confirmed) return;

        // 2단계: 추가 확인 (텍스트 입력)
        const deleteConfirmText = prompt(
            '데이터 삭제를 확실히 하시려면 아래 텍스트를 정확히 입력해주세요:\n\n' +
            '"모든 데이터 삭제"\n\n' +
            '입력:'
        );

        if (deleteConfirmText !== '모든 데이터 삭제') {
            alert('입력이 일치하지 않습니다. 삭제가 취소되었습니다.');
            return;
        }

        // 3단계: 로딩 표시
        const originalButton = document.getElementById('logoutButton');
        const originalText = originalButton ? originalButton.textContent : '';
        
        if (originalButton) {
            originalButton.textContent = '삭제 진행 중...';
            originalButton.style.pointerEvents = 'none';
            originalButton.style.opacity = '0.5';
        }

        try {
            // 4단계: 백엔드 데이터 삭제 (트랜잭션)
            await this.deleteAllUserDataFromBackend();
            
            // 5단계: 로컬 데이터 삭제
            this.deleteAllLocalData();
            
            // 6단계: 세션 종료
            await this.signOutUser();
            
            // 7단계: 성공 메시지 및 홈으로 이동
            alert('모든 데이터가 성공적으로 삭제되었습니다.\n새로운 시작을 응원합니다! 🌱');
            
            // 8단계: 홈 탭으로 이동 및 새로고침
            if (typeof window.switchTab === 'function') {
                window.switchTab('home');
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('⌨ 데이터 삭제 중 오류:', error);
            
            // 에러 처리
            if (originalButton) {
                originalButton.textContent = originalText;
                originalButton.style.pointerEvents = 'auto';
                originalButton.style.opacity = '1';
            }
            
            const errorMessage = error.message || '알 수 없는 오류';
            alert(
                `데이터 삭제 중 오류가 발생했습니다:\n${errorMessage}\n\n` +
                '일부 데이터가 삭제되지 않았을 수 있습니다.\n' +
                '네트워크 연결을 확인한 후 다시 시도해주세요.'
            );
        }
    }

    // 백엔드 데이터 삭제 함수 (새로 추가)
    async deleteAllUserDataFromBackend() {
        if (!this.userId || !this.supabaseClient) {
            console.warn('사용자 ID 또는 Supabase 클라이언트가 없습니다.');
            return;
        }

        console.log('🗑️ 백엔드 데이터 삭제 시작:', this.userId);

        try {
            // 트랜잭션으로 안전한 삭제 (순서 중요!)
            
            // 1단계: AI 조언 데이터 삭제 (외래키 제약으로 먼저)
            console.log('1단계: AI 조언 데이터 삭제 중...');
            const { error: aiError } = await this.supabaseClient
                .from('ai_advice')
                .delete()
                .in('session_id', 
                    this.supabaseClient
                        .from('exercise_sessions')
                        .select('id')
                        .eq('user_id', this.userId)
                );
            
            if (aiError) {
                console.error('AI 조언 삭제 실패:', aiError);
                throw new Error(`AI 조언 삭제 실패: ${aiError.message}`);
            }
            
            // 2단계: 동기부여 응답 삭제
            console.log('2단계: 동기부여 응답 삭제 중...');
            const { error: motivationError } = await this.supabaseClient
                .from('motivation_responses')
                .delete()
                .eq('user_id', this.userId);
            
            if (motivationError) {
                console.error('동기부여 응답 삭제 실패:', motivationError);
                throw new Error(`동기부여 응답 삭제 실패: ${motivationError.message}`);
            }
            
            // 3단계: 운동 세션 삭제 (마지막)
            console.log('3단계: 운동 세션 삭제 중...');
            const { error: exerciseError } = await this.supabaseClient
                .from('exercise_sessions')
                .delete()
                .eq('user_id', this.userId);
            
            if (exerciseError) {
                console.error('운동 세션 삭제 실패:', exerciseError);
                throw new Error(`운동 세션 삭제 실패: ${exerciseError.message}`);
            }
            
            console.log('✅ 모든 백엔드 데이터 삭제 완료');
            
        } catch (error) {
            console.error('❌ 백엔드 데이터 삭제 중 오류:', error);
            throw error;
        }
    }

    // 로컬 데이터 삭제 함수 (새로 추가)
    deleteAllLocalData() {
        console.log('🗑️ 로컬 데이터 삭제 시작');
        
        try {
            // localStorage 완전 초기화
            localStorage.clear();
            
            // 전역 변수 초기화
            window.currentUserId = null;
            window.currentUserInfo = null;
            

            
            console.log('✅ 로컬 데이터 삭제 완료');
            
        } catch (error) {
            console.error('❌ 로컬 데이터 삭제 중 오류:', error);
            throw error;
        }
    }

    // 사용자 로그아웃 함수 (새로 추가)
    async signOutUser() {
        console.log('🚪 사용자 로그아웃 시작');
        
        try {
            if (this.supabaseClient) {
                await this.supabaseClient.auth.signOut();
            }
            
            console.log('✅ 사용자 로그아웃 완료');
            
        } catch (error) {
            console.error('❌ 로그아웃 중 오류:', error);
            // 로그아웃 실패는 치명적이지 않으므로 에러를 던지지 않음
        }
    }

    // 🎮 레벨시스템 - 사용자 레벨 데이터 조회
    async fetchUserLevelData() {
        if (!this.userId || !this.supabaseClient) {
            return {
                total_exp: 0,
                current_level: 1,
                level_title: '호흡 새싹',
                daily_exp: 0,
                weekly_exp: 0
            };
        }

        try {
            // user_levels 테이블에서 현재 레벨 데이터 조회
            const { data: levelData, error: levelError } = await this.supabaseClient
                .from('user_levels')
                .select('*')
                .eq('user_id', this.userId)
                .single();

            if (levelError) {
                if (levelError.code === 'PGRST116') {
                    // 데이터가 없으면 자동 초기화
                    console.log('레벨 데이터가 없습니다. 자동 초기화를 시작합니다.');
                    const initialized = await this.initializeUserLevel();
                    
                    if (initialized) {
                        // 초기화 성공 시 다시 조회
                        const { data: newLevelData, error: retryError } = await this.supabaseClient
                            .from('user_levels')
                            .select('*')
                            .eq('user_id', this.userId)
                            .single();
                            
                        if (!retryError && newLevelData) {
                            levelData = newLevelData;
                        } else {
                            console.error('초기화 후 재조회 실패:', retryError);
                            return this.getDefaultLevelData();
                        }
                    } else {
                        return this.getDefaultLevelData();
                    }
                } else {
                    console.error('레벨 데이터 조회 실패:', levelError);
                    return this.getDefaultLevelData();
                }
            }

            // user_exp_events에서 경험치 분류별 총합 조회
            const { data: expEvents, error: expError } = await this.supabaseClient
                .from('user_exp_events')
                .select('event_type, exp_amount')
                .eq('user_id', this.userId);

            if (expError) {
                console.error('경험치 이벤트 조회 실패:', expError);
            }

            // 일일미션과 주간챌린지 경험치 분류
            const daily_exp = (expEvents || [])
                .filter(event => event.event_type === 'daily_mission')
                .reduce((sum, event) => sum + event.exp_amount, 0);

            const weekly_exp = (expEvents || [])
                .filter(event => event.event_type === 'weekly_challenge')
                .reduce((sum, event) => sum + event.exp_amount, 0);

            return {
                total_exp: levelData?.total_exp || 0,
                current_level: levelData?.current_level || 1,
                level_title: levelData?.level_title || '호흡 새싹',
                daily_exp,
                weekly_exp
            };

        } catch (error) {
            console.error('레벨 데이터 조회 중 오류:', error);
            return this.getDefaultLevelData();
        }
    }

    // 🎮 레벨시스템 - 사용자 레벨 데이터 자동 초기화
    async initializeUserLevel() {
        if (!this.userId || !this.supabaseClient) {
            console.warn('사용자 ID 또는 Supabase 클라이언트가 없어 초기화할 수 없습니다.');
            return false;
        }

        try {
            console.log('사용자 레벨 데이터 자동 초기화 시작:', this.userId);
            
            const { data, error } = await this.supabaseClient
                .from('user_levels')
                .insert({
                    user_id: this.userId,
                    total_exp: 0,
                    current_level: 1,
                    level_title: '호흡 새싹'
                })
                .select()
                .single();

            if (error) {
                console.error('레벨 데이터 초기화 실패:', error);
                return false;
            }

            console.log('레벨 데이터 초기화 성공:', data);
            return true;

        } catch (error) {
            console.error('레벨 데이터 초기화 중 오류:', error);
            return false;
        }
    }

    // 🎮 레벨시스템 - 기본 레벨 데이터 반환
    getDefaultLevelData() {
        return {
            total_exp: 0,
            current_level: 1,
            level_title: '호흡 새싹',
            daily_exp: 0,
            weekly_exp: 0
        };
    }

    // 🎮 레벨시스템 - 경험치로 레벨 계산
    calculateLevelFromExp(totalExp) {
        const levelConfig = LEVEL_CONFIG.find(config => 
            totalExp >= config.minExp && totalExp < config.maxExp
        ) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1]; // 최고 레벨 처리

        const currentExp = totalExp - levelConfig.minExp;
        const requiredExp = levelConfig.maxExp === 999999 ? 0 : levelConfig.maxExp - levelConfig.minExp;
        const progress = requiredExp > 0 ? Math.round((currentExp / requiredExp) * 100) : 100;

        return {
            level: levelConfig.level,
            title: levelConfig.title,
            icon: levelConfig.icon,
            currentExp: totalExp,
            levelMinExp: levelConfig.minExp,
            levelMaxExp: levelConfig.maxExp,
            progressExp: currentExp,
            requiredExp: requiredExp,
            progress: Math.min(progress, 100)
        };
    }

    // 🎮 레벨시스템 - UI 업데이트
    async updateLevelSystemUI() {
        const levelData = await this.fetchUserLevelData();
        const levelInfo = this.calculateLevelFromExp(levelData.total_exp);

        // 레벨 아바타 업데이트
        const levelAvatar = document.getElementById('levelAvatar');
        if (levelAvatar) {
            levelAvatar.textContent = `Lv.${levelInfo.level}`;
        }

        // 레벨 타이틀 업데이트
        const levelTitle = document.getElementById('levelTitle');
        if (levelTitle) {
            levelTitle.textContent = levelInfo.title;
        }

        // 진행률 업데이트
        const levelProgress = document.getElementById('levelProgress');
        if (levelProgress) {
            if (levelInfo.level === 7) {
                levelProgress.textContent = `${levelInfo.currentExp} EXP (최고레벨)`;
            } else {
                levelProgress.textContent = `${levelInfo.progressExp} / ${levelInfo.requiredExp} EXP`;
            }
        }

        // 퍼센트 업데이트
        const levelPercentage = document.getElementById('levelPercentage');
        if (levelPercentage) {
            levelPercentage.textContent = `${levelInfo.progress}%`;
        }

        // 프로그레스 바 업데이트
        const levelProgressBar = document.getElementById('levelProgressBar');
        if (levelProgressBar) {
            levelProgressBar.style.width = `${levelInfo.progress}%`;
        }

        // 경험치 표시 업데이트
        const dailyExpAmount = document.getElementById('dailyExpAmount');
        if (dailyExpAmount) {
            dailyExpAmount.textContent = levelData.daily_exp.toLocaleString();
        }

        const weeklyExpAmount = document.getElementById('weeklyExpAmount');
        if (weeklyExpAmount) {
            weeklyExpAmount.textContent = levelData.weekly_exp.toLocaleString();
        }

        console.log('🎮 레벨시스템 UI 업데이트 완료:', levelInfo);

        // 경험치 진행률에 따른 물 높이 계산 및 적용
        const levelWaves = document.querySelector('.level-waves');
        if (levelWaves && levelInfo) {
            // 현재 레벨에서의 경험치 진행률 계산
            const currentLevelMinExp = levelInfo.levelMinExp || 0;
            const currentLevelMaxExp = levelInfo.levelMaxExp || 500;
            const currentLevelExp = Math.max(0, levelData.total_exp - currentLevelMinExp);
            const levelExpRange = currentLevelMaxExp - currentLevelMinExp;
            const progressPercent = Math.min(100, Math.max(0, (currentLevelExp / levelExpRange) * 100));
            
            // 물 높이 설정 - 최소/최대 크기 제한으로 자연스럽게 조정
            let adjustedSize;

            if (progressPercent <= 20) {
                // 20% 이하: 최소 크기 유지 (20% 고정)
                adjustedSize = 20;
            } else if (progressPercent >= 80) {
                // 80% 이상: 높은 정확도로 크기 조정 (80% ~ 180%)
                adjustedSize = 80 + ((progressPercent - 80) / 20) * 100;
            } else {
                // 20% ~ 80%: 선형적 크기 조정 (20% ~ 80%)
                adjustedSize = 80 + ((progressPercent - 20) / 60) * 60;
            }

            // 물 높이와 넓이 설정 - 단계별 조정으로 자연스럽게
            let adjustedHeight, adjustedWidth, leftPosition;

            if (progressPercent <= 50) {
                // 50% 이하: 높이는 선형 증가, 넓이는 100% 유지
                adjustedHeight = (progressPercent / 50) * 100; // 0% ~ 100%
                adjustedWidth = 100;
                leftPosition = 0;
            } else {
                // 50% 이상: 높이와 넓이 모두 증가
                adjustedHeight = 100 + ((progressPercent - 50) / 50) * 80; // 100% ~ 180%
                adjustedWidth = 100 + ((progressPercent - 50) / 50) * 50; // 100% ~ 150%
                leftPosition = (100 - adjustedWidth) / 2; // 중앙 정렬
            }

            levelWaves.style.height = `${adjustedHeight}%`;
            levelWaves.style.width = `${adjustedWidth}%`;
            levelWaves.style.left = `${leftPosition}%`;

            console.log('경험치:', progressPercent + '%');
            console.log('적용된 높이:', adjustedHeight + '%');
            console.log('적용된 넓이:', adjustedWidth + '%');
            console.log('왼쪽 위치:', leftPosition + '%');

            // 파도를 물 높이보다 살짝 위에 위치시켜 입체감 연출
            const baseWavePosition = -75 + (progressPercent / 100) * 50; // 기본 위치
            const waveYPosition = baseWavePosition - 10; // 물보다 10% 위에 위치
            const waveTransform = `translate(-50%, ${waveYPosition}%)`;
                
            levelWaves.style.setProperty('--wave-transform', waveTransform);

            console.log('물 높이:', adjustedHeight + '%');
            console.log('파도 위치:', waveYPosition + '% (물보다 위)');
            
            console.log(`경험치 연동: ${levelData.total_exp}/${currentLevelMaxExp} (${progressPercent.toFixed(1)}%)`);
        }

        return levelInfo;
    }

    // 🎁 레벨시스템 - 일일미션 경험치 지급
    async awardDailyMissionExp() {
        if (!this.userId || !this.supabaseClient) {
            console.warn('사용자 ID 또는 Supabase 클라이언트가 없습니다.');
            return false;
        }

        try {
            // 오늘 이미 일일미션 경험치를 받았는지 확인
            const today = new Date().toISOString().split('T')[0];
            const { data: todayExp, error: checkError } = await this.supabaseClient
                .from('user_exp_events')
                .select('id')
                .eq('user_id', this.userId)
                .eq('event_type', 'daily_mission')
                .gte('achieved_at', today + 'T00:00:00Z')
                .lt('achieved_at', today + 'T23:59:59Z');

            if (checkError) {
                console.error('일일미션 중복 체크 실패:', checkError);
                return false;
            }

            if (todayExp && todayExp.length > 0) {
                console.log('오늘 이미 일일미션 경험치를 받았습니다.');
                return false;
            }

            // 경험치 이벤트 추가
            const { data: expEvent, error: expError } = await this.supabaseClient
                .from('user_exp_events')
                .insert({
                    user_id: this.userId,
                    event_type: 'daily_mission',
                    exp_amount: 50
                })
                .select();

            if (expError) {
                console.error('일일미션 경험치 추가 실패:', expError);
                return false;
            }

            // 사용자 레벨 데이터 업데이트
            await this.updateUserLevelData(50);
            
            // UI 업데이트
            await this.updateLevelSystemUI();

            console.log('✅ 일일미션 경험치 50 EXP 지급 완료!');
            return true;

        } catch (error) {
            console.error('일일미션 경험치 지급 중 오류:', error);
            return false;
        }
    }

    // 🎁 레벨시스템 - 주간챌린지 경험치 지급
    async awardWeeklyChallengeExp() {
        if (!this.userId || !this.supabaseClient) {
            console.warn('사용자 ID 또는 Supabase 클라이언트가 없습니다.');
            return false;
        }

        try {
            // 이번 주에 이미 주간챌린지 경험치를 받았는지 확인
            const now = new Date();
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            const { data: weekExp, error: checkError } = await this.supabaseClient
                .from('user_exp_events')
                .insert({
                    user_id: this.userId,
                    event_type: 'weekly_challenge',
                    exp_amount: 300
                })
                .select();

            if (expError) {
                console.error('주간챌린지 경험치 추가 실패:', expError);
                return false;
            }

            // 사용자 레벨 데이터 업데이트
            await this.updateUserLevelData(300);
            
            // UI 업데이트
            await this.updateLevelSystemUI();

            console.log('✅ 주간챌린지 경험치 300 EXP 지급 완료!');
            return true;

        } catch (error) {
            console.error('주간챌린지 경험치 지급 중 오류:', error);
            return false;
        }
    }

    // 🎁 레벨시스템 - 사용자 레벨 데이터 업데이트
    async updateUserLevelData(addExp) {
        try {
            // 현재 레벨 데이터 조회
            const { data: currentLevel, error: selectError } = await this.supabaseClient
                .from('user_levels')
                .select('*')
                .eq('user_id', this.userId)
                .single();

            const newTotalExp = (currentLevel?.total_exp || 0) + addExp;
            const newLevelInfo = this.calculateLevelFromExp(newTotalExp);

            if (currentLevel) {
                // 기존 데이터 업데이트
                const { error: updateError } = await this.supabaseClient
                    .from('user_levels')
                    .update({
                        total_exp: newTotalExp,
                        current_level: newLevelInfo.level,
                        level_title: newLevelInfo.title,
                        last_updated: new Date().toISOString()
                    })
                    .eq('user_id', this.userId);

                if (updateError) {
                    console.error('레벨 데이터 업데이트 실패:', updateError);
                }
            } else {
                // 새 데이터 생성
                const { error: insertError } = await this.supabaseClient
                    .from('user_levels')
                    .insert({
                        user_id: this.userId,
                        total_exp: newTotalExp,
                        current_level: newLevelInfo.level,
                        level_title: newLevelInfo.title
                    });

                if (insertError) {
                    console.error('레벨 데이터 생성 실패:', insertError);
                }
            }

            console.log(`💫 레벨 데이터 업데이트: +${addExp} EXP (총 ${newTotalExp} EXP)`);

        } catch (error) {
            console.error('레벨 데이터 업데이트 중 오류:', error);
        }
    }

    // 🧹 정리
    destroy() {
        // 이벤트 리스너 정리
        const logoutBtn = document.getElementById('logoutButton');
        if (logoutBtn) {
            logoutBtn.removeEventListener('click', this.handleLogout);
        }
        
        // 리뷰 캐러셀 인터벌 정리
        if (this.reviewCarouselInterval) {
            clearInterval(this.reviewCarouselInterval);
            this.reviewCarouselInterval = null;
            console.log('🫁 리뷰 캐러셀 자동 슬라이드 정리');
        }
    }
}

// 🚀 프로필 대시보드 초기화 함수
async function initProfileDashboard() {
    console.log('🙋‍♂️ 프로필 대시보드 초기화 시작...');
    
    const profileScreen = document.getElementById('profileScreen');
    if (!profileScreen) {
        console.error('❌ profileScreen을 찾을 수 없습니다.');
        return;
    }

    // CSS 먼저 삽입 후 HTML 렌더링 (즉시)
    document.head.insertAdjacentHTML('beforeend', PROFILE_CSS);
    profileScreen.innerHTML = PROFILE_HTML;
    
    // 대시보드 초기화 및 UI 업데이트
    const dashboard = new ProfileDashboard();
    await dashboard.init();
    await dashboard.updateUI();
    
    // 이벤트 리스너 등록
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => dashboard.handleLogout());
    }

    // 전역 변수 등록
    window.profileDashboard = dashboard;
    
    console.log('✅ 프로필 대시보드 초기화 완료 (배지 + 리뷰 캐러셀 연동)');
}

// 🔧 전역 함수 등록
window.initProfileTab = initProfileDashboard;
window.onProfileTabClick = initProfileDashboard;

// 레벨시스템 전역 함수 등록
window.awardDailyExp = async function() {
    if (!window.profileDashboard) {
        console.warn('ProfileDashboard가 초기화되지 않았습니다.');
        return false;
    }
    
    console.log('일일미션 경험치 지급 시작...');
    const result = await window.profileDashboard.awardDailyMissionExp();
    return result;
};

window.awardWeeklyExp = async function() {
    if (!window.profileDashboard) {
        console.warn('ProfileDashboard가 초기화되지 않았습니다.');
        return false;
    }
    
    console.log('주간챌린지 경험치 지급 시작...');
    const result = await window.profileDashboard.awardWeeklyChallengeExp();
    return result;
};

console.log('🙋‍♂️ 프로필탭 모듈 로드 완료');

// 🔄 커뮤니티 데이터 캐싱 시스템 (마스터)
window.communityDataCache = {
    data: null,
    timestamp: null,
    cacheTime: 5 * 60 * 1000, // 5분 캐시
    
    getData: function() {
        const now = Date.now();
        
        // 캐시가 없거나 만료되었으면 새로 생성
        if (!this.data || !this.timestamp || (now - this.timestamp) > this.cacheTime) {
            this.data = this.generateData();
            this.timestamp = now;
            console.log('🔄 새로운 커뮤니티 데이터 생성 (5분 캐시):', this.data);
        }
        
        return this.data;
    },
    
    generateData: function() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        // 새로운 기준: 2025년 8월 28일부터 300명 시작
        const startDate = new Date('2025-08-28');
        const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        
        // 사이클 계산 (증가 → 감소 → 증가 반복)
        const maxUsers = 14980;
        const minUsers = 14700;
        const growthDays = Math.floor((maxUsers - 300) / 6.5); // 평균 6.5명씩 증가
        const declineDays = 7; // 7일간 감소
        const cycleDays = growthDays + declineDays;
        
        const cyclePosition = daysSinceStart % cycleDays;
        let totalUsers;
        
        if (cyclePosition < growthDays) {
            // 증가 단계: 300명부터 시작해서 4-9명씩 증가
            const growthDay = cyclePosition;
            const baseGrowth = 300 + (growthDay * 6.5); // 평균 증가
            const randomFactor = (Math.random() - 0.5) * 2.5; // ±1.25 변동
            totalUsers = Math.min(Math.floor(baseGrowth + randomFactor), maxUsers);
        } else {
            // 감소 단계: 7일간 14980 → 14700으로 감소
            const declineDay = cyclePosition - growthDays;
            const declineAmount = ((maxUsers - minUsers) / declineDays) * declineDay;
            totalUsers = Math.floor(maxUsers - declineAmount);
        }
        
        // 시간대별 활성도 패턴 (기존 유지)
        let hourMultiplier = 1.0;
        if (hour >= 6 && hour <= 8) hourMultiplier = 1.2;
        else if (hour >= 19 && hour <= 21) hourMultiplier = 1.5;
        else if (hour >= 9 && hour <= 17) hourMultiplier = 0.8;
        else if (hour >= 0 && hour <= 5) hourMultiplier = 0.3;
        else hourMultiplier = 0.9;
        
        // 요일별 패턴 (기존 유지)
        let dayMultiplier = 1.0;
        if (day === 0) dayMultiplier = 0.7;
        else if (day === 6) dayMultiplier = 0.8;
        else if (day >= 1 && day <= 5) dayMultiplier = 1.0;
        
        // 일일 활성 사용자 계산 (18% 기준)
        const baseDailyActive = Math.floor(totalUsers * 0.18);
        const todayActive = Math.floor(baseDailyActive * hourMultiplier * dayMultiplier);
        
        // 최종 범위 제한
        const finalTodayActive = Math.max(54, Math.min(todayActive, Math.floor(totalUsers * 0.25)));
        const finalTotalUsers = Math.max(300, totalUsers);
        
        return {
            todayActive: finalTodayActive,
            totalUsers: finalTotalUsers,
            isGrowing: cyclePosition < growthDays
        };
    }
};

// 🌐 전역 커뮤니티 데이터 제공 함수
window.getCommunityStats = function() {
    return window.communityDataCache.getData();
};
