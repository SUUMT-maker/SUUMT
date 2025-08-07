/**
 * 기록 탭 관련 기능
 * 설계자의 확정안에 따른 완전 구현
 */

class RecordsTab {
    constructor() {
        this.currentUserId = null;
        this.supabaseClient = null;
        this.currentDate = new Date();
        this.selectedDate = null;
        this.sessionsByDate = {};
        this.isInitialized = false;
    }

    /**
     * RecordsTab 초기화
     * @param {string} userId - 현재 로그인된 사용자 ID
     * @param {object} supabaseClient - Supabase 클라이언트 인스턴스
     */
    async init(userId, supabaseClient) {
        try {
            console.log('📊 RecordsTab 초기화 시작...');
            
            this.currentUserId = userId;
            this.supabaseClient = supabaseClient;
            
            // 로딩 상태 표시
            this.showLoading();
            
            // 모든 세션 데이터 로드
            await this.loadAllSessions();
            
            // 달력 렌더링
            this.renderCalendar();
            
            // 오늘 날짜 선택 (기본값)
            const today = this.toKSTDateString(new Date().toISOString());
            await this.selectDate(today);
            
            // 이벤트 리스너 등록
            this.initEventListeners();
            
            // 로딩 상태 숨김
            this.hideLoading();
            
            this.isInitialized = true;
            console.log('✅ RecordsTab 초기화 완료');
            
        } catch (error) {
            console.error('❌ RecordsTab 초기화 실패:', error);
            this.showError();
        }
    }

    /**
     * 로딩 상태 표시
     */
    showLoading() {
        const recordsContainer = document.querySelector('.records-container');
        if (!recordsContainer) return;
        
        recordsContainer.innerHTML = `
            <div class="records-loading">
                <span>기록을 불러오는 중...</span>
            </div>
        `;
    }

    /**
     * 로딩 상태 숨김
     */
    hideLoading() {
        this.restoreContent();
    }

    /**
     * 에러 상태 표시
     */
    showError() {
        const recordsContainer = document.querySelector('.records-container');
        if (!recordsContainer) return;
        
        recordsContainer.innerHTML = `
            <div class="records-error">
                <div class="error-icon">⚠️</div>
                <p>기록을 불러오는 중 오류가 발생했습니다.</p>
                <button onclick="recordsTab.init(window.currentUserId, window.supabaseClient)" class="retry-btn">다시 시도</button>
            </div>
        `;
    }

