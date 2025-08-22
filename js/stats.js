// 📊 통계 관련 함수들

// 로컬 스토리지 기반 통계 관리
function getLocalStats() {
    const stats = JSON.parse(localStorage.getItem('breathTrainerStats') || '{}');
    return {
        totalExercises: stats.totalExercises || 0,
        totalSets: stats.totalSets || 0,
        totalBreaths: stats.totalBreaths || 0,
        consecutiveDays: stats.consecutiveDays || 0,
        lastExerciseDate: stats.lastExerciseDate || null,
        averageSets: stats.totalExercises > 0 ? Math.round((stats.totalSets / stats.totalExercises) * 10) / 10 : 0
    };
}

function getExerciseHistory() {
    return JSON.parse(localStorage.getItem('breathTrainerHistory') || '[]');
}

function addExerciseHistory(exerciseData) {
    const history = getExerciseHistory();
    const newRecord = {
        date: getCurrentUserTime().toISOString(), // 사용자 시간대 적용
        exerciseTime: exerciseData.exerciseTime,
        completedSets: exerciseData.completedSets,
        completedBreaths: exerciseData.completedBreaths,
        isAborted: exerciseData.isAborted,
        userFeedback: exerciseData.userFeedback,
        resistanceSettings: exerciseData.resistanceSettings
    };
    
    history.unshift(newRecord);
    
    if (history.length > 10) {
        history.splice(10);
    }
    
    localStorage.setItem('breathTrainerHistory', JSON.stringify(history));
}

function updateLocalStats(exerciseData) {
    const stats = getLocalStats();
    
    stats.totalExercises += 1;
    stats.totalSets += exerciseData.completedSets;
    stats.totalBreaths += exerciseData.completedBreaths;
    
    const today = getCurrentUserTime().toDateString();
    const lastDate = stats.lastExerciseDate ? new Date(stats.lastExerciseDate).toDateString() : null;
    
    if (lastDate === today) {
        // 오늘 이미 트레이닝함
    } else if (lastDate === new Date(Date.now() - 24*60*60*1000).toDateString()) {
        // 어제 트레이닝함
        stats.consecutiveDays += 1;
    } else {
        // 연속 끊김
        stats.consecutiveDays = 1;
    }
    
    stats.lastExerciseDate = getCurrentUserTime().toISOString();
    stats.averageSets = stats.totalExercises > 0 ? Math.round((stats.totalSets / stats.totalExercises) * 10) / 10 : 0;
    
    localStorage.setItem('breathTrainerStats', JSON.stringify(stats));
    return stats;
}

function displayUserStats(stats) {
    document.getElementById('totalExercises').textContent = stats.totalExercises;
    document.getElementById('consecutiveDays').textContent = stats.consecutiveDays;
    
    // 🔧 오늘 완료한 세트 수 계산 (평균이 아닌 오늘 실제 완료 세트)
    const todayCompletedSets = getTodayCompletedSets();
    document.getElementById('averageSets').textContent = todayCompletedSets;
    
    // 🔧 오늘 완료한 호흡 횟수 계산
    const todayBreaths = getTodayBreaths();
    document.getElementById('totalBreaths').textContent = todayBreaths;
}

// 🔧 오늘 완료한 세트 수 계산 함수
function getTodayCompletedSets() {
    const history = getExerciseHistory();
    const today = getCurrentUserTime().toDateString();
    
    const todayData = history.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === today;
    });
    
    return todayData.reduce((sum, record) => sum + record.completedSets, 0);
}

// 🔧 오늘 완료한 호흡 횟수 계산 함수
function getTodayBreaths() {
    const history = getExerciseHistory();
    const today = getCurrentUserTime().toDateString();
    
    const todayData = history.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === today;
    });
    
    return todayData.reduce((sum, record) => sum + record.completedBreaths, 0);
}

