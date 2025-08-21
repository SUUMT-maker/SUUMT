// 🙋‍♂️ 프로필탭 인라인 구현 (dashboard.js 패턴)

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

.badge-item.available {
    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
    color: #1976D2;
    border: 2px solid #2196F3;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
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

.badge-item:hover.available {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
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

    // 🏆 새로운 배지 체크 (기존 로직 재사용)
    checkAndShowNewBadges() {
        // 기존 checkNewBadges 함수 재사용
        if (typeof window.checkNewBadges === 'function') {
            const stats = {
                totalExercises: this.exerciseData.length,
                totalBreaths: this.exerciseData.reduce((sum, s) => sum + (s.completed_breaths || 0), 0),
                consecutiveDays: this.calculateConsecutiveDays()
            };
            
            const newBadges = window.checkNewBadges(stats);
            
            // 새로운 배지가 있으면 팝업 표시 (기존 함수 재사용)
            if (newBadges.length > 0 && typeof window.showBadgePopup === 'function') {
                setTimeout(() => {
                    window.showBadgePopup(newBadges[0]);
                }, 500);
            }
            
            return newBadges;
        }
        
        return [];
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

        // 배지 시스템 업데이트 (기존 시스템 활용)
        this.updateBadgesDisplay();
    }

    // 🏆 배지 표시 업데이트 (프로필탭용으로 수정)
    updateBadgesDisplay() {
        const badgesConfig = this.getBadgesConfig();
        const earnedBadges = this.getEarnedBadges();
        
        // 통계 계산 (배지 조건 체크용)
        const stats = {
            totalExercises: this.exerciseData.length,
            totalBreaths: this.exerciseData.reduce((sum, s) => sum + (s.completed_breaths || 0), 0),
            consecutiveDays: this.calculateConsecutiveDays()
        };

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
            
            // 조건 체크 (획득 가능한지)
            let canEarn = false;
            try {
                canEarn = badge.condition && badge.condition(stats);
            } catch (error) {
                // 일부 조건 함수가 없을 수 있음 (퀴즈, 새벽운동 등)
                canEarn = false;
            }
            
            return `
                <div class="badge-item ${isEarned ? 'earned' : canEarn ? 'available' : 'locked'}" 
                     title="${badge.description}" 
                     data-badge-id="${badge.id}">
                    <div class="badge-icon">${isEarned ? badge.icon : (canEarn ? badge.icon : '?')}</div>
                    <div class="badge-name">${isEarned ? badge.name : badge.hint || badge.name}</div>
                </div>
            `;
        }).join('');

        // 새로운 배지 체크 및 팝업 표시
        this.checkAndShowNewBadges();
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
        // 이벤트 리스너 정리 등
        const logoutBtn = document.getElementById('logoutButton');
        if (logoutBtn) {
            logoutBtn.removeEventListener('click', this.handleLogout);
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
    
    console.log('✅ 프로필 대시보드 초기화 완료');
}

// 🔧 전역 함수 등록
window.initProfileTab = initProfileDashboard;
window.onProfileTabClick = initProfileDashboard;

console.log('�� 프로필탭 모듈 로드 완료');