    /**
     * 컨텐츠 복원
     */
    restoreContent() {
        const recordsContainer = document.querySelector('.records-container');
        if (!recordsContainer) return;
        
        recordsContainer.innerHTML = `
            <h2>운동 기록</h2>
            
            <!-- 달력 컴포넌트 -->
            <div class="calendar-component card mb-4">
                <div class="calendar-header">
                    <button id="prevMonthBtn" class="calendar-nav-btn">◀</button>
                    <h3 id="calendarTitle">2024년 1월</h3>
                    <button id="nextMonthBtn" class="calendar-nav-btn">▶</button>
                </div>
                <div class="calendar-body">
                    <div class="calendar-weekdays">
                        <div>일</div>
                        <div>월</div>
                        <div>화</div>
                        <div>수</div>
                        <div>목</div>
                        <div>금</div>
                        <div>토</div>
                    </div>
                    <div id="calendarDays" class="calendar-days">
                        <!-- JS로 동적 생성 -->
                    </div>
                </div>
            </div>

            <!-- DailySessionSlider 컴포넌트 -->
            <div id="dailySessionSlider" class="daily-session-slider card mb-4" style="display: none;">
                <div class="daily-session-header">
                    <h3 id="selectedDateTitle">선택된 날짜의 운동 세션</h3>
                </div>
                <div class="session-slider-container">
                    <div class="session-slider-wrapper">
                        <div id="sessionSlider" class="session-slider">
                            <!-- JS로 동적 생성 -->
                        </div>
                    </div>
                    <div class="slider-indicators">
                        <!-- JS로 동적 생성 -->
                    </div>
                </div>
            </div>

            <!-- AI 숨트레이너 요약 카드 -->
            <div id="aiSummaryCard" class="ai-summary-card card mb-4">
                <div class="ai-summary-content">
                    <div class="ai-summary-header">
                        <div class="ai-summary-icon">🤖</div>
                        <h3>AI 숨트레이너의 조언</h3>
                    </div>
                    <div class="ai-summary-message">
                        <p id="aiSummaryMessage">날짜를 선택하면 AI 숨트레이너의 조언을 확인할 수 있어요.</p>
                    </div>
                    <div class="ai-summary-action">
                        <button id="aiAnalysisBtn" class="ai-analysis-btn" style="display: none;">
                            AI 분석 보기 ▶
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 이벤트 리스너 초기화
     */
    initEventListeners() {
        // 달력 네비게이션 버튼
        const prevMonthBtn = document.getElementById('prevMonthBtn');
        const nextMonthBtn = document.getElementById('nextMonthBtn');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        // AI 분석 버튼
        const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');
        if (aiAnalysisBtn) {
            aiAnalysisBtn.addEventListener('click', () => {
                this.showAIAnalysisModal();
            });
        }
    }

    /**
     * 모든 세션 데이터 로드
     */
    async loadAllSessions() {
        try {
            const { data: sessions, error } = await this.supabaseClient
                .from('exercise_sessions')
                .select('*')
                .eq('user_id', this.currentUserId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // KST 기준으로 날짜별 세션 그룹화
            this.sessionsByDate = {};
            sessions?.forEach(session => {
                const dateKey = this.toKSTDateString(session.created_at);
                if (!this.sessionsByDate[dateKey]) {
                    this.sessionsByDate[dateKey] = [];
                }
                this.sessionsByDate[dateKey].push(session);
            });
            
            console.log('✅ 모든 세션 데이터 로드 완료');
            
        } catch (error) {
            console.error('❌ 세션 데이터 로드 실패:', error);
            this.sessionsByDate = {};
        }
    }

    /**
     * 달력 렌더링
     */
    renderCalendar() {
        const calendarTitle = document.getElementById('calendarTitle');
        const calendarDays = document.getElementById('calendarDays');
        
        if (!calendarTitle || !calendarDays) return;
        
        // 달력 제목 업데이트
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth() + 1;
        calendarTitle.textContent = `${year}년 ${month}월`;
        
        // 달력 날짜 생성
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let html = '';
        const today = this.toKSTDateString(new Date().toISOString());
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dateKey = this.toKSTDateString(currentDate.toISOString());
            const dayNumber = currentDate.getDate();
            const isCurrentMonth = currentDate.getMonth() === month - 1;
            const isToday = dateKey === today;
            const hasSessions = this.sessionsByDate[dateKey]?.length > 0;
            
            let className = 'calendar-day';
            if (!isCurrentMonth) className += ' other-month';
            if (isToday) className += ' today';
            if (hasSessions) className += ' has-sessions';
            
            html += `<div class="${className}" data-date="${dateKey}">${dayNumber}</div>`;
        }
        
        calendarDays.innerHTML = html;
        
        // 날짜 클릭 이벤트 등록
        calendarDays.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', async () => {
                const date = day.getAttribute('data-date');
                await this.selectDate(date);
            });
        });
    }

    /**
     * 특정 날짜 선택
     */
    async selectDate(date) {
        this.selectedDate = date;
        
        // 달력에서 선택된 날짜 하이라이트
        this.highlightSelectedDate(date);
        
        // 해당 날짜의 세션 로드
        const sessions = this.sessionsByDate[date] || [];
        
        // DailySessionSlider 업데이트
        this.updateDailySessionSlider(sessions, date);
        
        // AI 요약 카드 업데이트
        await this.updateAISummaryCard(date, sessions);
    }

    /**
     * 선택된 날짜 하이라이트
     */
    highlightSelectedDate(date) {
        // 모든 날짜에서 선택 상태 제거
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        // 선택된 날짜에 선택 상태 추가
        const selectedDay = document.querySelector(`[data-date="${date}"]`);
        if (selectedDay) {
            selectedDay.classList.add('selected');
        }
    }

    /**
     * DailySessionSlider 업데이트
     */
    updateDailySessionSlider(sessions, date) {
        const dailySessionSlider = document.getElementById('dailySessionSlider');
        const selectedDateTitle = document.getElementById('selectedDateTitle');
        
        if (!dailySessionSlider || !selectedDateTitle) return;
        
        // 날짜 제목 업데이트
        const formattedDate = this.formatDisplayDate(date);
        selectedDateTitle.textContent = `${formattedDate}의 운동 세션`;
        
        if (sessions.length === 0) {
            // 세션이 없는 경우
            dailySessionSlider.style.display = 'none';
            return;
        }
        
        // 세션이 있는 경우 표시
        dailySessionSlider.style.display = 'block';
        
        // 슬라이더 컨텐츠 생성
        this.renderSessionSlider(sessions);
        
        // 인디케이터 생성
        this.renderSliderIndicators(sessions.length);
        
        // 슬라이더 이벤트 리스너 등록
        this.initSliderEventListeners();
    }

    /**
     * 세션 슬라이더 렌더링
     */
    renderSessionSlider(sessions) {
        const sessionSlider = document.getElementById('sessionSlider');
        if (!sessionSlider) return;
        
        let html = '';
        
        sessions.forEach((session, index) => {
            const sessionTime = this.formatSessionTime(session.created_at);
            const exerciseTime = session.exercise_time ? this.formatTime(parseInt(session.exercise_time)) : '기록 없음';
            const sets = session.completed_sets || 0;
            const breaths = session.completed_breaths || 0;
            const avgResistance = this.calculateAverageResistance(session.inhale_resistance, session.exhale_resistance);
            const effortLevel = this.getEffortLevel(session.inhale_resistance, session.exhale_resistance);
            const feedback = session.user_feedback || '기록 없음';
            
            html += `
                <div class="session-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <div class="session-slide-header">
                        <h4>${index + 1}번째 세션</h4>
                        <span class="session-time">${sessionTime}</span>
                    </div>
                    <div class="session-slide-content">
                        <div class="session-stat-item">
                            <span class="session-stat-icon">⏱️</span>
                            <span class="session-stat-label">운동 시간</span>
                            <span class="session-stat-value">${exerciseTime}</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">🔄</span>
                            <span class="session-stat-label">세트 수</span>
                            <span class="session-stat-value">${sets}세트</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">🫁</span>
                            <span class="session-stat-label">호흡 수</span>
                            <span class="session-stat-value">${breaths}회</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">💪</span>
                            <span class="session-stat-label">평균 저항</span>
                            <span class="session-stat-value">${avgResistance}</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">${this.getEffortIcon(effortLevel)}</span>
                            <span class="session-stat-label">강도 레벨</span>
                            <span class="session-stat-value">${this.getEffortText(effortLevel)}</span>
                        </div>
                        <div class="session-stat-item">
                            <span class="session-stat-icon">😊</span>
                            <span class="session-stat-label">내 느낌</span>
                            <span class="session-stat-value">${feedback}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        sessionSlider.innerHTML = html;
    }

