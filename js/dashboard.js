// 📊 기록탭 개인화 대시보드 통합 코드

// 🎨 개인화 대시보드 HTML 구조 (기존 기록탭 상단에 추가)
const DASHBOARD_HTML = `
<!-- 📊 개인화 대시보드 섹션 (기록탭 상단에 추가) -->
<div class="personal-dashboard-section" style="margin-bottom: 24px;">
    <!-- 대시보드 헤더 -->
    <div class="section-header">
        <h2 class="section-title">
            <span class="section-icon">📊</span>
            <span>나의 호흡 분석</span>
        </h2>
        <div class="section-subtitle">개인화된 트레이닝 인사이트</div>
    </div>

    <!-- 주요 지표 카드 그리드 -->
    <div class="dashboard-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 20px; margin-bottom: 24px;">
        <div class="stat-card dashboard-stat-card">
            <div class="stat-card-header">
                <div class="stat-card-title">총 호흡수</div>
                <div class="stat-card-icon">🫁</div>
            </div>
            <div class="stat-card-value">
                <div class="stat-number" id="dashboardTotalBreaths">0</div>
                <div class="stat-unit">회</div>
            </div>
        </div>

        <div class="stat-card dashboard-stat-card">
            <div class="stat-card-header">
                <div class="stat-card-title">평균 호흡수</div>
                <div class="stat-card-icon">📈</div>
            </div>
            <div class="stat-card-value">
                <div class="stat-number" id="dashboardAvgBreaths">0</div>
                <div class="stat-unit">회</div>
            </div>
        </div>

        <div class="stat-card dashboard-stat-card">
            <div class="stat-card-header">
                <div class="stat-card-title">완료율</div>
                <div class="stat-card-icon">🎯</div>
            </div>
            <div class="stat-card-value">
                <div class="stat-number" id="dashboardCompletionRate">0</div>
                <div class="stat-unit">%</div>
            </div>
        </div>

        <div class="stat-card dashboard-stat-card">
            <div class="stat-card-header">
                <div class="stat-card-title">평균 저항</div>
                <div class="stat-card-icon">💪</div>
            </div>
            <div class="stat-card-value">
                <div class="stat-number" id="dashboardAvgResistance">0</div>
                <div class="stat-unit">단계</div>
            </div>
        </div>
    </div>

    <!-- 주간 호흡수 트렌드 차트 -->
    <div class="dashboard-chart-container" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 20px; overflow: visible;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1E1E1E; margin: 0;">주간 호흡 트렌드</h3>
            <select id="dashboardTimeRange" style="padding: 8px 12px; border: 1px solid #E7E7E7; border-radius: 8px; font-size: 14px;">
                <option value="weekly">최근 7일</option>
                <option value="monthly">최근 30일</option>
            </select>
        </div>
        
        <div id="dashboardChart" style="height: 200px; width: 100%;">
            <!-- 차트가 여기에 렌더링됩니다 -->
        </div>
    </div>

    <!-- 저항 단계 진행도 -->
    <div class="dashboard-resistance-container" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 20px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1E1E1E; margin-bottom: 16px;">저항 단계 진행도</h3>
        <div id="dashboardResistanceChart" style="height: 180px; width: 100%;">
            <!-- 저항 차트가 여기에 렌더링됩니다 -->
        </div>
    </div>

    <!-- 피드백 분석 -->
    <div class="dashboard-feedback-container" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 20px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1E1E1E; margin-bottom: 16px;">사용자 피드백 분석</h3>
        <div id="dashboardFeedbackChart" style="height: 150px; width: 100%;">
            <!-- 피드백 차트가 여기에 렌더링됩니다 -->
        </div>
    </div>
</div>
`;

// 📊 개인화 대시보드 클래스
class PersonalDashboard {
    constructor() {
        this.userId = null;
        this.supabaseClient = null;
        this.data = [];
        this.timeRange = 'weekly';
    }

    // 🔧 초기화
    async init() {
        this.userId = window.currentUserId;
        this.supabaseClient = window.supabaseClient;
        
        if (!this.userId || !this.supabaseClient) {
            console.warn('⚠️ 사용자 ID 또는 Supabase 클라이언트가 없습니다.');
            return false;
        }

        console.log('📊 개인화 대시보드 초기화:', this.userId);
        return true;
    }

