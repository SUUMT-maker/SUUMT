// 🕐 사용자 위치 기반 시간대 자동 설정
function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getCurrentUserTime() {
    return new Date();
}

function formatDateForUser(date) {
    return date.toLocaleDateString('ko-KR', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
        timeZone: getUserTimezone()
    });
}

function getWeekStartDate() {
    const now = getCurrentUserTime();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    // 월요일 시작으로 변경
    startDate.setDate(now.getDate() - (dayOfWeek + 6) % 7);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
}

function getWeekEndDate() {
    const startDate = getWeekStartDate();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
}

function isDateInCurrentWeek(date) {
    const checkDate = new Date(date);
    const weekStart = getWeekStartDate();
    const weekEnd = getWeekEndDate();
    return checkDate >= weekStart && checkDate <= weekEnd;
}
