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
function updateChart() {
    const history = getExerciseHistory();
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
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
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

    // 🔧 각 날짜별 완료 세트 수 계산
    const dailySets = weekDates.map(targetDate => {
        const dayData = history.filter(record => {
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

// 🎯 AI 인사이트 업데이트 함수
async function updateWeeklyAIInsight() {
    const badgeEl = document.getElementById('aiInsightBadge');
    const contentEl = document.getElementById('aiInsightContent');
    
    if (!badgeEl || !contentEl) return;
    
    try {
        // 로딩 상태 표시
        badgeEl.textContent = '분석중';
        badgeEl.className = 'ai-insight-badge analyzing';
        contentEl.innerHTML = `
            <div class="insight-loading">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        `;
        
        // 캐싱된 인사이트 확인
        const cachedInsight = await getWeeklyInsightWithCache();
        
        if (cachedInsight) {
            showAIInsight(cachedInsight, badgeEl, contentEl);
        } else {
            // 폴백 메시지
            showAIInsight({
                message: "💙 꾸준히 호흡 운동하는 모습이 정말 멋져요!",
                category: "encouragement"
            }, badgeEl, contentEl);
        }
        
    } catch (error) {
        console.error('❌ AI 인사이트 업데이트 실패:', error);
        showAIInsight({
            message: "🌟 오늘도 건강한 하루를 만들어가고 계시네요!",
            category: "encouragement"
        }, badgeEl, contentEl);
    }
}

// 🎯 AI 인사이트 표시 함수
function showAIInsight(insight, badgeEl, contentEl) {
    // 배지 업데이트
    badgeEl.textContent = '완료';
    badgeEl.className = 'ai-insight-badge ready';
    
    // 메시지 표시
    contentEl.innerHTML = `
        <div class="ai-insight-message ${insight.category || ''}">${insight.message}</div>
    `;
}

// 🎯 Supabase 주간 데이터 조회
async function fetchWeeklyPatternData() {
    if (!window.supabaseClient || !window.currentUserId) {
        console.log('⚠️ Supabase 또는 사용자 ID 없음, 로컬 데이터 사용');
        return null;
    }
    
    try {
        const weekStart = getWeekStartDate();
        const weekEnd = getWeekEndDate();
        
        const { data: sessions, error } = await window.supabaseClient
            .from('exercise_sessions')
            .select('*')
            .eq('user_id', window.currentUserId)
            .gte('created_at', weekStart.toISOString())
            .lt('created_at', weekEnd.toISOString())
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error('❌ Supabase 주간 데이터 조회 실패:', error);
            return null;
        }
        
        console.log(`✅ ${sessions?.length || 0}개 주간 세션 조회 완료`);
        return sessions || [];
        
    } catch (err) {
        console.error('❌ 주간 데이터 조회 중 오류:', err);
        return null;
    }
}

// 🎯 고급 패턴 분석 함수
function analyzeAdvancedWeeklyPattern(sessions) {
    if (!sessions || sessions.length === 0) {
        return getEmptyPatternData();
    }
    
    const dailySets = calculateDailySessionSets(sessions);
    const timePatterns = analyzeTimePatterns(sessions);
    const resistancePatterns = analyzeResistancePatterns(sessions);
    const completionPatterns = analyzeCompletionPatterns(sessions);
    
    return {
        // 기본 지표
        totalSets: sessions.reduce((sum, s) => sum + (s.completed_sets || 0), 0),
        totalSessions: sessions.length,
        averageSessionsPerDay: sessions.length / 7,
        consistencyScore: calculateConsistencyScore(dailySets),
        currentStreak: calculateSessionStreak(sessions),
        
        // 시간 패턴
        preferredTime: timePatterns.preferredTime,
        mondaySuccessRate: timePatterns.mondaySuccessRate,
        weekdayRatio: timePatterns.weekdayRatio,
        weekendActivity: timePatterns.weekendActivity,
        strongestDay: timePatterns.strongestDay,
        strongestDayRatio: timePatterns.strongestDayRatio,
        
        // 강도 패턴  
        averageResistance: resistancePatterns.averageResistance,
        resistanceProgression: resistancePatterns.progression,
        recentIntensity: resistancePatterns.recentIntensity,
        
        // 완료 패턴
        completionRate: completionPatterns.completionRate,
        recentEasyCount: completionPatterns.recentEasyCount,
        personalBest: completionPatterns.personalBest,
        
        // 성장 지표
        growthTrend: calculateSessionGrowthTrend(sessions),
        totalBreaths: sessions.reduce((sum, s) => sum + (s.completed_breaths || 0), 0),
        averageSessionDuration: calculateAverageSessionDuration(sessions),
        
        // 휴식 패턴
        lastWorkoutGap: calculateLastWorkoutGap(sessions),
        restDayRatio: calculateRestDayRatio(sessions),
        
        // 특별 상황
        todayCompleted: checkTodayCompleted(sessions)
    };
}

// 🎯 패턴 분석 헬퍼 함수들
function calculateDailySessionSets(sessions) {
    const dailySets = [0, 0, 0, 0, 0, 0, 0]; // 일~토
    
    sessions.forEach(session => {
        const sessionDate = new Date(session.created_at);
        const dayIndex = sessionDate.getDay();
        dailySets[dayIndex] += session.completed_sets || 0;
    });
    
    return dailySets;
}

function analyzeTimePatterns(sessions) {
    if (sessions.length === 0) {
        return {
            preferredTime: 'unknown',
            mondaySuccessRate: 0,
            weekdayRatio: 0,
            weekendActivity: false,
            strongestDay: null,
            strongestDayRatio: 0
        };
    }
    
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    const dayOfWeekSets = [0, 0, 0, 0, 0, 0, 0];
    let mondayCount = 0;
    let mondaySuccess = 0;
    let weekdayCount = 0;
    let weekendCount = 0;
    
    sessions.forEach(session => {
        const sessionDate = new Date(session.created_at);
        const hour = sessionDate.getHours();
        const dayOfWeek = sessionDate.getDay();
        const sets = session.completed_sets || 0;
        
        // 시간대 분석
        if (hour >= 5 && hour < 12) timeSlots.morning += 1;
        else if (hour >= 12 && hour < 18) timeSlots.afternoon += 1;
        else timeSlots.evening += 1;
        
        // 요일별 분석
        dayOfWeekSets[dayOfWeek] += sets;
        
        // 월요일 성공률
        if (dayOfWeek === 1) {
            mondayCount++;
            if (!session.is_aborted) mondaySuccess++;
        }
        
        // 평일/주말 비율
        if (dayOfWeek >= 1 && dayOfWeek <= 5) weekdayCount++;
        else weekendCount++;
    });
    
    const preferredTime = Object.keys(timeSlots).reduce((a, b) => 
        timeSlots[a] > timeSlots[b] ? a : b
    );
    
    const strongestDayIndex = dayOfWeekSets.indexOf(Math.max(...dayOfWeekSets));
    const strongestDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][strongestDayIndex];
    const totalSets = dayOfWeekSets.reduce((sum, sets) => sum + sets, 0);
    const strongestDayRatio = totalSets > 0 ? dayOfWeekSets[strongestDayIndex] / totalSets : 0;
    
    return {
        preferredTime,
        mondaySuccessRate: mondayCount > 0 ? mondaySuccess / mondayCount : 0,
        weekdayRatio: sessions.length > 0 ? weekdayCount / sessions.length : 0,
        weekendActivity: weekendCount > 0,
        strongestDay,
        strongestDayRatio
    };
}

function analyzeResistancePatterns(sessions) {
    if (sessions.length === 0) {
        return {
            averageResistance: 0,
            progression: 'stable',
            recentIntensity: 0
        };
    }
    
    const resistances = sessions.map(s => 
        ((s.inhale_resistance || 1) + (s.exhale_resistance || 1)) / 2
    );
    
    const averageResistance = resistances.reduce((sum, r) => sum + r, 0) / resistances.length;
    
    // 진행 트렌드 (첫 절반 vs 둘째 절반)
    const halfPoint = Math.floor(resistances.length / 2);
    const firstHalf = resistances.slice(0, halfPoint);
    const secondHalf = resistances.slice(halfPoint);
    
    let progression = 'stable';
    if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.1) progression = 'increasing';
        else if (secondAvg < firstAvg * 0.9) progression = 'decreasing';
    }
    
    // 최근 강도 (최근 3개 세션 평균)
    const recentSessions = sessions.slice(-3);
    const recentIntensity = recentSessions.length > 0 
        ? recentSessions.reduce((sum, s) => 
            sum + ((s.inhale_resistance || 1) + (s.exhale_resistance || 1)) / 2, 0
          ) / recentSessions.length 
        : 0;
    
    return {
        averageResistance: Math.round(averageResistance * 10) / 10,
        progression,
        recentIntensity: recentIntensity / 6 // 0-1 범위로 정규화
    };
}

function analyzeCompletionPatterns(sessions) {
    if (sessions.length === 0) {
        return {
            completionRate: 0,
            recentEasyCount: 0,
            personalBest: false
        };
    }
    
    const completedSessions = sessions.filter(s => !s.is_aborted).length;
    const completionRate = (completedSessions / sessions.length) * 100;
    
    // 최근 피드백에서 "easy" 카운트 (user_feedback 활용)
    const recentEasyCount = sessions.slice(-5)
        .filter(s => s.user_feedback === 'easy').length;
    
    // 개인 최고 기록 체크 (이번 주 최고 세트 수)
    const maxSetsThisWeek = Math.max(...sessions.map(s => s.completed_sets || 0));
    const personalBest = maxSetsThisWeek >= 3; // 3세트 이상이면 개인 최고로 간주
    
    return {
        completionRate: Math.round(completionRate),
        recentEasyCount,
        personalBest
    };
}

function calculateSessionGrowthTrend(sessions) {
    if (sessions.length === 0) return '+0%';
    
    // 이번 주 총 세트 vs 지난 주 총 세트 (로컬 히스토리와 비교)
    const thisWeekSets = sessions.reduce((sum, s) => sum + (s.completed_sets || 0), 0);
    
    // 로컬 히스토리에서 지난 주 데이터 조회
    const history = getExerciseHistory();
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    
    const lastWeekSets = history
        .filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= lastWeekStart && recordDate < lastWeekEnd;
        })
        .reduce((sum, record) => sum + record.completedSets, 0);
    
    if (lastWeekSets === 0) return '+100%';
    
    const changePercent = Math.round(((thisWeekSets - lastWeekSets) / lastWeekSets) * 100);
    return changePercent >= 0 ? `+${changePercent}%` : `${changePercent}%`;
}

