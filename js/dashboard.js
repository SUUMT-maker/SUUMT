// 📊 기록탭 완전 통합 대시보드 (사용자 디자인 기반) + AI 동기부여 기능

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

    <!-- ✨ AI 트레이너 종합 평가 (핵심 가치) -->
    <div class="ai-coach-evaluation" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; margin: 0 20px 24px; padding: 24px; color: white; position: relative; overflow: hidden; box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);">
        <!-- 배경 장식 -->
        <div style="position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); animation: shimmer 6s ease-in-out infinite;"></div>
        
        <div style="position: relative; z-index: 1;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="font-size: 28px;">🧠</div>
                <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 600;">AI 트레이너 종합 평가</h3>
                    <p style="margin: 0; font-size: 13px; opacity: 0.9;">당신의 호흡 여정을 분석한 개인화된 조언</p>
                </div>
                <div style="margin-left: auto;">
                    <div id="aiEvaluationBadge" style="background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; backdrop-filter: blur(10px);">
                        분석 중...
                    </div>
                </div>
            </div>
            
            <div id="aiEvaluationContent" style="background: rgba(255,255,255,0.95); color: #374151; padding: 20px; border-radius: 16px; line-height: 1.6; font-size: 15px; backdrop-filter: blur(10px);">
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #6B7280;">
                    <div style="width: 24px; height: 24px; border: 3px solid #667eea; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span>AI가 당신의 호흡 데이터를 분석하고 있습니다...</span>
                </div>
            </div>
            
            <!-- AI 동기부여 액션 버튼들 -->
            <div id="aiMotivationActions" style="display: none; margin-top: 16px; display: flex; gap: 12px;">
                <button onclick="window.integratedDashboard.startQuickWorkout()" style="flex: 1; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 12px; padding: 10px 16px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; backdrop-filter: blur(10px); transition: all 0.3s ease;">
                    💪 지금 운동하기
                </button>
                <button onclick="window.integratedDashboard.refreshMotivation()" style="flex: 1; background: rgba(255, 255, 255, 0.2); border: none; border-radius: 12px; padding: 10px 16px; color: white; font-size: 14px; font-weight: 600; cursor: pointer; backdrop-filter: blur(10px); transition: all 0.3s ease;">
                    🔄 새로운 조언
                </button>
            </div>
        </div>
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

