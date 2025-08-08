// 📊 기록탭 완전 통합 대시보드 (사용자 디자인 기반)

// 🎨 완전히 새로운 기록탭 HTML 구조
const INTEGRATED_RECORDS_HTML = `
<!-- 📊 나의 호흡 분석 대시보드 -->
<div class="integrated-records-screen">
    <!-- 대시보드 헤더 -->
    <div class="section-header">
        <h2 class="section-title">
            <span class="section-icon">📊</span>
            <span>나의 호흡 분석</span>
        </h2>
        <div class="section-subtitle">개인화된 트레이닝 인사이트와 상세 기록</div>
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

    <!-- 내 호흡 기록 차트 -->
    <div class="breathing-chart-container" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1E1E1E; margin: 0;">내 호흡 기록</h3>
            <select id="chartTimeRange" style="padding: 8px 12px; border: 1px solid #E7E7E7; border-radius: 8px; font-size: 14px;">
                <option value="weekly">최근 7일</option>
                <option value="monthly">최근 30일</option>
            </select>
        </div>
        
        <!-- X축, Y축 설명 추가 -->
        <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">
                📈 <strong>Y축:</strong> 완료한 호흡 횟수 &nbsp;&nbsp; 📅 <strong>X축:</strong> 날짜
            </div>
        </div>
        
        <div id="breathingChart" style="height: 200px; width: 100%;">
            <!-- 차트가 여기에 렌더링됩니다 -->
        </div>
    </div>

    <!-- 달력 섹션 -->
    <div class="calendar-section" style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: 0 20px 24px; padding: 20px;">
        <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1E1E1E; margin: 0;">나의 기록</h3>
            <div style="display: flex; align-items: center; gap: 12px;">
                <button id="prevMonthBtn" style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: #6b7280; cursor: pointer; transition: all 0.2s ease;">‹</button>
                <span id="calendarTitle" style="font-size: 16px; font-weight: 600; color: #1f2937; min-width: 120px; text-align: center;">2025년 8월</span>
                <button id="nextMonthBtn" style="background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: #6b7280; cursor: pointer; transition: all 0.2s ease;">›</button>
            </div>
        </div>
        
        <table class="calendar-table" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
                <tr>
                    <th style="padding: 12px 4px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">일</th>
                    <th style="padding: 12px 4px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">월</th>
                    <th style="padding: 12px 4px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">화</th>
                    <th style="padding: 12px 4px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">수</th>
                    <th style="padding: 12px 4px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">목</th>
                    <th style="padding: 12px 4px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">금</th>
                    <th style="padding: 12px 4px; text-align: center; font-size: 12px; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">토</th>
                </tr>
            </thead>
            <tbody id="calendarBody">
                <!-- 달력 날짜들이 JavaScript로 동적 생성됨 -->
            </tbody>
        </table>
    </div>

    <!-- 선택된 날짜의 기록들 (숨겨져 있다가 표시) -->
    <div id="selectedDateRecords" style="margin: 0 20px 24px; display: none;">
        <!-- 해당 날짜의 운동 기록 카드들이 여기에 생성됩니다 -->
    </div>
</div>
`;

// 📊 통합 기록 대시보드 클래스
class IntegratedRecordsDashboard {
    constructor() {
        this.userId = null;
        this.supabaseClient = null;
        this.exerciseData = [];
        this.aiAdviceData = [];
        this.timeRange = 'weekly';
        this.currentCalendarYear = new Date().getFullYear();
        this.currentCalendarMonth = new Date().getMonth();
        this.selectedDate = null;
    }

    // 🔧 초기화
    async init() {
        this.userId = window.currentUserId;
        this.supabaseClient = window.supabaseClient;
        
        if (!this.userId || !this.supabaseClient) {
            console.warn('⚠️ 사용자 ID 또는 Supabase 클라이언트가 없습니다.');
            return false;
        }

        console.log('📊 통합 기록 대시보드 초기화:', this.userId);
        return true;
    }

    // 🗂️ 사용자 운동 데이터 조회
    async fetchExerciseData() {
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

    // 🤖 AI 조언 데이터 조회 (view_user_ai_advice 테이블 사용)
    async fetchAIAdviceData() {
        try {
            const { data, error } = await this.supabaseClient
                .from('view_user_ai_advice')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ AI 조언 데이터 조회 실패:', error);
                return [];
            }

            console.log(`✅ ${data?.length || 0}개의 AI 조언 조회 완료`);
            this.aiAdviceData = data || [];
            return this.aiAdviceData;

        } catch (err) {
            console.error('❌ AI 조언 데이터 조회 중 오류:', err);
            return [];
        }
    }