// 차트 데이터 업데이트 (개선된 주간 구분 + 동적 스케일링)
async function updateChart() {
    try {
        // 1단계: Supabase에서 직접 주간 데이터 조회 (일일목표 방식과 동일)
        let weeklyData = [];
        
        if (window.supabaseClient && window.currentUserId) {
            const weekStart = getWeekStartDate();
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            
            const { data: sessions, error } = await window.supabaseClient
                .from('exercise_sessions')
                .select('completed_breaths, completed_sets, created_at')
                .eq('user_id', window.currentUserId)
                .gte('created_at', weekStart.toISOString())
                .lt('created_at', weekEnd.toISOString());
                
            if (!error && sessions) {
                weeklyData = sessions;
                console.log('✅ Supabase 주간 데이터 조회 성공:', weeklyData.length);
            }
        }
        
        // 2단계: 로컬 폴백 (일일목표 방식과 동일)
        if (weeklyData.length === 0 && window.exerciseData && Array.isArray(window.exerciseData)) {
            weeklyData = window.exerciseData.filter(session => {
                const sessionDate = new Date(session.created_at);
                const weekStart = getWeekStartDate();
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                return sessionDate >= weekStart && sessionDate < weekEnd;
            });
            console.log('📱 로컬 데이터 폴백 사용:', weeklyData.length);
        }
        
        // 3단계: 차트 업데이트 (기존 로직 활용)
        const convertedHistory = weeklyData.map(session => ({
            date: session.created_at,
            completedSets: session.completed_sets || 0,
            completedBreaths: session.completed_breaths || 0
        }));
        
        console.log('🔍 변환된 주간 데이터:', convertedHistory);
    
    const chartBars = document.getElementById('chartBars');
    const chartXAxis = document.getElementById('chartXAxis');
    const chartSubtitle = document.getElementById('chartSubtitle');
    const chartYAxis = document.querySelector('.chart-y-axis');
    const bars = chartBars.querySelectorAll('.chart-bar');
    
    // 현재 주의 시작일 계산
    const weekStart = getWeekStartDate();
    const weekDates = Array.from({length: 7}, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
    });

    // 차트 하단 요일 업데이트
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];  // 월요일 시작
    chartXAxis.querySelectorAll('.x-label').forEach((label, index) => {
        const date = weekDates[index];
        const dayName = dayLabels[index];
        const isToday = date.toDateString() === getCurrentUserTime().toDateString();
        
        label.textContent = dayName;
        if (isToday) {
            label.style.fontWeight = 'bold';
            label.style.color = '#667eea';
        } else {
            label.style.fontWeight = 'normal';
            label.style.color = '#666';
        }
    });

    // 주간 제목 업데이트
    const weekStartStr = formatDateForUser(weekStart);
    const weekEndStr = formatDateForUser(weekDates[6]);
    chartSubtitle.textContent = `${weekStartStr} ~ ${weekEndStr}`;

    // 🔧 각 날짜별 완료 세트 수 계산 (convertedHistory 사용)
    const dailySets = weekDates.map(targetDate => {
        const dayData = convertedHistory.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.toDateString() === targetDate.toDateString();
        });
        return dayData.reduce((sum, record) => sum + record.completedSets, 0);
    });

    // 🎯 동적 Y축 스케일 계산
    const maxSets = Math.max(...dailySets, 4); // 최소 4까지는 표시
    const yAxisMax = maxSets <= 4 ? 4 : Math.ceil(maxSets / 2) * 2; // 짝수로 올림
    const yAxisSteps = yAxisMax <= 4 ? [4, 3, 2, 1, 0] : 
                      yAxisMax <= 6 ? [6, 4, 2, 0] : 
                      yAxisMax <= 8 ? [8, 6, 4, 2, 0] : 
                      [yAxisMax, Math.floor(yAxisMax * 0.75), Math.floor(yAxisMax * 0.5), Math.floor(yAxisMax * 0.25), 0];

    // Y축 라벨 업데이트
    const yLabels = chartYAxis.querySelectorAll('.y-label');
    yLabels.forEach((label, index) => {
        if (index < yAxisSteps.length) {
            label.textContent = yAxisSteps[index];
            label.style.display = 'block';
        } else {
            label.style.display = 'none';
        }
    });

    // 막대 그래프 업데이트
    bars.forEach((bar, index) => {
        const totalSets = dailySets[index];
        const height = Math.min(100, (totalSets / yAxisMax) * 100);
        
        bar.style.height = `${height}%`;
        
        // 기본 클래스 제거
        bar.classList.remove('highlight', 'super-achiever');
        
        // 데이터에 따른 스타일 적용
        if (totalSets > 0) {
            if (totalSets > 4) {
                // 🌟 4세트 초과 시 특별한 스타일
                bar.classList.add('super-achiever');
                bar.innerHTML = `<div class="achievement-crown">👑</div>`;
            } else {
                bar.classList.add('highlight');
                bar.innerHTML = '';
            }
        } else {
            bar.innerHTML = '';
        }

        // 툴팁 업데이트
        const dateStr = formatDateForUser(weekDates[index]);
        if (totalSets > 4) {
            bar.title = `${dateStr}: ${totalSets}세트 완료 🌟 수퍼 달성!`;
        } else {
            bar.title = `${dateStr}: ${totalSets}세트 완료`;
        }
    });
    
    // 🎯 AI 인사이트 업데이트 (비동기)
    updateWeeklyAIInsight();
    
    } catch (error) {
        console.error('❌ 주간활동 차트 업데이트 실패:', error);
        // 에러 시 빈 차트 표시
    }
}