    // 🗂️ 사용자 운동 데이터 조회
    async fetchUserData() {
        try {
            const { data, error } = await this.supabaseClient
                .from('exercise_sessions')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ 데이터 조회 실패:', error);
                return [];
            }

            console.log(`✅ ${data?.length || 0}개의 운동 기록 조회 완료`);
            this.data = data || [];
            return this.data;

        } catch (err) {
            console.error('❌ 데이터 조회 중 오류:', err);
            return [];
        }
    }

    // 📊 주요 통계 계산
    calculateStats() {
        if (!this.data.length) {
            return {
                totalBreaths: 0,
                avgBreaths: 0,
                completionRate: 0,
                avgResistance: 0,
                totalSessions: 0
            };
        }

        const filtered = this.getFilteredData();
        const totalBreaths = filtered.reduce((sum, item) => sum + (item.completed_breaths || 0), 0);
        const avgBreaths = Math.round(totalBreaths / Math.max(filtered.length, 1));
        const completedSessions = filtered.filter(item => !item.is_aborted).length;
        const completionRate = Math.round((completedSessions / Math.max(filtered.length, 1)) * 100);
        const avgResistance = Math.round(
            filtered.reduce((sum, item) => 
                sum + ((item.inhale_resistance || 0) + (item.exhale_resistance || 0)) / 2, 0
            ) / Math.max(filtered.length, 1) * 10
        ) / 10;

        return {
            totalBreaths,
            avgBreaths,
            completionRate,
            avgResistance,
            totalSessions: filtered.length
        };
    }

    // 🗓️ 시간 범위에 따른 데이터 필터링
    getFilteredData() {
        const now = new Date();
        const daysBack = this.timeRange === 'weekly' ? 7 : 30;
        const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        
        return this.data.filter(item => {
            const itemDate = new Date(item.created_at);
            return itemDate >= cutoffDate;
        }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    // 📈 차트 데이터 준비
    prepareChartData() {
        const filtered = this.getFilteredData();
        
        // 일별로 그룹화
        const dailyData = {};
        filtered.forEach(item => {
            const date = new Date(item.created_at).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = { breaths: 0, resistance: 0, count: 0 };
            }
            dailyData[date].breaths += item.completed_breaths || 0;
            dailyData[date].resistance += ((item.inhale_resistance || 0) + (item.exhale_resistance || 0)) / 2;
            dailyData[date].count += 1;
        });

        // 차트용 데이터 변환
        const chartData = Object.entries(dailyData).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            호흡수: data.breaths,
            목표: 20,
            평균저항: Math.round(data.resistance / data.count * 10) / 10
        }));

        return chartData;
    }

    // 💭 피드백 분포 데이터
    prepareFeedbackData() {
        const filtered = this.getFilteredData();
        const feedbackCount = filtered.reduce((acc, item) => {
            const feedback = item.user_feedback;
            if (feedback) {
                acc[feedback] = (acc[feedback] || 0) + 1;
            }
            return acc;
        }, {});

        return Object.entries(feedbackCount).map(([feedback, count]) => ({
            name: feedback === 'easy' ? '쉬움' : feedback === 'perfect' ? '완벽' : '어려움',
            value: count,
            color: feedback === 'easy' ? '#60A5FA' : feedback === 'perfect' ? '#22C55E' : '#F59E0B'
        }));
    }

    // 🎨 UI 업데이트
    updateUI() {
        const stats = this.calculateStats();
        
        // 주요 지표 업데이트
        document.getElementById('dashboardTotalBreaths').textContent = stats.totalBreaths;
        document.getElementById('dashboardAvgBreaths').textContent = stats.avgBreaths;
        document.getElementById('dashboardCompletionRate').textContent = stats.completionRate;
        document.getElementById('dashboardAvgResistance').textContent = stats.avgResistance;

        // 차트 렌더링
        this.renderCharts();
    }

    // 📊 간단한 SVG 차트 렌더링
    renderCharts() {
        this.renderTrendChart();
        this.renderResistanceChart();
        this.renderFeedbackChart();
    }

    // 📈 트렌드 차트 렌더링 (간단한 SVG)
    renderTrendChart() {
        const chartData = this.prepareChartData();
        const container = document.getElementById('dashboardChart');
        
        if (!container || !chartData.length) {
            container.innerHTML = '<div style="text-align: center; color: #666; padding: 60px 0;">데이터가 없습니다</div>';
            return;
        }

        const maxBreaths = Math.max(...chartData.map(d => d.호흡수), 20);
        const width = container.clientWidth - 40;
        const height = 160;
        
        let svg = `<svg width="${width}" height="${height}" style="margin: 20px;">`;
        
        // 배경 그리드
        for (let i = 0; i <= 4; i++) {
            const y = (height - 40) * i / 4 + 20;
            svg += `<line x1="40" y1="${y}" x2="${width - 20}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
        }
        
        // 데이터 포인트와 선
        const stepX = (width - 80) / Math.max(chartData.length - 1, 1);
        let path = '';
        
        chartData.forEach((d, i) => {
            const x = 40 + i * stepX;
            const y = height - 40 - (d.호흡수 / maxBreaths) * (height - 60);
            
            if (i === 0) path += `M ${x} ${y}`;
            else path += ` L ${x} ${y}`;
            
            // 데이터 포인트
            svg += `<circle cx="${x}" cy="${y}" r="4" fill="#3B82F6"/>`;
            
            // 날짜 라벨
            svg += `<text x="${x}" y="${height - 5}" text-anchor="middle" font-size="12" fill="#666">${d.date}</text>`;
        });
        
        // 트렌드 라인
        svg += `<path d="${path}" stroke="#3B82F6" stroke-width="2" fill="none"/>`;
        
        // 목표 라인
        const targetY = height - 40 - (20 / maxBreaths) * (height - 60);
        svg += `<line x1="40" y1="${targetY}" x2="${width - 20}" y2="${targetY}" stroke="#F59E0B" stroke-width="2" stroke-dasharray="5,5"/>`;
        
        svg += '</svg>';
        container.innerHTML = svg;
    }

    // 💪 저항 차트 렌더링
    renderResistanceChart() {
        const chartData = this.prepareChartData();
        const container = document.getElementById('dashboardResistanceChart');
        
        if (!container || !chartData.length) {
            container.innerHTML = '<div style="text-align: center; color: #666; padding: 60px 0;">데이터가 없습니다</div>';
            return;
        }

        const width = container.clientWidth;
        const height = 140;
        const barWidth = (width - 80) / chartData.length - 10;
        
        let svg = `<svg width="${width}" height="${height}">`;
        
        chartData.forEach((d, i) => {
            const x = 40 + i * (barWidth + 10);
            const barHeight = (d.평균저항 / 5) * (height - 60);
            const y = height - 40 - barHeight;
            
            // 저항 막대
            svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#22C55E" rx="2"/>`;
            
            // 날짜 라벨
            svg += `<text x="${x + barWidth/2}" y="${height - 5}" text-anchor="middle" font-size="10" fill="#666">${d.date}</text>`;
            
            // 값 라벨
            if (d.평균저항 > 0) {
                svg += `<text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="10" fill="#666">${d.평균저항}</text>`;
            }
        });
        
        svg += '</svg>';
        container.innerHTML = svg;
    }

    // 💭 피드백 차트 렌더링 (도넛 차트)
    renderFeedbackChart() {
        const feedbackData = this.prepareFeedbackData();
        const container = document.getElementById('dashboardFeedbackChart');
        
        if (!container || !feedbackData.length) {
            container.innerHTML = '<div style="text-align: center; color: #666; padding: 40px 0;">피드백 데이터가 없습니다</div>';
            return;
        }

        const total = feedbackData.reduce((sum, d) => sum + d.value, 0);
        const centerX = 75;
        const centerY = 75;
        const radius = 50;
        
        let svg = `<svg width="150" height="150">`;
        let startAngle = 0;
        
        feedbackData.forEach(d => {
            const angle = (d.value / total) * 2 * Math.PI;
            const endAngle = startAngle + angle;
            
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            
            const largeArcFlag = angle > Math.PI ? 1 : 0;
            
            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');
            
            svg += `<path d="${pathData}" fill="${d.color}"/>`;
            startAngle = endAngle;
        });
        
        svg += '</svg>';
        
        // 범례 추가
        let legend = '<div style="margin-left: 160px; margin-top: -150px;">';
        feedbackData.forEach(d => {
            const percent = Math.round((d.value / total) * 100);
            legend += `
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div style="width: 12px; height: 12px; background: ${d.color}; border-radius: 2px; margin-right: 8px;"></div>
                    <span style="font-size: 14px; color: #666;">${d.name} ${percent}%</span>
                </div>
            `;
        });
        legend += '</div>';
        
        container.innerHTML = svg + legend;
    }
}

