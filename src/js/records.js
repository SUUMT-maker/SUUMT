// 기록 탭 관련 기능

// 기록 탭 초기화
async function initRecordsTab() {
    console.log('📊 기록 탭 초기화 시작...');
    
    try {
        // 주간 요약 데이터 로드
        await loadWeeklySummary();
        
        // 달력 렌더링
        await renderCalendar();
        
        // 세션 카드 렌더링
        await renderSessionCards();
        
    } catch (error) {
        console.error('❌ 기록 탭 초기화 실패:', error);
    }
    
    console.log('✅ 기록 탭 초기화 완료');
}

// 주간 요약 데이터 로드
async function loadWeeklySummary() {
    if (!window.currentUserId) return;
    
    try {
        // 이번 주 시작일과 종료일 계산 (KST 기준)
        const now = new Date();
        const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const weekStart = new Date(kstNow);
        weekStart.setDate(kstNow.getDate() - kstNow.getDay()); // 일요일
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // 토요일
        weekEnd.setHours(23, 59, 59, 999);
        
        // UTC로 변환
        const utcWeekStart = new Date(weekStart.getTime() - 9 * 60 * 60 * 1000);
        const utcWeekEnd = new Date(weekEnd.getTime() - 9 * 60 * 60 * 1000);
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select('*')
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcWeekStart.toISOString())
            .lte('created_at', utcWeekEnd.toISOString());
        
        if (error) throw error;
        
        // 요약 데이터 계산
        const activeDays = new Set();
        let totalTime = 0;
        let totalEffort = 0;
        let effortCount = 0;
        
        sessions?.forEach(session => {
            const sessionDate = toKSTDateString(session.created_at);
            activeDays.add(sessionDate);
            
            totalTime += parseInt(session.exercise_time) || 0;
            
            if (session.user_feedback) {
                totalEffort += getEffortScore(session.user_feedback);
                effortCount++;
            }
        });
        
        // UI 업데이트
        document.getElementById('weeklyActiveDays').textContent = activeDays.size;
        document.getElementById('weeklyTotalTime').textContent = formatTime(totalTime);
        document.getElementById('weeklyAvgEffort').textContent = 
            effortCount > 0 ? getEffortText(Math.round(totalEffort / effortCount)) : '-';
        
    } catch (error) {
        console.error('❌ 주간 요약 로드 실패:', error);
    }
}