    // 📊 주요 통계 계산
    calculateStats() {
        if (!this.exerciseData.length) {
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
        
        return this.exerciseData.filter(item => {
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
                dailyData[date] = { breaths: 0, count: 0 };
            }
            dailyData[date].breaths += item.completed_breaths || 0;
            dailyData[date].count += 1;
        });

        // 차트용 데이터 변환
        const chartData = Object.entries(dailyData).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            호흡수: data.breaths,
            목표: 20
        }));

        return chartData;
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
        this.renderBreathingChart();
        
        // 달력 렌더링
        this.renderCalendar();
    }

    // 📈 내 호흡 기록 차트 렌더링 (X축, Y축 설명 포함)
    renderBreathingChart() {
        const chartData = this.prepareChartData();
        const container = document.getElementById('breathingChart');
        
        if (!container || !chartData.length) {
            container.innerHTML = '<div style="text-align: center; color: #666; padding: 80px 0;">데이터가 없습니다</div>';
            return;
        }

        const maxBreaths = Math.max(...chartData.map(d => d.호흡수), 20);
        const width = container.clientWidth - 40;
        const height = 160;
        
        let svg = `<svg width="${width}" height="${height}" style="margin: 20px;">`;
        
        // Y축 라벨
        for (let i = 0; i <= 4; i++) {
            const y = (height - 40) * i / 4 + 20;
            const value = Math.round((maxBreaths * (4 - i)) / 4);
            svg += `<line x1="40" y1="${y}" x2="${width - 20}" y2="${y}" stroke="#f0f0f0" stroke-width="1"/>`;
            svg += `<text x="35" y="${y + 4}" text-anchor="end" font-size="11" fill="#9CA3AF">${value}</text>`;
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
            svg += `<circle cx="${x}" cy="${y}" r="5" fill="#3B82F6" stroke="white" stroke-width="2"/>`;
            
            // 날짜 라벨
            svg += `<text x="${x}" y="${height - 5}" text-anchor="middle" font-size="11" fill="#6B7280">${d.date}</text>`;
        });
        
        // 트렌드 라인
        svg += `<path d="${path}" stroke="#3B82F6" stroke-width="3" fill="none"/>`;
        
        // 목표 라인
        const targetY = height - 40 - (20 / maxBreaths) * (height - 60);
        svg += `<line x1="40" y1="${targetY}" x2="${width - 20}" y2="${targetY}" stroke="#22C55E" stroke-width="2" stroke-dasharray="5,5"/>`;
        
        // 범례
        svg += `<text x="${width - 100}" y="35" font-size="11" fill="#3B82F6">● 실제 호흡수</text>`;
        svg += `<text x="${width - 100}" y="50" font-size="11" fill="#22C55E">--- 목표 (20회)</text>`;
        
        svg += '</svg>';
        container.innerHTML = svg;
    }

    // 📅 달력 렌더링
    renderCalendar() {
        // 달력 제목 업데이트
        const titleEl = document.getElementById('calendarTitle');
        if (titleEl) {
            const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                               '7월', '8월', '9월', '10월', '11월', '12월'];
            titleEl.textContent = `${this.currentCalendarYear}년 ${monthNames[this.currentCalendarMonth]}`;
        }
        
        // 운동한 날짜들 추출
        const exerciseDates = new Set();
        this.exerciseData.forEach(record => {
            const recordDate = new Date(record.created_at);
            const dateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
            exerciseDates.add(dateStr);
        });
        
        // 달력 바디 렌더링
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;
        
        const firstDay = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
        const lastDay = new Date(this.currentCalendarYear, this.currentCalendarMonth + 1, 0);
        const today = new Date();
        
        let html = '';
        let currentWeek = '';
        
        // 첫 번째 주 - 빈 칸 채우기
        for (let i = 0; i < firstDay.getDay(); i++) {
            currentWeek += '<td class="empty" style="padding: 8px; color: #d1d5db;"></td>';
        }
        
        // 날짜 채우기
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dateStr = `${this.currentCalendarYear}-${String(this.currentCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasRecord = exerciseDates.has(dateStr);
            const isToday = day === today.getDate() && 
                           this.currentCalendarMonth === today.getMonth() && 
                           this.currentCalendarYear === today.getFullYear();
            const isSelected = this.selectedDate === dateStr;
            
            let classes = ['calendar-day'];
            let styles = ['padding: 8px', 'text-align: center', 'cursor: pointer', 'transition: all 0.2s ease', 'border-radius: 8px'];
            
            if (isToday) {
                classes.push('today');
                styles.push('background: #ddd6fe', 'color: #6366f1', 'font-weight: 600');
            }
            if (hasRecord) {
                classes.push('has-record');
                styles.push('background: #3B82F6', 'color: white', 'font-weight: 600'); // 파란색으로 표시
            }
            if (isSelected) {
                classes.push('selected');
                styles.push('background: #1D4ED8', 'color: white', 'transform: scale(1.05)');
            }
            
            currentWeek += `<td class="${classes.join(' ')}" style="${styles.join('; ')}" data-date="${dateStr}" onclick="window.integratedDashboard.onDateClick('${dateStr}')">${day}</td>`;
            
            // 한 주가 완성되면 행 추가
            if ((firstDay.getDay() + day - 1) % 7 === 6) {
                html += `<tr>${currentWeek}</tr>`;
                currentWeek = '';
            }
        }
        
        // 마지막 주 완성
        if (currentWeek) {
            const remainingCells = 7 - ((firstDay.getDay() + lastDay.getDate() - 1) % 7 + 1);
            for (let i = 0; i < remainingCells; i++) {
                currentWeek += '<td class="empty" style="padding: 8px; color: #d1d5db;"></td>';
            }
            html += `<tr>${currentWeek}</tr>`;
        }
        
        calendarBody.innerHTML = html;
    }

    // 📅 날짜 클릭 이벤트 처리
    async onDateClick(dateStr) {
        console.log(`📅 날짜 클릭: ${dateStr}`);
        
        // 이전 선택된 날짜 해제
        const prevSelected = document.querySelector('.calendar-day.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
            prevSelected.style.background = prevSelected.classList.contains('has-record') ? '#3B82F6' : 
                                           prevSelected.classList.contains('today') ? '#ddd6fe' : '';
            prevSelected.style.transform = '';
        }
        
        // 새 날짜 선택
        const newSelected = document.querySelector(`[data-date="${dateStr}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
            newSelected.style.background = '#1D4ED8';
            newSelected.style.color = 'white';
            newSelected.style.transform = 'scale(1.05)';
        }
        
        this.selectedDate = dateStr;
        
        // 해당 날짜의 운동 기록 표시
        await this.renderSelectedDateRecords(dateStr);
    }

    // 📋 선택된 날짜의 운동 기록 렌더링
    async renderSelectedDateRecords(dateStr) {
        const container = document.getElementById('selectedDateRecords');
        if (!container) return;
        
        // 해당 날짜의 운동 기록들 필터링
        const dateRecords = this.exerciseData.filter(record => {
            const recordDate = new Date(record.created_at);
            const recordDateStr = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}-${String(recordDate.getDate()).padStart(2, '0')}`;
            return recordDateStr === dateStr;
        });
        
        if (dateRecords.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
        let html = '';
        
        // 각 운동 기록에 대해 카드 생성
        for (let i = 0; i < dateRecords.length; i++) {
            const record = dateRecords[i];
            
            // 해당 세션의 AI 조언 찾기
            const aiAdvice = this.aiAdviceData.find(advice => advice.session_id === record.id);
            
            const [year, month, day] = dateStr.split('-');
            const displayDate = `${year}년 ${month}월 ${day}일`;
            const sessionNumber = dateRecords.length > 1 ? ` (${i + 1}번째 트레이닝)` : '';
            
            html += `
                <div class="date-record-card" style="background: #E3F2FD; border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #3B82F6;">
                    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1E1E1E;">
                        ${displayDate}${sessionNumber}
                    </h4>
                    
                    <!-- AI 조언 -->
                    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">🤖 AI 숨트레이너 조언</div>
                        <div style="font-size: 13px; color: #6B7280; line-height: 1.5;">
                            ${aiAdvice?.comprehensive_advice || '이 세션에 대한 AI 조언이 없습니다.'}
                        </div>
                    </div>
                    
                    <!-- 운동 상세 정보 -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">완료 세트</div>
                            <div style="font-size: 18px; font-weight: 600; color: #3B82F6;">${record.completed_sets || 0}세트</div>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">완료 호흡</div>
                            <div style="font-size: 18px; font-weight: 600; color: #22C55E;">${record.completed_breaths || 0}회</div>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">평균 저항</div>
                            <div style="font-size: 18px; font-weight: 600; color: #F59E0B;">${Math.round(((record.inhale_resistance || 0) + (record.exhale_resistance || 0)) / 2 * 10) / 10}단계</div>
                        </div>
                        <div style="background: white; padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">사용자 피드백</div>
                            <div style="font-size: 14px; font-weight: 600; color: #6366F1;">
                                ${record.user_feedback === 'easy' ? '😌 쉬움' : 
                                  record.user_feedback === 'perfect' ? '💪 완벽' : 
                                  record.user_feedback === 'hard' ? '😤 어려움' : 
                                  '미기록'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    // 📅 달력 네비게이션
    navigateCalendar(direction) {
        if (direction === 'prev') {
            if (this.currentCalendarMonth === 0) {
                this.currentCalendarMonth = 11;
                this.currentCalendarYear--;
            } else {
                this.currentCalendarMonth--;
            }
        } else if (direction === 'next') {
            if (this.currentCalendarMonth === 11) {
                this.currentCalendarMonth = 0;
                this.currentCalendarYear++;
            } else {
                this.currentCalendarMonth++;
            }
        }
        
        this.selectedDate = null; // 선택 초기화
        document.getElementById('selectedDateRecords').style.display = 'none';
        this.renderCalendar();
    }
}

// 🚀 통합 기록 대시보드 초기화 함수
async function initIntegratedRecordsDashboard() {
    console.log('📊 통합 기록 대시보드 초기화 시작...');
    
    // 1. 기존 기록탭 내용 완전 교체
    const recordsScreen = document.getElementById('recordsScreen');
    if (!recordsScreen) {
        console.error('❌ recordsScreen을 찾을 수 없습니다.');
        return;
    }

    // 기존 내용 완전 교체
    recordsScreen.innerHTML = INTEGRATED_RECORDS_HTML;

    // 2. 통합 대시보드 초기화
    const dashboard = new IntegratedRecordsDashboard();
    const initialized = await dashboard.init();
    
    if (!initialized) {
        console.warn('⚠️ 대시보드 초기화 실패');
        return;
    }

    // 3. 데이터 로드
    await dashboard.fetchExerciseData();
    await dashboard.fetchAIAdviceData();
    
    // 4. UI 업데이트
    dashboard.updateUI();

    // 5. 이벤트 리스너 설정
    const timeRangeSelect = document.getElementById('chartTimeRange');
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', (e) => {
            dashboard.timeRange = e.target.value;
            dashboard.updateUI();
        });
    }

    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => dashboard.navigateCalendar('prev'));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => dashboard.navigateCalendar('next'));
    }

    // 6. 전역 접근 가능하도록 설정
    window.integratedDashboard = dashboard;
    
    console.log('✅ 통합 기록 대시보드 초기화 완료');
}

// 🎨 추가 CSS
const INTEGRATED_CSS = `
<style>
.calendar-day:hover {
    background: #E3F2FD !important;
    transform: scale(1.05) !important;
}

.has-record:hover {
    background: #1D4ED8 !important;
}

.date-record-card {
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 480px) {
    .dashboard-stats-grid {
        gap: 12px !important;
        padding: 0 16px !important;
    }
    
    .breathing-chart-container,
    .calendar-section {
        margin: 0 16px 24px !important;
        padding: 16px !important;
    }
    
    #selectedDateRecords {
        margin: 0 16px 24px !important;
    }
}
</style>
`;

// CSS 추가
document.head.insertAdjacentHTML('beforeend', INTEGRATED_CSS);

// 🔧 전역 함수 등록 (기존 함수들 완전 교체)
window.initRecordsTab = initIntegratedRecordsDashboard;
window.onRecordsTabClick = initIntegratedRecordsDashboard;

console.log('📊 통합 기록 대시보드 모듈 로드 완료');