    /**
     * 슬라이더 인디케이터 렌더링
     */
    renderSliderIndicators(sessionCount) {
        const indicatorsContainer = document.querySelector('.slider-indicators');
        if (!indicatorsContainer) return;
        
        let html = '';
        
        for (let i = 0; i < sessionCount; i++) {
            html += `<div class="slider-indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`;
        }
        
        indicatorsContainer.innerHTML = html;
    }

    /**
     * 슬라이더 이벤트 리스너 초기화
     */
    initSliderEventListeners() {
        const indicators = document.querySelectorAll('.slider-indicator');
        
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.dataset.index);
                this.showSlide(index);
            });
        });
    }

    /**
     * 특정 슬라이드 표시
     */
    showSlide(index) {
        const slides = document.querySelectorAll('.session-slide');
        const indicators = document.querySelectorAll('.slider-indicator');
        
        // 모든 슬라이드와 인디케이터 비활성화
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // 선택된 슬라이드와 인디케이터 활성화
        if (slides[index]) slides[index].classList.add('active');
        if (indicators[index]) indicators[index].classList.add('active');
    }

    /**
     * AI 요약 카드 업데이트
     */
    async updateAISummaryCard(date, sessions) {
        const aiSummaryCard = document.getElementById('aiSummaryCard');
        const aiSummaryMessage = document.getElementById('aiSummaryMessage');
        const aiAnalysisBtn = document.getElementById('aiAnalysisBtn');
        
        if (!aiSummaryCard || !aiSummaryMessage || !aiAnalysisBtn) return;
        
        try {
            // AI 조언 조회 (Supabase VIEW: view_user_ai_advice)
            const { data: aiAdvice, error } = await this.supabaseClient
                .from('view_user_ai_advice')
                .select('*')
                .eq('user_id', this.currentUserId)
                .eq('advice_date', date)
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116는 데이터 없음
                throw error;
            }
            
            if (aiAdvice && aiAdvice.summary) {
                // AI 조언이 있는 경우
                aiSummaryMessage.textContent = aiAdvice.summary;
                aiAnalysisBtn.style.display = 'inline-block';
                aiSummaryCard.classList.add('has-advice');
            } else {
                // AI 조언이 없는 경우
                if (sessions.length > 0) {
                    aiSummaryMessage.textContent = '아직 충분한 데이터가 없어요!';
                } else {
                    aiSummaryMessage.textContent = '이 날짜에는 운동 기록이 없어요.';
                }
                aiAnalysisBtn.style.display = 'none';
                aiSummaryCard.classList.remove('has-advice');
            }
            
        } catch (error) {
            console.error('❌ AI 조언 로드 실패:', error);
            aiSummaryMessage.textContent = 'AI 조언을 불러오는 중 오류가 발생했습니다.';
            aiAnalysisBtn.style.display = 'none';
        }
    }

    /**
     * AI 분석 모달 표시
     */
    showAIAnalysisModal() {
        console.log('🤖 AI 분석 모달 표시:', this.selectedDate);
        // TODO: 실제 AI 분석 모달 구현
        alert('AI 분석 기능이 준비 중입니다...');
    }

    /**
     * 유틸리티 함수들
     */

    /**
     * UTC를 KST 날짜 문자열로 변환
     */
    toKSTDateString(utcString) {
        const date = new Date(utcString);
        const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
        return kstDate.toISOString().split('T')[0];
    }

    /**
     * 시간 포맷팅 (초 → 분:초)
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}분 ${remainingSeconds}초`;
    }

    /**
     * 세션 시간 포맷팅
     */
    formatSessionTime(utcTimeString) {
        try {
            const utcDate = new Date(utcTimeString);
            const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
            
            const hours = kstDate.getHours();
            const minutes = kstDate.getMinutes();
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('세션 시간 포맷팅 오류:', error);
            return '시간 정보 없음';
        }
    }

    /**
     * 표시용 날짜 포맷팅
     */
    formatDisplayDate(dateString) {
        try {
            const date = new Date(dateString);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}월 ${day}일`;
        } catch (error) {
            console.error('날짜 포맷팅 오류:', error);
            return dateString;
        }
    }

    /**
     * 평균 저항 강도 계산
     */
    calculateAverageResistance(inhaleResistance, exhaleResistance) {
        if (!inhaleResistance || !exhaleResistance) {
            return '기록 없음';
        }
        
        const avg = (inhaleResistance + exhaleResistance) / 2;
        return `${avg.toFixed(1)}`;
    }

    /**
     * 강도 레벨 계산
     */
    getEffortLevel(inhaleResistance, exhaleResistance) {
        if (!inhaleResistance || !exhaleResistance) {
            return 'unknown';
        }
        
        const avg = (inhaleResistance + exhaleResistance) / 2;
        
        if (avg <= 2) {
            return 'light';
        } else if (avg <= 4) {
            return 'balanced';
        } else {
            return 'challenging';
        }
    }

    /**
     * 강도 아이콘 반환
     */
    getEffortIcon(effortLevel) {
        const iconMap = {
            'light': '💨',
            'balanced': '💪',
            'challenging': '🔥',
            'unknown': '❓'
        };
        return iconMap[effortLevel] || '❓';
    }

    /**
     * 강도 텍스트 반환
     */
    getEffortText(effortLevel) {
        const textMap = {
            'light': '쉬움 (Light)',
            'balanced': '적정 (Balanced)',
            'challenging': '힘듦 (Challenging)',
            'unknown': '기록 없음'
        };
        return textMap[effortLevel] || '기록 없음';
    }
}

// 전역 인스턴스 생성
const recordsTab = new RecordsTab();

// 전역으로 노출
window.recordsTab = recordsTab;

// 기록 탭 활성화 시 호출
function onRecordsTabActivate() {
    console.log('📊 기록 탭 활성화');
    if (window.currentUserId && window.supabaseClient) {
        recordsTab.init(window.currentUserId, window.supabaseClient);
    }
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 기록 탭 이벤트 리스너 등록 완료');
});