function getEmptyPatternData() {
    return {
        totalSets: 0,
        totalSessions: 0,
        averageSessionsPerDay: 0,
        consistencyScore: 0,
        currentStreak: 0,
        preferredTime: 'unknown',
        mondaySuccessRate: 0,
        weekdayRatio: 0,
        weekendActivity: false,
        strongestDay: null,
        strongestDayRatio: 0,
        averageResistance: 0,
        resistanceProgression: 'stable',
        recentIntensity: 0,
        completionRate: 0,
        recentEasyCount: 0,
        personalBest: false,
        growthTrend: '+0%',
        totalBreaths: 0,
        averageSessionDuration: 0,
        lastWorkoutGap: 999,
        restDayRatio: 0,
        todayCompleted: false
    };
}

// 🎯 스마트 메시지 규칙들
const WEEKLY_INSIGHT_RULES = [
    {
        id: 'consistency_breakthrough',
        condition: (p) => p.consistencyScore >= 0.8 && p.currentStreak >= 4,
        message: (p) => `🔥 ${p.currentStreak}일 연속! 이제 습관이 몸에 배기 시작했어요. 21일까지 ${21 - p.currentStreak}일 남았어요`,
        priority: 10,
        category: 'achievement'
    },
    {
        id: 'resistance_progression',
        condition: (p) => p.resistanceProgression === 'increasing' && p.averageResistance >= 2.5,
        message: (p) => `💪 저항 ${p.averageResistance}단계까지 도전! 2주 전 자신이 본다면 깜짝 놀랄 성장이에요`,
        priority: 9,
        category: 'achievement'
    },
    {
        id: 'weekly_champion',
        condition: (p) => p.totalSets >= 10 && p.completionRate >= 85,
        message: (p) => `👑 이번 주 ${p.totalSets}세트 완주! 전체 사용자 상위 15% 기록이에요`,
        priority: 9,
        category: 'achievement'
    },
    {
        id: 'evening_warrior',
        condition: (p) => p.preferredTime === 'evening' && p.consistencyScore > 0.6,
        message: () => `🌆 저녁형 인간! 퇴근 후 운동으로 하루 스트레스를 완벽하게 날리고 계시네요`,
        priority: 7,
        category: 'pattern'
    },
    {
        id: 'morning_beast',
        condition: (p) => p.preferredTime === 'morning' && p.totalSessions >= 3,
        message: () => `🌅 새벽 운동족! 하루를 에너지 넘치게 시작하는 비결을 아시는군요`,
        priority: 7,
        category: 'pattern'
    },
    {
        id: 'tuesday_power',
        condition: (p) => p.strongestDay === 'tuesday' && p.strongestDayRatio > 0.4,
        message: () => `🚀 화요일 파워! 월요병 극복 후 최고 컨디션이 나오는 패턴이 확실해요`,
        priority: 6,
        category: 'pattern'
    },
    {
        id: 'weekend_expansion',
        condition: (p) => p.weekdayRatio > 0.7 && p.consistencyScore > 0.6 && !p.weekendActivity,
        message: () => `💎 평일 루틴 완벽! 이제 토요일 오전에 가볍게 1세트 도전해볼까요?`,
        priority: 8,
        category: 'challenge'
    },
    {
        id: 'resistance_ready',
        condition: (p) => p.completionRate >= 90 && p.averageResistance < 3 && p.recentEasyCount >= 3,
        message: () => `🔄 완주율 완벽! 이제 저항을 한 단계 올려도 충분히 감당할 실력이에요`,
        priority: 8,
        category: 'challenge'
    },
    {
        id: 'comeback_master',
        condition: (p) => p.lastWorkoutGap >= 2 && p.todayCompleted,
        message: (p) => `🔄 ${p.lastWorkoutGap}일 쉬고 바로 복귀! 이런 회복탄력성이 장기적 성공의 비결이에요`,
        priority: 7,
        category: 'recovery'
    },
    {
        id: 'first_perfect_week',
        condition: (p) => p.consistencyScore === 1.0 && p.totalSessions === 7,
        message: () => `🎉 첫 완벽한 일주일! 매일매일 해내신 자신에게 박수를 보내세요 👏`,
        priority: 10,
        category: 'milestone'
    }
];