// 🎯 새로운 단순화된 AI 인사이트 로직 (에러 수정 버전)
// updateChart() 함수 바로 아래에 기존 코드를 완전히 교체하세요

// 🎲 기본 격려 메시지 (랜덤)
const FALLBACK_MESSAGES = [
    "꾸준함이 재능을 이기는 순간이에요",
    "시작하는 것만으로도 이미 절반 성공이에요",
    "이런 페이스로 계속 가시면 돼요",
    "작은 노력들이 모여 큰 변화를 만들어요"
];

// 📊 주간 데이터 추출 함수
function getSimpleWeeklyData() {
    const history = getExerciseHistory();
    const weekStart = getWeekStartDate();
    const weekEnd = getWeekEndDate();
    
    // 이번 주 운동 기록만 필터링
    const thisWeekRecords = history.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart && recordDate < weekEnd;
    });
    
    // 기본 데이터 계산
    const workoutDays = new Set(thisWeekRecords.map(record => 
        new Date(record.date).toDateString()
    )).size;
    
    const totalSets = thisWeekRecords.reduce((sum, record) => 
        sum + (record.completedSets || 0), 0);
    
    // 연속일 계산 (전체 히스토리에서)
    const consecutiveDays = calculateSimpleConsecutiveDays(history);
    
    // 첫 운동 여부
    const isFirstWeek = history.length <= thisWeekRecords.length;
    
    return {
        workoutDays,
        totalSets,
        consecutiveDays,
        isFirstWeek
    };
}

// 🔄 연속일 계산 (단순화)
function calculateSimpleConsecutiveDays(history) {
    if (history.length === 0) return 0;
    
    const today = getCurrentUserTime();
    let consecutiveDays = 0;
    
    // 오늘부터 거꾸로 확인
    for (let i = 0; i < 30; i++) { // 최대 30일까지만 확인
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        
        const hasWorkout = history.some(record => {
            const recordDate = new Date(record.date);
            return recordDate.toDateString() === checkDate.toDateString();
        });
        
        if (hasWorkout) {
            consecutiveDays++;
        } else if (i === 0) {
            // 오늘 운동 안했으면 연속 끊김
            break;
        } else {
            // 과거에 운동 안한 날 발견하면 연속 끊김
            break;
        }
    }
    
    return consecutiveDays;
}

// 🎯 메시지 선택 함수 (동적 생성으로 변경)
function selectInsightMessage(data) {
    // 1순위: 특별한 순간들
    if (data.isFirstWeek) {
        return "첫 걸음이 가장 어려운 법이에요";
    }
    
    if (data.workoutDays === 7) {
        return "완벽한 일주일! 이 리듬만 유지하면 돼요";
    }
    
    // 2순위: 습관 형성
    if (data.consecutiveDays >= 3) {
        return `${data.consecutiveDays}일 연속! 이제 습관이 되어가고 있어요`;
    }
    
    // 3순위: 주간 성취감
    if (data.workoutDays >= 5) {
        return "매일 조금씩, 이게 진짜 실력이에요";
    }
    
    if (data.workoutDays >= 3) {
        return `바쁜 중에도 ${data.workoutDays}일이나 시간 내셨네요!`;
    }
    
    if (data.workoutDays >= 1) {
        return "완벽하지 않아도 꾸준히, 그게 답이에요";
    }
    
    // 4순위: 양적 성과
    if (data.totalSets >= 3) {
        return `${data.totalSets}세트 이상! 정말 열심히 하고 계시네요`;
    }
    
    // 5순위: 기본 격려 (랜덤)
    const randomIndex = Math.floor(Math.random() * FALLBACK_MESSAGES.length);
    return FALLBACK_MESSAGES[randomIndex];
}

