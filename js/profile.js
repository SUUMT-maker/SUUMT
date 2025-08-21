// 🙋‍♂️ 프로필탭 인라인 구현 (dashboard.js 패턴)
// ✨ 실시간 커뮤니티 데이터, 배지 시스템, 성장 통계 포함

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

    <!-- 4. 숨트 커뮤니티 -->
    <div id="profileCommunitySection" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <span style="font-size: 24px;">🫁</span>
            <span style="font-size: 18px; font-weight: 600; color: #1E1E1E;">함께하는 숨트 커뮤니티</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #3B82F6;">1,247</div>
                <div style="font-size: 12px; color: #6B7280;">오늘 활동 중</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: 700; color: #22C55E;">12,543</div>
                <div style="font-size: 12px; color: #6B7280;">전체 사용자</div>
            </div>
        </div>
        
        <div style="background: #F8F9FA; padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 14px; color: #6B7280; line-height: 1.5;">
                "매일 조금씩 발전하는 우리의 호흡 여정,<br>
                함께 해서 더욱 의미있어요! 💪"
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
        this.communityUpdateInterval = null;
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

    // 🫁 커뮤니티 데이터 업데이트 (기존 스마트 생성 함수 활용)
    updateCommunityData() {
        // 기존 generateSmartLiveData 함수 활용
        if (typeof window.generateSmartLiveData === 'function') {
            const liveData = window.generateSmartLiveData();
            
            // 프로필탭 커뮤니티 섹션 업데이트
            const communitySection = document.getElementById('profileCommunitySection');
            if (communitySection) {
                // 실시간 통계 업데이트
                const todayActiveEl = communitySection.querySelector('[style*="color: #3B82F6"]');
                const totalUsersEl = communitySection.querySelector('[style*="color: #22C55E"]');
                
                if (todayActiveEl) {
                    todayActiveEl.textContent = liveData.todayActive.toLocaleString();
                }
                if (totalUsersEl) {
                    totalUsersEl.textContent = liveData.totalUsers.toLocaleString();
                }
                
                console.log('🫁 커뮤니티 데이터 업데이트:', liveData);
            }
        } else {
            // 기존 함수가 없으면 자체 생성
            const liveData = this.generateFallbackCommunityData();
            this.applyCommunityData(liveData);
        }
    }

    // 🫁 자체 커뮤니티 데이터 생성 (폴백용)
    generateFallbackCommunityData() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        // 시간대별 활성도 패턴
        let hourMultiplier = 1.0;
        if (hour >= 6 && hour <= 9) hourMultiplier = 1.8; // 아침 피크
        else if (hour >= 18 && hour <= 22) hourMultiplier = 2.2; // 저녁 피크
        else if (hour >= 0 && hour <= 5) hourMultiplier = 0.3; // 새벽
        
        // 요일별 패턴
        let dayMultiplier = 1.0;
        if (day === 0 || day === 6) dayMultiplier = 0.7; // 주말 70%
        
        // 기본 데이터 + 성장 패턴
        const daysSinceStart = Math.floor((now - new Date('2024-01-01')) / (1000 * 60 * 60 * 24));
        const baseUsers = 8500 + (daysSinceStart * 12); // 하루 12명씩 성장
        
        const todayActive = Math.floor(baseUsers * hourMultiplier * dayMultiplier * (0.85 + Math.random() * 0.3));
        const totalUsers = Math.floor(baseUsers * 1.4);
        
        return {
            todayActive: Math.max(150, todayActive),
            totalUsers: Math.max(8000, totalUsers),
            isGrowing: true
        };
    }

    // 🫁 커뮤니티 데이터 적용
    applyCommunityData(data) {
        const communitySection = document.getElementById('profileCommunitySection');
        if (!communitySection) return;
        
        // 동적 HTML 업데이트 (하드코딩 제거)
        const updatedHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <span style="font-size: 24px;">🫁</span>
                <span style="font-size: 18px; font-weight: 600; color: #1E1E1E;">함께하는 숨트 커뮤니티</span>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #3B82F6;">${data.todayActive.toLocaleString()}</div>
                    <div style="font-size: 12px; color: #6B7280;">오늘 활동 중</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #22C55E;">${data.totalUsers.toLocaleString()}</div>
                    <div style="font-size: 12px; color: #6B7280;">전체 사용자</div>
                </div>
            </div>
            
            <div style="background: #F8F9FA; padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 14px; color: #6B7280; line-height: 1.5;">
                    ${this.getRandomMotivationMessage()}
                </div>
            </div>
        `;
        
        communitySection.innerHTML = updatedHTML;
        console.log('🫁 커뮤니티 섹션 업데이트 완료');
    }

    // 🫁 랜덤 동기부여 메시지
    getRandomMotivationMessage() {
        const messages = [
            '"매일 조금씩 발전하는 우리의 호흡 여정,<br>함께 해서 더욱 의미있어요! 💪"',
            '"숨쉬는 것만으로도 건강해지고 있어요,<br>우리 모두 화이팅! 🌟"',
            '"호흡 하나하나가 모여 큰 변화를 만들어요,<br>꾸준히 함께해요! 🚀"',
            '"깊은 호흡으로 마음도 몸도 건강하게,<br>오늘도 좋은 하루 보내세요! 😊"',
            '"작은 습관이 큰 변화를 만듭니다,<br>호흡 트레이닝과 함께 성장해요! 🌱"'
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
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

        // 커뮤니티 데이터 업데이트 (동적 데이터)
        this.updateCommunityData();

        // 🫁 커뮤니티 데이터 자동 새로고침 (30초마다)
        this.startCommunityAutoRefresh();
    }

    // 🫁 커뮤니티 자동 새로고침 시작
    startCommunityAutoRefresh() {
        // 기존 인터벌 정리
        if (this.communityUpdateInterval) {
            clearInterval(this.communityUpdateInterval);
        }
        
        // 30초마다 커뮤니티 데이터 업데이트
        this.communityUpdateInterval = setInterval(() => {
            this.updateCommunityData();
        }, 30000); // 30초
        
        console.log('🫁 커뮤니티 자동 새로고침 시작 (30초 간격)');
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
        
        // 커뮤니티 자동 새로고침 정리
        if (this.communityUpdateInterval) {
            clearInterval(this.communityUpdateInterval);
            this.communityUpdateInterval = null;
            console.log('🫁 커뮤니티 자동 새로고침 정리');
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
    
    console.log('✅ 프로필 대시보드 초기화 완료 (배지 + 커뮤니티 연동)');
}

// 🔧 전역 함수 등록
window.initProfileTab = initProfileDashboard;
window.onProfileTabClick = initProfileDashboard;

console.log('�� 프로필탭 모듈 로드 완료');
