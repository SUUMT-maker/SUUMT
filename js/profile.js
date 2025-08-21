// 🙋‍♂️ 프로필탭 인라인 구현 (dashboard.js 패턴)
// ✨ 실시간 리뷰 캐러셀, 배지 시스템, 성장 통계 포함

// 📱 프로필탭 HTML 구조
const PROFILE_HTML = `
<div class="profile-screen-container">
    
    <!-- 1. 프로필 헤더 -->
    <div id="profileHeader" style="background: white; border: 1px solid #E7E7E7; border-radius: 32px; padding: 32px 24px; margin: max(40px, env(safe-area-inset-top)) 20px 24px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; color: white;">👤</div>
            <div>
                <div id="profileNickname" style="font-size: 24px; font-weight: 700; color: #1E1E1E; margin-bottom: 4px;">AI 숨트레이너</div>
                <div style="font-size: 14px; color: #6B7280;">환영합니다!</div>
            </div>
        </div>
    </div>

    <!-- 2. 나의 성장 (2x2 그리드) -->
    <div style="margin: 0 20px 24px;">
        <div style="font-size: 18px; font-weight: 600; color: #1E1E1E; margin-bottom: 16px; padding-left: 4px;">📈 나의 성장</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            
            <!-- 운동한 날 -->
            <div style="background: white; border: 1px solid #E7E7E7; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
                <div id="totalWorkoutDays" style="font-size: 28px; font-weight: 800; color: #3B82F6; margin-bottom: 8px;">0</div>
                <div style="font-size: 12px; color: #6B7280; font-weight: 500;">운동한 날</div>
            </div>
            
            <!-- 누적 호흡 -->
            <div style="background: white; border: 1px solid #E7E7E7; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
                <div id="totalBreaths" style="font-size: 28px; font-weight: 800; color: #22C55E; margin-bottom: 8px;">0</div>
                <div style="font-size: 12px; color: #6B7280; font-weight: 500;">누적 호흡</div>
            </div>
            
            <!-- 연속 일수 -->
            <div style="background: white; border: 1px solid #E7E7E7; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
                <div id="consecutiveDays" style="font-size: 28px; font-weight: 800; color: #F59E0B; margin-bottom: 8px;">0</div>
                <div style="font-size: 12px; color: #6B7280; font-weight: 500;">연속 일수</div>
            </div>
            
            <!-- 현재 강도 -->
            <div style="background: white; border: 1px solid #E7E7E7; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">
                <div id="currentIntensity" style="font-size: 28px; font-weight: 800; color: #8B5CF6; margin-bottom: 8px;">1.0</div>
                <div style="font-size: 12px; color: #6B7280; font-weight: 500;">현재 강도</div>
            </div>
            
        </div>
    </div>

    <!-- 3. 배지 컬렉션 -->
    <div id="profileBadgesSection" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <span style="font-size: 24px;">🏆</span>
            <span style="font-size: 18px; font-weight: 600; color: #1E1E1E;">배지 컬렉션</span>
        </div>
        <div id="profileBadgesProgress" style="font-size: 14px; color: #6B7280; margin-bottom: 16px;">수집한 배지: 0/15</div>
        <div id="profileBadgesGrid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
            <!-- 15개 배지들이 JavaScript로 생성됨 (5x3 그리드) -->
        </div>
    </div>

    <!-- 4. 숨트 커뮤니티 (리뷰 캐러셀 시스템) -->
    <div id="profileCommunitySection" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <span style="font-size: 24px;">🫁</span>
            <span style="font-size: 18px; font-weight: 600; color: #1E1E1E;">함께하는 숨트 커뮤니티</span>
        </div>
        
        <!-- 실시간 통계 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div style="text-align: center;">
                <div id="profileTodayActive" style="font-size: 24px; font-weight: 700; color: #3B82F6;">1,247</div>
                <div style="font-size: 12px; color: #6B7280;">오늘 활동 중</div>
            </div>
            <div style="text-align: center;">
                <div id="profileTotalUsers" style="font-size: 24px; font-weight: 700; color: #22C55E;">12,543</div>
                <div style="font-size: 12px; color: #6B7280;">전체 사용자</div>
            </div>
        </div>
        
        <!-- 리뷰 캐러셀 -->
        <div class="reviews-carousel" style="background: #F8F9FA; border-radius: 16px; padding: 16px; overflow: hidden; position: relative; height: 160px;">
            <div class="reviews-slider" id="profileReviewsSlider" style="display: flex; transition: transform 0.5s ease; height: 100%;">
                <!-- 리뷰 카드들이 JavaScript로 생성됨 -->
            </div>
            <div class="carousel-dots" id="profileCarouselDots" style="display: flex; justify-content: center; gap: 6px; margin-top: 12px;">
                <!-- 점들이 JavaScript로 생성됨 -->
            </div>
        </div>
    </div>

    <!-- 5. 계정 관리 -->
    <div style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 60px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <span style="font-size: 24px;">⚙️</span>
            <span style="font-size: 18px; font-weight: 600; color: #1E1E1E;">계정 관리</span>
        </div>
        
        <button id="logoutButton" style="width: 100%; background: #EF4444; color: white; border: none; border-radius: 12px; padding: 16px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
            모든 데이터 삭제 (로그아웃)
        </button>
        
        <div style="font-size: 12px; color: #6B7280; text-align: center; margin-top: 12px; line-height: 1.4;">
            ⚠️ 이 작업은 되돌릴 수 없습니다.<br>
            모든 운동 기록과 배지가 삭제됩니다.
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
    background: #DC2626 !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
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
    transition: transform 0.5s ease;
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
            todayActiveEl.textContent = liveData.todayActive.toLocaleString();
        }
        if (totalUsersEl) {
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
                    <div class="review-header-center">
                        <div class="review-avatar-icon"></div>
                        <span class="review-name">${this.generateAnonymousId(review.author, review.text)}</span>
                        <span class="review-rating">${review.rating}</span>
                    </div>
                    <div class="review-text">${review.text}</div>
                </div>
            `;
            reviewsSlider.appendChild(reviewCard);
        });
        

        
        // 캐러셀 점들 생성
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
        // 기존 인터벌 정리
        if (this.reviewCarouselInterval) {
            clearInterval(this.reviewCarouselInterval);
        }
        
        // 6초마다 자동 전환 (여유로운 속도로 변경)
        this.reviewCarouselInterval = setInterval(() => {
            this.currentReviewIndex = (this.currentReviewIndex + 1) % totalReviews;
            this.goToReview(this.currentReviewIndex);
        }, 6000); // 4000 → 6000
        
        console.log('🫁 리뷰 자동 슬라이드 시작 (6초 간격)');
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
            nicknameEl.textContent = this.userInfo.nickname;
        }

        // 운동 데이터 가져오기
        await this.fetchExerciseData();
        
        // 성장 통계 업데이트
        const stats = this.calculateGrowthStats();
        
        document.getElementById('totalWorkoutDays').textContent = stats.totalWorkoutDays;
        document.getElementById('totalBreaths').textContent = stats.totalBreaths.toLocaleString();
        document.getElementById('consecutiveDays').textContent = stats.consecutiveDays;
        document.getElementById('currentIntensity').textContent = stats.currentIntensity;

        // 배지 시스템 업데이트 (표시만, 자동 획득 안함)
        this.updateBadgesDisplay();

        // 커뮤니티 리뷰 캐러셀 초기화 (실제 리뷰 시스템)
        this.initCommunityCarousel();
    }

    // 🏆 배지 표시 업데이트 (프로필탭용 - 표시만, 획득 로직 제거)
    updateBadgesDisplay() {
        const badgesConfig = this.getBadgesConfig();
        const earnedBadges = this.getEarnedBadges();

        // 진행률 업데이트
        const progressEl = document.getElementById('profileBadgesProgress');
        if (progressEl) {
            progressEl.textContent = `수집한 배지: ${earnedBadges.length}/${badgesConfig.length}`;
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

    // 🚪 로그아웃/데이터 삭제
    async handleLogout() {
        const confirmed = confirm(
            '정말로 모든 데이터를 삭제하시겠습니까?\n\n' +
            '⚠️ 이 작업은 되돌릴 수 없습니다.\n' +
            '- 모든 운동 기록\n' +
            '- 획득한 배지\n' +
            '- 계정 정보\n\n' +
            '모든 데이터가 영구적으로 삭제됩니다.'
        );

        if (!confirmed) return;

        try {
            // 1. 로컬 데이터 삭제
            localStorage.clear();

            // 2. Supabase 로그아웃 (있다면)
            if (this.supabaseClient) {
                await this.supabaseClient.auth.signOut();
            }

            // 3. 전역 변수 초기화
            window.currentUserId = null;
            window.currentUserInfo = null;

            // 4. 홈 탭으로 이동
            if (typeof window.switchTab === 'function') {
                window.switchTab('home');
            }

            // 5. 성공 메시지
            alert('모든 데이터가 삭제되었습니다.\n새로운 시작을 응원합니다! 🌱');
            
            // 6. 페이지 새로고침 (완전 초기화)
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('❌ 로그아웃 처리 중 오류:', error);
            alert('데이터 삭제 중 오류가 발생했습니다.\n다시 시도해 주세요.');
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

    // HTML 및 CSS 삽입
    profileScreen.innerHTML = PROFILE_HTML;
    document.head.insertAdjacentHTML('beforeend', PROFILE_CSS);

    // 대시보드 인스턴스 생성
    const dashboard = new ProfileDashboard();
    const initialized = await dashboard.init();
    
    if (!initialized) {
        console.warn('⚠️ 프로필 대시보드 초기화 실패');
        return;
    }

    // UI 업데이트
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