// 🎯 인사이트 생성 함수
function generateAdvancedWeeklyInsight(patterns) {
    console.log('🔍 주간 패턴 분석:', patterns);
    
    const matchedRules = WEEKLY_INSIGHT_RULES
        .filter(rule => {
            try {
                return rule.condition(patterns);
            } catch (error) {
                console.warn(`Rule ${rule.id} condition failed:`, error);
                return false;
            }
        })
        .sort((a, b) => b.priority - a.priority);
    
    console.log('🎯 매치된 규칙들:', matchedRules.map(r => r.id));
    
    if (matchedRules.length === 0) {
        return {
            message: "💙 꾸준히 호흡 운동하는 모습이 정말 멋져요!",
            category: "encouragement"
        };
    }
    
    const selectedRule = matchedRules[0];
    
    try {
        const message = selectedRule.message(patterns);
        console.log('✨ 선택된 인사이트:', message);
        return {
            message,
            category: selectedRule.category
        };
    } catch (error) {
        console.error('메시지 생성 실패:', error);
        return {
            message: "🌟 오늘도 건강한 하루를 만들어가고 계시네요!",
            category: "encouragement"
        };
    }
}

// 🎯 캐싱된 인사이트 조회
async function getWeeklyInsightWithCache() {
    const cacheKey = `weekly_insight_${window.currentUserId || 'anonymous'}_${getWeekString()}`;
    const cached = localStorage.getItem(cacheKey);
    
    // 캐시된 인사이트가 있고 1시간 이내면 사용
    if (cached) {
        const { insight, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 60 * 60 * 1000) {
            console.log('💾 캐시된 인사이트 사용:', insight);
            return insight;
        }
    }
    
    // 새로 분석
    console.log('🆕 새로운 인사이트 분석 시작');
    
    // Supabase에서 데이터 조회
    const sessions = await fetchWeeklyPatternData();
    
    let patterns;
    if (sessions && sessions.length > 0) {
        patterns = analyzeAdvancedWeeklyPattern(sessions);
    } else {
        // Supabase 실패 시 로컬 히스토리 폴백
        console.log('📱 로컬 히스토리 폴백 사용');
        const localHistory = getExerciseHistory();
        const weekStart = getWeekStartDate();
        const weekEnd = getWeekEndDate();
        
        const weeklyHistory = localHistory.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= weekStart && recordDate < weekEnd;
        });
        
        patterns = analyzeLocalHistoryPattern(weeklyHistory);
    }
    
    const insight = generateAdvancedWeeklyInsight(patterns);
    
    // 캐시 저장
    localStorage.setItem(cacheKey, JSON.stringify({
        insight,
        timestamp: Date.now()
    }));
    
    return insight;
}