// 달력 렌더링
async function renderCalendar() {
    if (!window.currentUserId) return;
    
    try {
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select('created_at')
            .eq('user_id', window.currentUserId);
        
        if (error) throw error;
        
        // KST 기준으로 날짜별 세션 그룹화
        const sessionsByDate = {};
        sessions?.forEach(session => {
            const dateKey = toKSTDateString(session.created_at);
            if (!sessionsByDate[dateKey]) {
                sessionsByDate[dateKey] = [];
            }
            sessionsByDate[dateKey].push(session);
        });
        
        // 달력 HTML 생성
        const calendarContainer = document.querySelector('.records-calendar');
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        let html = '<table class="calendar"><tr>';
        for (let d = 1; d <= 30; d++) {
            const dayStr = d.toString().padStart(2, '0');
            const fullDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${dayStr}`;
            const hasRecord = sessionsByDate[fullDate]?.length > 0;
            
            html += `<td class="${hasRecord ? 'has-record' : ''}" data-day="${fullDate}">${d}</td>`;
            if (d % 7 === 0) html += '</tr><tr>';
        }
        html += '</tr></table>';
        calendarContainer.innerHTML = html;
        
        // 달력 클릭 이벤트
        calendarContainer.querySelectorAll('td').forEach(td => {
            td.addEventListener('click', async () => {
                const day = td.getAttribute('data-day');
                await loadSessionsForDate(day);
            });
        });
        
    } catch (error) {
        console.error('❌ 달력 렌더링 실패:', error);
    }
}

// 세션 카드 렌더링
async function renderSessionCards() {
    // 기본적으로 오늘 날짜의 세션 표시
    const today = toKSTDateString(new Date().toISOString());
    await loadSessionsForDate(today);
}

// 특정 날짜의 세션 로드
async function loadSessionsForDate(date) {
    if (!window.currentUserId) return;
    
    try {
        // KST 기준 날짜를 UTC 기준으로 변환
        const kstStartOfDay = new Date(`${date}T00:00:00+09:00`);
        const kstEndOfDay = new Date(`${date}T23:59:59+09:00`);
        
        const utcStartOfDay = new Date(kstStartOfDay.getTime() - 9 * 60 * 60 * 1000);
        const utcEndOfDay = new Date(kstEndOfDay.getTime() - 9 * 60 * 60 * 1000);
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select(`
                *,
                ai_advice (
                    comprehensive_advice
                )
            `)
            .eq('user_id', window.currentUserId)
            .gte('created_at', utcStartOfDay.toISOString())
            .lt('created_at', utcEndOfDay.toISOString())
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        renderSessionCardsHTML(sessions || [], date);
        
    } catch (error) {
        console.error('❌ 세션 로드 실패:', error);
    }
}

// 세션 카드 HTML 렌더링
function renderSessionCardsHTML(sessions, date) {
    const container = document.getElementById('sessionCardsContainer');
    
    if (!sessions.length) {
        container.innerHTML = `
            <div class="card" style="text-align: center; color: #666;">
                <p>${date}에는 운동 기록이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    sessions.forEach(session => {
        const sessionTime = new Date(session.created_at);
        const kstTime = new Date(sessionTime.getTime() + 9 * 60 * 60 * 1000);
        const timeString = kstTime.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        const avgResistance = session.inhale_resistance && session.exhale_resistance 
            ? ((session.inhale_resistance + session.exhale_resistance) / 2).toFixed(1)
            : '-';
        
        const aiAdvice = session.ai_advice?.[0]?.comprehensive_advice || 'AI 조언이 없습니다.';
        
        html += `
            <div class="session-card card">
                <div class="session-header">⏱️ ${timeString} · ${date}</div>
                <div class="session-body">
                    <ul>
                        <li>세트 수: <span class="sets">${session.completed_sets || 0}</span></li>
                        <li>호흡 수: <span class="breaths">${session.completed_breaths || 0}</span></li>
                        <li>평균 저항: <span class="resistance">${avgResistance}</span></li>
                        <li>강도 인식: <span class="effort">${session.user_feedback || '-'}</span></li>
                    </ul>
                    <div class="ai-summary">"${aiAdvice.substring(0, 50)}${aiAdvice.length > 50 ? '...' : ''}"</div>
                    <button class="ai-detail-btn" data-session-id="${session.id}">AI 코칭 전체 보기</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // AI 상세 버튼 이벤트
    container.querySelectorAll('.ai-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sessionId = btn.getAttribute('data-session-id');
            showAiDetailModal(sessionId);
        });
    });
}

// AI 상세 모달 표시 (향후 구현)
function showAiDetailModal(sessionId) {
    console.log('🤖 AI 상세 모달 표시:', sessionId);
    alert('AI 상세 조언 기능이 준비 중입니다...');
}

// 강도 점수 계산
function getEffortScore(feedback) {
    const effortMap = {
        '너무 쉬워요': 1,
        '적당해요': 3,
        '조금 어려워요': 4,
        '너무 어려워요': 5
    };
    return effortMap[feedback] || 3;
}

// 강도 텍스트 변환
function getEffortText(score) {
    const effortTexts = {
        1: '너무 쉬워요',
        2: '쉬워요',
        3: '적당해요',
        4: '조금 어려워요',
        5: '너무 어려워요'
    };
    return effortTexts[score] || '적당해요';
}

// 기록 탭 활성화 시 호출
function onRecordsTabActivate() {
    console.log('📊 기록 탭 활성화');
    initRecordsTab();
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ 기록 탭 이벤트 리스너 등록 완료');
});