// 🚀 메신저 스타일 AI 인사이트 업데이트 함수 (기존 함수 완전 교체)
function updateWeeklyAIInsight() {
    const chatBubble = document.getElementById('chatBubble');
    
    if (!chatBubble) return;
    
    try {
        // 1초 후 타이핑 애니메이션을 메시지로 변경
        setTimeout(() => {
            // 주간 데이터 추출
            const weeklyData = getSimpleWeeklyData();
            
            // 메시지 선택
            const message = selectInsightMessage(weeklyData);
            
            // 메시지 카테고리 결정 (간단한 키워드 기반)
            let messageCategory = 'encouragement';
            if (message.includes('연속') || message.includes('완벽') || message.includes('세트') || message.includes('챔피언')) {
                messageCategory = 'achievement';
            }
            
            // 메시지 표시 (로딩 애니메이션 제거하고 메시지 표시)
            chatBubble.innerHTML = message;
            chatBubble.className = `chat-bubble ${messageCategory}`;
            
            console.log('메신저 스타일 인사이트 업데이트 성공:', message);
            
        }, 1000); // 1초 타이핑 애니메이션 후 메시지 표시
        
    } catch (error) {
        console.error('메신저 스타일 인사이트 업데이트 실패:', error);
        
        // 에러 시 기본 메시지 (1초 후)
        setTimeout(() => {
            chatBubble.innerHTML = '오늘도 건강한 하루를 만들어가고 계시네요!';
            chatBubble.className = 'chat-bubble encouragement';
        }, 1000);
    }
}

// 🎮 배지 시스템 헬퍼 함수들
function getTodayExerciseCount() {
    const history = getExerciseHistory();
    const today = getCurrentUserTime().toDateString();
    return history.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === today;
    }).length;
}

function getMaxIntensityEver() {
    const history = getExerciseHistory();
    let maxInhale = 1;
    let maxExhale = 1;
    
    history.forEach(record => {
        if (record.resistanceSettings) {
            maxInhale = Math.max(maxInhale, record.resistanceSettings.inhale || 1);
            maxExhale = Math.max(maxExhale, record.resistanceSettings.exhale || 1);
        }
    });
    
    return { inhale: maxInhale, exhale: maxExhale };
}

function getSkippedRestCount() {
    return parseInt(localStorage.getItem('skippedRestCount') || '0');
}

function incrementSkippedRestCount() {
    const count = getSkippedRestCount() + 1;
    localStorage.setItem('skippedRestCount', count.toString());
}

function getEarlyMorningCount() {
    const history = getExerciseHistory();
    return history.filter(record => {
        const recordDate = new Date(record.date);
        const hour = recordDate.getHours();
        return hour < 6;
    }).length;
}

// 🏆 배지 시스템 관련 함수들

// 🎮 새로운 배지 관련 헬퍼 함수들
function getQuizPerfectCount() {
    return parseInt(localStorage.getItem('quizPerfectCount') || '0');
}

function incrementQuizPerfectCount() {
    const count = getQuizPerfectCount() + 1;
    localStorage.setItem('quizPerfectCount', count.toString());
}

function getConsecutivePerfectCount() {
    return parseInt(localStorage.getItem('consecutivePerfectCount') || '0');
}

function updateConsecutivePerfectCount(isPerfect) {
    if (isPerfect) {
        const count = getConsecutivePerfectCount() + 1;
        localStorage.setItem('consecutivePerfectCount', count.toString());
    } else {
        localStorage.setItem('consecutivePerfectCount', '0');
    }
}

function getSolvedQuestionsCount() {
    const solved = JSON.parse(localStorage.getItem('solvedQuestions') || '[]');
    return solved.length;
}