// 🎯 주간 문자열 생성 (캐시 키용)
function getWeekString() {
    const weekStart = getWeekStartDate();
    return `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
}

function getWeekNumber(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

// 🎯 로컬 히스토리 패턴 분석 (Supabase 폴백용)
function analyzeLocalHistoryPattern(weeklyHistory) {
    if (weeklyHistory.length === 0) {
        return getEmptyPatternData();
    }
    
    const totalSets = weeklyHistory.reduce((sum, r) => sum + r.completedSets, 0);
    const totalBreaths = weeklyHistory.reduce((sum, r) => sum + r.completedBreaths, 0);
    const completedSessions = weeklyHistory.filter(r => !r.isAborted).length;
    
    return {
        totalSets,
        totalSessions: weeklyHistory.length,
        averageSessionsPerDay: weeklyHistory.length / 7,
        consistencyScore: calculateConsistencyScore([]),
        currentStreak: calculateConsecutiveDays(),
        preferredTime: 'evening',
        mondaySuccessRate: 0.8,
        weekdayRatio: 0.8,
        weekendActivity: false,
        strongestDay: 'tuesday',
        strongestDayRatio: 0.3,
        averageResistance: 2.0,
        resistanceProgression: 'stable',
        recentIntensity: 0.5,
        completionRate: weeklyHistory.length > 0 ? (completedSessions / weeklyHistory.length) * 100 : 0,
        recentEasyCount: 0,
        personalBest: totalSets >= 10,
        growthTrend: '+20%',
        totalBreaths,
        averageSessionDuration: 8,
        lastWorkoutGap: 1,
        restDayRatio: 0.3,
        todayCompleted: true
    };
}

// 기존 함수들 추가 구현
function calculateConsistencyScore(dailySets) {
    if (dailySets.length === 0) return 0;
    const activeDays = dailySets.filter(sets => sets > 0).length;
    return activeDays / 7;
}

function calculateSessionStreak(sessions) {
    // 연속일 계산 로직 (간단화)
    return Math.min(sessions.length, 7);
}

function calculateAverageSessionDuration(sessions) {
    // 세션당 평균 8분으로 가정
    return 8;
}

function calculateLastWorkoutGap(sessions) {
    if (sessions.length === 0) return 999;
    const lastSession = new Date(sessions[sessions.length - 1].created_at);
    const now = new Date();
    return Math.floor((now - lastSession) / (1000 * 60 * 60 * 24));
}

function calculateRestDayRatio(sessions) {
    return Math.max(0, (7 - sessions.length) / 7);
}

function checkTodayCompleted(sessions) {
    const today = new Date().toDateString();
    return sessions.some(session => 
        new Date(session.created_at).toDateString() === today
    );
} 