// 🔧 기존 기록탭 초기화 함수 확장
async function initRecordsTabWithDashboard() {
    console.log('📊 대시보드 통합 기록탭 초기화 시작...');
    
    // 1. 대시보드 HTML 추가
    const recordsScreen = document.getElementById('recordsScreen');
    if (!recordsScreen) {
        console.error('❌ recordsScreen을 찾을 수 없습니다.');
        return;
    }

    // 기존 섹션 헤더 다음에 대시보드 추가
    const existingHeader = recordsScreen.querySelector('.section-header');
    if (existingHeader) {
        existingHeader.insertAdjacentHTML('afterend', DASHBOARD_HTML);
    } else {
        recordsScreen.insertAdjacentHTML('afterbegin', DASHBOARD_HTML);
    }

    // 2. 개인화 대시보드 초기화
    const dashboard = new PersonalDashboard();
    const initialized = await dashboard.init();
    
    if (!initialized) {
        console.warn('⚠️ 대시보드 초기화 실패');
        return;
    }

    // 3. 데이터 로드 및 렌더링
    await dashboard.fetchUserData();
    dashboard.updateUI();

    // 4. 시간 범위 변경 이벤트
    const timeRangeSelect = document.getElementById('dashboardTimeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', async (e) => {
            const target = e.target;
            dashboard.timeRange = target.value;
            dashboard.updateUI();
        });
    }

    // 5. 기존 달력 기능 초기화
    await initOriginalRecordsTab();
    
    console.log('✅ 대시보드 통합 기록탭 초기화 완료');
}