// 📊 AI 동기부여 통합 대시보드 클래스 (기존 클래스 확장)
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
        
        // ✨ AI 동기부여 관련 속성 추가
        this.lastMotivationUpdate = null;
        this.motivationCache = null;
        this.motivationUpdateInterval = null;
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
        
        // ✨ AI 동기부여 시스템 초기화
        await this.initMotivationSystem();
        
        return true;
    }

    // 🧠 AI 동기부여 시스템 초기화
    async initMotivationSystem() {
        console.log('🧠 AI 동기부여 시스템 초기화...');
        
        // 정기 업데이트 설정 (5분마다)
        this.motivationUpdateInterval = setInterval(() => {
            this.loadMotivationMessage();
        }, 5 * 60 * 1000);
    }

    // 🕐 UTC를 KST로 변환하는 유틸리티 함수
    utcToKst(utcDateString) {
        const utcDate = new Date(utcDateString);
        const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // UTC + 9시간
        return kstDate;
    }

    // 🗓️ KST 기준 날짜 문자열 생성
    getKstDateString(utcDateString) {
        const kstDate = this.utcToKst(utcDateString);
        const year = kstDate.getFullYear();
        const month = String(kstDate.getMonth() + 1).padStart(2, '0');
        const day = String(kstDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

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

    // 🔍 누적 운동 데이터 분석
    analyzeExerciseProgress() {
        if (!this.exerciseData.length) {
            return {
                isEmpty: true,
                message: "아직 운동 데이터가 없어요. 첫 번째 트레이닝을 시작해보세요!"
            };
        }

        const totalSessions = this.exerciseData.length;
        const completedSessions = this.exerciseData.filter(session => !session.is_aborted).length;
        const totalBreaths = this.exerciseData.reduce((sum, session) => sum + (session.completed_breaths || 0), 0);
        const totalSets = this.exerciseData.reduce((sum, session) => sum + (session.completed_sets || 0), 0);
        
        // 최근 7일 데이터
        const recentData = this.getFilteredData();
        const recentSessions = recentData.length;
        
        // 완료율 계산
        const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
        
        // 평균 저항 강도
        const avgResistance = this.exerciseData.length > 0 ? 
            this.exerciseData.reduce((sum, session) => 
                sum + ((session.inhale_resistance || 0) + (session.exhale_resistance || 0)) / 2, 0
            ) / this.exerciseData.length : 0;
        
        // 연속 운동 일수 계산
        const consecutiveDays = this.calculateConsecutiveDays();
        
        // 최근 트렌드 분석
        const trend = this.analyzeTrend();
        
        // 개인화 레벨 판정
        const level = this.determineUserLevel(totalSessions, completionRate, avgResistance);

        return {
            isEmpty: false,
            totalSessions,
            completedSessions,
            totalBreaths,
            totalSets,
            recentSessions,
            completionRate,
            avgResistance: Math.round(avgResistance * 10) / 10,
            consecutiveDays,
            trend,
            level,
            lastExercise: this.exerciseData[0]?.created_at ? this.getKstDateString(this.exerciseData[0].created_at) : null
        };
    }

    // 📈 트렌드 분석
    analyzeTrend() {
        const recent7 = this.exerciseData.slice(0, 7);
        const previous7 = this.exerciseData.slice(7, 14);
        
        if (recent7.length === 0) return 'insufficient_data';
        if (previous7.length === 0) return 'new_user';
        
        const recentAvg = recent7.reduce((sum, s) => sum + s.completed_breaths, 0) / recent7.length;
        const previousAvg = previous7.reduce((sum, s) => sum + s.completed_breaths, 0) / previous7.length;
        
        const improvement = ((recentAvg - previousAvg) / previousAvg) * 100;
        
        if (improvement > 20) return 'excellent_progress';
        if (improvement > 5) return 'good_progress';
        if (improvement > -5) return 'stable';
        return 'needs_encouragement';
    }

    // 🏆 사용자 레벨 판정
    determineUserLevel(totalSessions, completionRate, avgResistance) {
        if (totalSessions < 5) return 'beginner';
        if (totalSessions < 20 || completionRate < 70) return 'intermediate';
        if (totalSessions < 50 || avgResistance < 3) return 'advanced';
        return 'expert';
    }

    // 📅 연속 운동 일수 계산
    calculateConsecutiveDays() {
        if (!this.exerciseData.length) return 0;
        
        const dates = [...new Set(this.exerciseData.map(session => 
            this.getKstDateString(session.created_at)
        ))].sort((a, b) => new Date(b) - new Date(a));
        
        let consecutive = 0;
        let today = new Date();
        
        for (let i = 0; i < dates.length; i++) {
            const dateToCheck = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = dateToCheck.toISOString().split('T')[0];
            
            if (dates.includes(dateStr)) {
                consecutive++;
            } else {
                break;
            }
        }
        
        return consecutive;
    }

    // 🤖 AI 동기부여 메시지 로드
    async loadMotivationMessage() {
        console.log('🤖 AI 동기부여 메시지 요청 중...');
        
        const contentEl = document.getElementById('aiEvaluationContent');
        const badgeEl = document.getElementById('aiEvaluationBadge');
        const actionsEl = document.getElementById('aiMotivationActions');
        
        if (!contentEl) return;
        
        // 로딩 상태 표시
        contentEl.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #6B7280;">
                <div style="width: 24px; height: 24px; border: 3px solid #667eea; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <span>AI가 당신의 호흡 데이터를 분석하고 있습니다...</span>
            </div>
        `;
        
        if (badgeEl) badgeEl.textContent = '분석 중...';
        if (actionsEl) actionsEl.style.display = 'none';
        
        try {
            // 운동 데이터 분석
            const analysisData = this.analyzeExerciseProgress();
            
            if (analysisData.isEmpty) {
                this.showMotivationMessage({
                    type: 'welcome',
                    title: '🌟 첫 발걸음을 내디뎌 보세요!',
                    message: '호흡근 강화 여정의 시작입니다.\n매일 조금씩 꾸준히 하는 것이 가장 큰 변화를 만들어요.',
                    level: '신규 사용자'
                });
                return;
            }
            
            // Supabase Edge Function으로 AI 조언 요청
            const motivationData = await this.requestAIMotivation(analysisData);
            
            if (motivationData) {
                this.showMotivationMessage(motivationData);
                this.motivationCache = motivationData;
                this.lastMotivationUpdate = new Date();
            } else {
                throw new Error('AI 응답 없음');
            }
            
        } catch (error) {
            console.error('❌ AI 동기부여 메시지 로드 실패:', error);
            this.showMotivationError();
        }
    }

    // 🌐 Supabase Edge Function AI 동기부여 요청
    async requestAIMotivation(analysisData) {
        try {
            const SUPABASE_URL = 'https://rfqbzibewzvqopqgovbc.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJ6aWJld3p2cW9wcWdvdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzIwNTMsImV4cCI6MjA2OTk0ODA1M30.nAXbnAFe4jM7F56QN4b42NhwNJG_iuSXOVM5zC72Bs4';
            
            const requestBody = {
                type: 'motivation',
                userData: {
                    userId: this.userId,
                    analysisData: analysisData,
                    exerciseHistory: this.exerciseData.slice(0, 30), // 최근 30개 세션
                    timestamp: new Date().toISOString()
                }
            };
            
            console.log('🌐 AI 동기부여 요청:', requestBody);
            
            const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-advice`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`AI 요청 실패: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📦 AI 동기부여 응답:', result);
            
            if (result.success && result.motivation) {
                return result.motivation;
            }
            
            throw new Error(result.message || 'AI 응답 형식 오류');
            
        } catch (error) {
            console.error('🚨 AI 동기부여 요청 오류:', error);
            
            // 폴백 동기부여 메시지
            return this.generateFallbackMotivation(analysisData);
        }
    }

    // 🎯 폴백 동기부여 메시지 생성
    generateFallbackMotivation(analysisData) {
        const messages = {
            beginner: {
                type: 'encouragement',
                title: '💪 좋은 시작이에요!',
                message: `${analysisData.totalSessions}번의 트레이닝으로 호흡근이 조금씩 강해지고 있어요.\n꾸준함이 가장 큰 힘이니까 오늘도 화이팅!`,
                level: '초급자'
            },
            intermediate: {
                type: 'progress',
                title: '🌟 실력이 늘고 있어요!',
                message: `완료율 ${analysisData.completionRate}%로 꾸준히 발전하고 계시네요.\n이제 저항 강도를 한 단계 올려볼까요?`,
                level: '중급자'
            },
            advanced: {
                type: 'challenge',
                title: '🔥 고수의 경지에요!',
                message: `${analysisData.totalBreaths}회의 호흡으로 이미 전문가 수준!\n더 높은 목표를 향해 도전해보세요.`,
                level: '고급자'
            },
            expert: {
                type: 'mastery',
                title: '👑 호흡 마스터!',
                message: `${analysisData.consecutiveDays}일 연속 트레이닝! 정말 대단해요.\n이제 다른 사람들에게도 영감을 주는 존재가 되었어요.`,
                level: '전문가'
            }
        };
        
        return messages[analysisData.level] || messages.beginner;
    }

    // 💬 동기부여 메시지 UI 표시
    showMotivationMessage(motivationData) {
        const contentEl = document.getElementById('aiEvaluationContent');
        const badgeEl = document.getElementById('aiEvaluationBadge');
        const actionsEl = document.getElementById('aiMotivationActions');
        
        if (contentEl) {
            contentEl.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                        ${motivationData.title || '🤖 AI 숨트레이너'}
                    </h4>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                        ${(motivationData.message || '계속 화이팅하세요!').replace(/\n/g, '<br>')}
                    </p>
                </div>
                ${motivationData.insight ? `
                <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <div style="font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #6b7280;">💡 인사이트</div>
                    <div style="font-size: 13px; color: #4b5563;">${motivationData.insight}</div>
                </div>
                ` : ''}
            `;
        }
        
        if (badgeEl) {
            badgeEl.textContent = motivationData.level || '분석 완료';
        }
        
        if (actionsEl) {
            actionsEl.style.display = 'flex';
        }
    }

    // ❌ 에러 상태 표시
    showMotivationError() {
        const contentEl = document.getElementById('aiEvaluationContent');
        const badgeEl = document.getElementById('aiEvaluationBadge');
        const actionsEl = document.getElementById('aiMotivationActions');
        
        if (contentEl) {
            contentEl.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #6b7280;">
                    <div style="margin-bottom: 8px; font-size: 24px;">🤗</div>
                    <div style="font-size: 14px;">지금은 분석이 어려우니 꾸준히 운동하며 데이터를 쌓아가요!</div>
                </div>
            `;
        }
        
        if (badgeEl) badgeEl.textContent = '분석 대기';
        if (actionsEl) actionsEl.style.display = 'none';
    }

    // 🔄 동기부여 메시지 새로고침
    async refreshMotivation() {
        console.log('🔄 동기부여 메시지 새로고침');
        this.motivationCache = null;
        await this.loadMotivationMessage();
        
        // GA 이벤트
        if (typeof gtag !== 'undefined') {
            gtag('event', 'motivation_refresh', {
                user_id: this.userId,
                timestamp: new Date().toISOString()
            });
        }
    }

    // 💪 빠른 운동 시작
    startQuickWorkout() {
        console.log('💪 빠른 운동 시작');
        
        // 운동모드 화면으로 이동
        if (typeof window.switchTab === 'function') {
            window.switchTab('workout');
        }
        
        // GA 이벤트
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quick_workout_start', {
                source: 'motivation_dashboard',
                user_id: this.userId
            });
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

    // 📈 차트 데이터 준비 (KST 기준)
    prepareChartData() {
        const filtered = this.getFilteredData();
        
        // 일별로 그룹화 (KST 기준)
        const dailyData = {};
        filtered.forEach(item => {
            const kstDateStr = this.getKstDateString(item.created_at);
            if (!dailyData[kstDateStr]) {
                dailyData[kstDateStr] = { breaths: 0, count: 0 };
            }
            dailyData[kstDateStr].breaths += item.completed_breaths || 0;
            dailyData[kstDateStr].count += 1;
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
        
        // ✨ AI 동기부여 메시지 로드
        this.loadMotivationMessage();
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
        
        // 운동한 날짜들 추출 (KST 기준으로 변환)
        const exerciseDates = new Set();
        this.exerciseData.forEach(record => {
            const kstDateStr = this.getKstDateString(record.created_at);
            exerciseDates.add(kstDateStr);
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
        
        // 해당 날짜의 운동 기록들 필터링 (KST 기준)
        const dateRecords = this.exerciseData.filter(record => {
            const kstDateStr = this.getKstDateString(record.created_at);
            return kstDateStr === dateStr;
        }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // 시간 순 정렬 (오래된 것부터)
        
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
            
            // KST 기준 시간 표시
            const kstDate = this.utcToKst(record.created_at);
            const timeStr = kstDate.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
            
            html += `
                <div class="date-record-card" style="background: #E3F2FD; border-radius: 12px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #3B82F6;">
                    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1E1E1E;">
                        ${displayDate}${sessionNumber} 
                        <span style="font-size: 12px; color: #6B7280; font-weight: 400;">${timeStr} 운동</span>
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

    // 🧹 정리 (컴포넌트 언마운트 시)
    destroy() {
        if (this.motivationUpdateInterval) {
            clearInterval(this.motivationUpdateInterval);
        }
    }
}

// 🚀 통합 기록 대시보드 초기화 함수
async function initIntegratedRecordsDashboard() {
    console.log('📊 AI 동기부여 통합 대시보드 초기화 시작...');
    
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
    
    console.log('✅ AI 동기부여 통합 대시보드 초기화 완료');
    
    // 7. GA 이벤트
    if (typeof gtag !== 'undefined') {
        gtag('event', 'motivation_dashboard_initialized', {
            user_id: dashboard.userId,
            timestamp: new Date().toISOString()
        });
    }
}

// 🎨 추가 CSS
const INTEGRATED_CSS = `
<style>
@keyframes shimmer {
    0%, 100% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.1); }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

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

.motivation-action-btn:hover {
    background: rgba(255, 255, 255, 0.3) !important;
    transform: translateY(-2px);
}

@media (max-width: 480px) {
    .dashboard-stats-grid {
        gap: 12px !important;
        padding: 0 16px !important;
    }
    
    .breathing-chart-container,
    .calendar-section,
    .ai-coach-evaluation {
        margin: 0 16px 24px !important;
        padding: 16px !important;
    }
    
    #selectedDateRecords {
        margin: 0 16px 24px !important;
    }
    
    .ai-coach-evaluation {
        padding: 20px !important;
    }
    
    #aiMotivationActions {
        flex-direction: column !important;
    }
}
</style>
`;

// CSS 추가
document.head.insertAdjacentHTML('beforeend', INTEGRATED_CSS);

// 🔧 전역 함수 등록 (기존 함수들 완전 교체)
window.initRecordsTab = initIntegratedRecordsDashboard;
window.onRecordsTabClick = initIntegratedRecordsDashboard;

console.log('🧠 AI 동기부여 통합 대시보드 모듈 로드 완료');