function addSolvedQuestion(questionIndex) {
    const solved = JSON.parse(localStorage.getItem('solvedQuestions') || '[]');
    if (!solved.includes(questionIndex)) {
        solved.push(questionIndex);
        localStorage.setItem('solvedQuestions', JSON.stringify(solved));
    }
}

function getEarnedBadges() {
    return JSON.parse(localStorage.getItem('earnedBadges') || '[]');
}

function saveBadge(badgeId) {
    const earnedBadges = getEarnedBadges();
    if (!earnedBadges.includes(badgeId)) {
        earnedBadges.push(badgeId);
        localStorage.setItem('earnedBadges', JSON.stringify(earnedBadges));
        return true; // 새로 획득함
    }
    return false; // 이미 있음
}

function checkNewBadges(stats) {
    const newBadges = [];
    
    BADGES_CONFIG.forEach(badge => {
        if (badge.condition(stats)) {
            const isNew = saveBadge(badge.id);
            if (isNew) {
                newBadges.push(badge);
            }
        }
    });
    
    return newBadges;
}

function showBadgePopup(badge) {
    const popup = document.getElementById('badgePopup');
    const icon = document.getElementById('badgePopupIcon');
    const name = document.getElementById('badgePopupName');
    const description = document.getElementById('badgePopupDescription');
    
    icon.textContent = badge.icon;
    name.textContent = badge.name;
    description.textContent = badge.description;
    
    popup.classList.add('show');
    
    // 팝업 표시 이벤트 추가
    gtag('event', 'badge_earned', {
        badge_id: badge.id,
        badge_name: badge.name
    });
}

function closeBadgePopup() {
    document.getElementById('badgePopup').classList.remove('show');
}

function updateBadgesDisplay() {
    const earnedBadges = getEarnedBadges();
    const badgesGrid = document.getElementById('badgesGrid');
    const badgesProgress = document.getElementById('badgesProgress');
    
    // 진행도 업데이트
    badgesProgress.textContent = `수집한 배지: ${earnedBadges.length}/${BADGES_CONFIG.length}`;
    
    // 배지 그리드 생성
    badgesGrid.innerHTML = '';
    BADGES_CONFIG.forEach(badge => {
        const isEarned = earnedBadges.includes(badge.id);
        const badgeSlot = document.createElement('div');
        badgeSlot.className = `badge-slot ${isEarned ? 'earned' : ''}`;
        
        badgeSlot.innerHTML = `
            <div class="badge-icon">${isEarned ? badge.icon : '?'}</div>
            <div class="badge-hint">${isEarned ? badge.name : badge.hint}</div>
        `;
        
        badgesGrid.appendChild(badgeSlot);
    });
}

// 🎮 새로운 기능: 퀴즈 완료 배지 처리
function handleQuizCompletionBadges() {
    let badgesToShow = [];
    
    // 퀴즈 탐험가: 2문제를 모두 정답으로 맞혔을 때
    if (quizCorrectAnswers === 2) {
        incrementQuizPerfectCount();
        updateConsecutivePerfectCount(true);
        
        const isNewBadge = saveBadge('quiz_explorer');
        if (isNewBadge) {
            const badge = BADGES_CONFIG.find(b => b.id === 'quiz_explorer');
            badgesToShow.push(badge);
        }
    } else {
        updateConsecutivePerfectCount(false);
    }
    
    // 퀴즈 완벽주의자: 3번 연속 완벽
    if (getConsecutivePerfectCount() >= 3) {
        const isNewBadge = saveBadge('quiz_perfectionist');
        if (isNewBadge) {
            const badge = BADGES_CONFIG.find(b => b.id === 'quiz_perfectionist');
            badgesToShow.push(badge);
        }
    }
    
    // 퀴즈 마스터: 모든 문제 경험
    if (getSolvedQuestionsCount() >= 6) {
        const isNewBadge = saveBadge('quiz_master');
        if (isNewBadge) {
            const badge = BADGES_CONFIG.find(b => b.id === 'quiz_master');
            badgesToShow.push(badge);
        }
    }
    
    // 배지가 있으면 첫 번째 배지 즉시 팝업 표시
    if (badgesToShow.length > 0) {
        setTimeout(() => {
            showBadgePopup(badgesToShow[0]);
        }, 1000);
    }
} 





























 