// 🔧 기존 기록탭 초기화 (이름 변경)
async function initOriginalRecordsTab() {
    // 기존 initRecordsTab 함수 내용
    showBottomNav();
    
    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    
    if (prevBtn && !prevBtn.hasAttribute('data-event-added')) {
        prevBtn.addEventListener('click', () => navigateCalendar('prev'));
        prevBtn.setAttribute('data-event-added', 'true');
    }
    
    if (nextBtn && !nextBtn.hasAttribute('data-event-added')) {
        nextBtn.addEventListener('click', () => navigateCalendar('next'));
        nextBtn.setAttribute('data-event-added', 'true');
    }
    
    await renderCalendar();
}

// 🎨 대시보드용 추가 CSS
const DASHBOARD_CSS = `
<style>
.dashboard-stat-card {
    transition: all 0.3s ease;
    border-left: 4px solid #3B82F6;
}

.dashboard-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.dashboard-chart-container:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.dashboard-resistance-container:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.dashboard-feedback-container:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

@media (max-width: 480px) {
    .dashboard-stats-grid {
        gap: 12px !important;
        padding: 0 16px !important;
    }
    
    .dashboard-chart-container,
    .dashboard-resistance-container,
    .dashboard-feedback-container {
        margin: 0 16px 24px !important;
        padding: 16px !important;
    }
}
</style>
`;

// 🚀 CSS 추가
document.head.insertAdjacentHTML('beforeend', DASHBOARD_CSS);

// 🔧 전역 함수 등록 (기존 함수 대체)
window.initRecordsTab = initRecordsTabWithDashboard;
window.onRecordsTabClick = initRecordsTabWithDashboard;

console.log('📊 개인화 대시보드 통합 모듈 로드 완료');
