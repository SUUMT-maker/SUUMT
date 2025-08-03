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
    chartSubtitle.textContent = `${weekStartStr} ~ ${weekEndStr} 트레이닝 성과`;

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