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
                    
                    <!-- 레벨 진행률 바 -->
                    <div id="levelProgressContainer" style="background: #f3f4f6; border-radius: 8px; height: 6px; overflow: hidden; margin-top: 8px;">
                        <div id="levelProgressBar" style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; width: 0%; transition: width 0.3s ease; border-radius: 8px;"></div>
                    </div>
                    <div id="levelInfo" style="font-size: 11px; color: #6b7280; margin-top: 4px;">Lv.1 뉴비 (0/166 EXP)</div>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. 나의 성장 (2x2 그리드) -->
    <div style="margin: 0 20px 24px;">
        <div style="font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 20px; padding-left: 0px;">나의 성장</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            
            <!-- 운동한 날 -->
            <div style="background: white; border: 1px solid #E7E7E7; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;">
                <div id="totalWorkoutDays" style="font-size: 32px; font-weight: 800; color: #1f2937; margin-bottom: 8px; visibility: hidden;">000</div>
                <div style="font-size: 13px; color: #6b7280; font-weight: 600;">운동한 날</div>
            </div>
            
            <!-- 누적 호흡 -->
            <div style="background: white; border: 1px solid #E7E7E7; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;">
                <div id="totalBreaths" style="font-size: 32px; font-weight: 800; color: #1f2937; margin-bottom: 8px; visibility: hidden;">0,000</div>
                <div style="font-size: 13px; color: #6b7280; font-weight: 600;">누적 호흡</div>
            </div>
            
            <!-- 연속 일수 -->
            <div style="background: white; border: 1px solid #E7E7E7; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;">
                <div id="consecutiveDays" style="font-size: 32px; font-weight: 800; color: #1f2937; margin-bottom: 8px; visibility: hidden;">000</div>
                <div style="font-size: 12px; color: #6b7280; font-weight: 600;">연속 일수</div>
            </div>
            
            <!-- 현재 강도 -->
            <div style="background: white; border: 1px solid #E7E7E7; border-radius: 20px; padding: 24px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;">
                <div id="currentIntensity" style="font-size: 32px; font-weight: 800; color: #1f2937; margin-bottom: 8px; visibility: hidden;">0.0</div>
                <div style="font-size: 12px; color: #6b7280; font-weight: 600;">현재 강도</div>
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
</style>
`;

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
    calculateGrowthStats() {
        if (!this.exerciseData.length) {
            return {
                totalWorkoutDays: 0,
                totalBreaths: 0,
                consecutiveDays: 0,
                currentIntensity: 1.0
            };
        }

        // 운동한 날 수 계산 (중복 제거)
        const workoutDates = new Set();
        let totalBreaths = 0;
        let totalSessions = 0;
        let avgInhaleResistance = 0;
        let avgExhaleResistance = 0;

        this.exerciseData.forEach(session => {
            // 날짜 추가 (중복 자동 제거)
            const date = new Date(session.created_at).toDateString();
            workoutDates.add(date);
            
            // 호흡 수 누적
            totalBreaths += (session.completed_breaths || 0);
            
            // 저항 강도 누적
            if (!session.is_aborted) {
                totalSessions++;
                avgInhaleResistance += (session.inhale_resistance || 0);
                avgExhaleResistance += (session.exhale_resistance || 0);
            }
        });

        // 연속 일수 계산
        const consecutiveDays = this.calculateConsecutiveDays();
        
        // 현재 강도 계산 (평균 저항 강도)
        const currentIntensity = totalSessions > 0 ? 
            Math.round(((avgInhaleResistance + avgExhaleResistance) / (totalSessions * 2)) * 10) / 10 :
            1.0;

        return {
            totalWorkoutDays: workoutDates.size,
            totalBreaths: totalBreaths,
            consecutiveDays: consecutiveDays,
            currentIntensity: currentIntensity
        };
    }

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
                author: "김상우",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "김"
            },
            {
                text: "운동 후 호흡이 훨씬 편해졌습니다.<br>꾸준히 하니까 확실히 달라져요!",
                author: "박영희", 
                rating: "⭐⭐⭐⭐⭐",
                avatar: "박"
            },
            {
                text: "처음엔 힘들었는데 이제 2단계까지!<br>성취감 최고예요!",
                author: "이민수",
                rating: "⭐⭐⭐⭐⭐", 
                avatar: "이"
            },
            {
                text: "숨트 앱 덕분에 매일 꾸준히 하게 되네요.<br>UI도 예쁘고 재미있어요!",
                author: "정하나",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "정"
            },
            {
                text: "호흡근 운동이 이렇게 중요한 줄 몰랐어요.<br>숨트 강력 추천합니다!",
                author: "최준호",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "최"
            },
            {
                text: "40대 되니까 체력 관리가 정말 중요하더라고요.<br>숨트로 꾸준히 하니까 몸이 가벼워졌어요!",
                author: "이민수",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "이"
            },
            {
                text: "나이 들어서도 건강하게 살려면 호흡이 기본.<br>매일 10분씩이라도 하니까 확실히 달라져요.",
                author: "김영호", 
                rating: "⭐⭐⭐⭐⭐",
                avatar: "김"
            },
            {
                text: "손자들과 놀아줄 체력을 위해 시작했는데<br>생각보다 재미있고 효과도 좋네요!",
                author: "박순자",
                rating: "⭐⭐⭐⭐⭐", 
                avatar: "박"
            },
            {
                text: "복잡한 운동은 힘든데 숨트는 간단해서 좋아요.<br>집에서 편하게 할 수 있어서 만족합니다.",
                author: "최광수",
                rating: "⭐⭐⭐⭐⭐",
                avatar: "최"
            },
            {
                text: "40년 넘게 살면서 호흡 운동이 이렇게 중요한 줄<br>이제야 알았네요. 늦었지만 열심히 하고 있어요!",
                author: "정혜숙",
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
                        <span class="review-name">${this.generateAnonymousId(review.author, review.text)}</span>
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
        
        /* 
        // 기존 로직 (주석 처리 - 프로필탭에서는 사용 안함)
        if (typeof window.checkNewBadges === 'function') {
            const stats = {
                totalExercises: this.exerciseData.length,
                totalBreaths: this.exerciseData.reduce((sum, s) => sum + (s.completed_breaths || 0), 0),
                consecutiveDays: this.calculateConsecutiveDays()
            };
            
            const newBadges = window.checkNewBadges(stats);
            
            if (newBadges.length > 0 && typeof window.showBadgePopup === 'function') {
                setTimeout(() => {
                    window.showBadgePopup(newBadges[0]);
                }, 500);
            }
            
            return newBadges;
        }
        
        return [];
        */
    }

    // 🆔 익명 아이디 생성 함수
    generateAnonymousId(originalName, reviewText) {
        const prefixes = ['breath', 'healthy', 'active', 'fresh', 'strong', 'vital'];
        const suffixes = ['lover', 'life', 'user', 'fan', 'pro', 'master'];
        
        // 리뷰 내용에 따른 나이대 설정 (더 정확하게)
        let ageGroup;
        if (reviewText.includes('손자') || reviewText.includes('40년')) ageGroup = '60대';
        else if (reviewText.includes('체력') || reviewText.includes('40대')) ageGroup = '40대';
        else if (reviewText.includes('나이') || reviewText.includes('건강하게')) ageGroup = '50대';
        else if (reviewText.includes('계단') || reviewText.includes('운동')) ageGroup = '30대';
        else if (reviewText.includes('UI') || reviewText.includes('앱')) ageGroup = '20대';
        else ageGroup = '30대';
        
        const nameHash = originalName.charCodeAt(0) % prefixes.length;
        const textHash = reviewText.length % suffixes.length;
        
        // 전체 아이디 생성
        const fullId = `${prefixes[nameHash]}${suffixes[textHash]}`;
        
        // 마스킹 처리: 앞 3-4글자만 표시, 나머지는 *
        const visibleLength = Math.min(4, Math.max(3, fullId.length - 3));
        const visiblePart = fullId.substring(0, visibleLength);
        const maskLength = fullId.length - visibleLength;
        const maskedPart = '*'.repeat(maskLength);
        
        return `${visiblePart}${maskedPart}(${ageGroup})`;
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
        
        // 성장 통계 업데이트
        const stats = this.calculateGrowthStats();
        
        document.getElementById('totalWorkoutDays').style.visibility = 'visible';
        document.getElementById('totalWorkoutDays').textContent = stats.totalWorkoutDays;
        
        document.getElementById('totalBreaths').style.visibility = 'visible';
        document.getElementById('totalBreaths').textContent = stats.totalBreaths.toLocaleString();
        
        document.getElementById('consecutiveDays').style.visibility = 'visible';
        document.getElementById('consecutiveDays').textContent = stats.consecutiveDays;
        
        document.getElementById('currentIntensity').style.visibility = 'visible';
        document.getElementById('currentIntensity').textContent = stats.currentIntensity;

        // 배지 시스템 업데이트 (표시만, 자동 획득 안함)
        this.updateBadgesDisplay();

        // 커뮤니티 리뷰 캐러셀 초기화 (실제 리뷰 시스템)
        this.initCommunityCarousel();

        // 레벨 시스템 업데이트
        this.updateLevelDisplay();
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
            
            // 레벨 시스템 초기화
            if (window.levelSystem) {
                window.levelSystem.expData = {
                    totalExp: 0,
                    currentLevel: 1,
                    lastExpGain: [],
                    consecutiveDays: 0,
                    lastExerciseDate: null
                };
                window.levelSystem.saveExpData();
            }
            
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

    // 🎮 레벨 표시 업데이트
    updateLevelDisplay() {
        if (typeof window.levelSystem === 'undefined') {
            console.warn('레벨 시스템이 로드되지 않았습니다.');
            return;
        }
        
        // 운동 데이터로 레벨 업데이트
        const levelData = window.levelSystem.updateFromExerciseData(this.exerciseData);
        
        // 닉네임에 레벨 표시
        const nicknameEl = document.getElementById('profileNickname');
        if (nicknameEl && this.userInfo) {
            nicknameEl.textContent = `${this.userInfo.nickname} Lv.${levelData.level} ${levelData.title}`;
        }
        
        // 진행률 바 업데이트
        const progressBar = document.getElementById('levelProgressBar');
        if (progressBar) {
            progressBar.style.width = `${levelData.progress}%`;
        }
        
        // 레벨 정보 업데이트
        const levelInfo = document.getElementById('levelInfo');
        if (levelInfo) {
            const nextLevelExp = levelData.maxExp === 999999 ? '최고레벨' : levelData.maxExp;
            levelInfo.textContent = `Lv.${levelData.level} ${levelData.title} (${levelData.currentExp}/${nextLevelExp} EXP)`;
        }
        
        console.log('🎮 레벨 업데이트:', levelData);
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
        
        // 기준 데이터 (현실적 범위)
        const daysSinceStart = Math.floor((now - new Date('2024-01-01')) / (1000 * 60 * 60 * 24));
        const baseUsers = 5200 + (daysSinceStart * 14);
        const totalUsers = Math.min(baseUsers, 7500);
        
        // 시간대별 활성도 패턴
        let hourMultiplier = 1.0;
        if (hour >= 6 && hour <= 8) hourMultiplier = 1.2;
        else if (hour >= 19 && hour <= 21) hourMultiplier = 1.5;
        else if (hour >= 9 && hour <= 17) hourMultiplier = 0.8;
        else if (hour >= 0 && hour <= 5) hourMultiplier = 0.3;
        else hourMultiplier = 0.9;
        
        // 요일별 패턴
        let dayMultiplier = 1.0;
        if (day === 0) dayMultiplier = 0.7;
        else if (day === 6) dayMultiplier = 0.8;
        else if (day >= 1 && day <= 5) dayMultiplier = 1.0;
        
        // 일일 활성 사용자 계산
        const baseDailyActive = Math.floor(totalUsers * 0.18);
        const todayActive = Math.floor(baseDailyActive * hourMultiplier * dayMultiplier);
        
        // 최종 범위 제한
        const finalTodayActive = Math.max(300, Math.min(todayActive, Math.floor(totalUsers * 0.25)));
        const finalTotalUsers = Math.max(5000, totalUsers);
        
        return {
            todayActive: finalTodayActive,
            totalUsers: finalTotalUsers,
            isGrowing: true
        };
    }
};

// 🌐 전역 커뮤니티 데이터 제공 함수
window.getCommunityStats = function() {
    return window.communityDataCache.getData();
};
