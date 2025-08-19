// 📊 CORS 문제 해결된 AI 동기부여 대시보드

// 기존 HTML 구조는 동일하게 유지
const INTEGRATED_RECORDS_HTML = `
<!-- 기록탭 대시보드 -->
<div class="integrated-records-screen">

    <!-- 🤖 AI 종합 평가 섹션 -->
    <div style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; margin: max(40px, env(safe-area-inset-top)) 20px 24px; padding: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #F1F5F9;">
            <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1;">
                <h3>AI 숨트레이너 종합 평가</h3>
            </div>
            <div id="aiEvaluationBadge" style="background: rgba(102, 126, 234, 0.1); border: 1px solid #667eea; color: #667eea; padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 600;">분석 중...</div>
        </div>
        
        <div id="aiEvaluationContent" style="background: #F8F9FA; padding: 20px; border-radius: 16px; border: 1px solid #E5E7EB; line-height: 1.6; font-size: 14px;">
            <div style="text-align: center; padding: 20px;">
                <img src="icons/coach-avatar.png" style="width: 32px; height: 32px; border-radius: 50%; margin-bottom: 16px;" alt="AI">
                <p style="margin: 0 0 20px 0; font-size: 14px; color: #6b7280; line-height: 1.5; text-align: center;">
                    당신의 호흡 운동 데이터를 분석해서<br>
                    개인화된 조언을 받아보세요
                </p>
                <button onclick="window.integratedDashboard.requestAIEvaluation()" style="background: rgba(102, 126, 234, 0.1); border: 1px solid #667eea; border-radius: 12px; padding: 12px 24px; color: #667eea; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                    AI 종합 평가 받기
                </button>
            </div>
        </div>
    </div>

    <!-- 핵심 2개 카드: 현재 상태 + 행동 유도 -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 0 20px; margin-bottom: 24px;">
        
        <!-- 카드 1: 현재 상태 -->
        <div style="background: white; border: 1px solid #E7E7E7; border-radius: 24px; padding: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease; text-align: center;">
            <div id="statusContent" style="font-size: 20px; font-weight: 700; color: #1f2937; line-height: 1.3; margin-bottom: 8px;">연속 2일째</div>
            <div id="statusState" style="font-size: 14px; font-weight: 600; color: #6b7280;">유지중</div>
        </div>

        <!-- 카드 2: 행동 유도 - 보상을 크게, 행동을 작게 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 1px solid #E7E7E7; border-radius: 24px; padding: 20px; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3); transition: all 0.3s ease; text-align: center;">
            <div id="actionContent" style="font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.9); line-height: 1.3; margin-bottom: 8px;">지금 운동하면</div>
            <div id="actionReward" style="font-size: 24px; font-weight: 700; color: white;">+1일 ↗️</div>
        </div>

    </div>



    <!-- 4주 순환 목표 시스템 -->
    <div id="weeklyGoalCard" style="background: white; border: 1px solid #E7E7E7; border-radius: 32px; padding: 32px 24px 28px 24px; margin: 0 20px 24px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); transition: all 0.3s ease;">
        
        <!-- 카드 헤더 -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #F1F5F9;">
            <div style="font-size: 20px; font-weight: 700; color: #1E1E1E; display: flex; align-items: center; gap: 8px;">
                <span id="goalIcon">🔥</span>
                <span id="goalTitle">꾸준히 챌린지</span>
            </div>
        </div>
        
        <!-- 원형 프로그레스 -->
        <div style="position: relative; display: inline-block; margin-bottom: 32px;">
            <svg id="goalProgress" width="240" height="240" style="transform: rotate(0deg); filter: drop-shadow(0 8px 24px rgba(102, 126, 234, 0.25)); transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);">
                <circle cx="120" cy="120" r="100" stroke="#f0f0f0" stroke-width="12" fill="transparent"/>
                <circle id="goalProgressStroke" cx="120" cy="120" r="100" stroke="#667eea" stroke-width="12" fill="transparent" 
                        stroke-linecap="round" stroke-dasharray="628" stroke-dashoffset="628" 
                        style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease;"/>
            </svg>
            
            <!-- 중앙 텍스트 -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <div id="goalPercentage" style="font-size: 48px; font-weight: 800; color: #1f2937; margin-bottom: 6px; line-height: 1; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);">0%</div>
                <div id="goalLabel" style="font-size: 16px; color: #6b7280; font-weight: 600; transition: all 0.3s ease;">4일 연속 달성</div>
            </div>
        </div>
        
        <!-- 목표 설명 (단순화로 숨김 처리) -->
        <div id="goalDescription" style="display: none; font-size: 16px; color: #374151; margin-bottom: 20px; line-height: 1.5;">
            <span id="goalCurrent">0일</span> / <span id="goalTarget">4일</span> 완료
        </div>
        
        <!-- AI 메시지 -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; color: #6b7280;">
            <img src="icons/coach-avatar.png" style="width: 24px; height: 24px; border-radius: 50%;" alt="AI">
            <span id="goalMessage">😊 새로운 도전의 시작! 화이팅! 💪</span>
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

// 📊 AI 동기부여 통합 대시보드 클래스 (CORS 문제 해결)
class IntegratedRecordsDashboard {
    constructor() {
        this.userId = null;
        this.supabaseClient = null;
        this.exerciseData = [];
        this.aiAdviceData = [];

        this.currentCalendarYear = new Date().getFullYear();
        this.currentCalendarMonth = new Date().getMonth();
        this.selectedDate = null;
        
        // ✨ AI 동기부여 관련 속성
        this.lastMotivationUpdate = null;
        this.motivationCache = null;
        this.motivationUpdateInterval = null;
        this.isMotivationLoading = false; // in-flight 가드
        this.motivationCooldownMs = 30 * 1000; // 30초 쿨다운
    }

    // 🧠 사용자 요청 시 AI 종합 평가 시작
    async requestAIEvaluation() {
        console.log('🧠 사용자 요청에 의한 AI 종합 평가 시작');
        
        const contentEl = document.getElementById('aiEvaluationContent');
        const badgeEl = document.getElementById('aiEvaluationBadge');
        
        if (contentEl) {
            contentEl.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: #6B7280;">
                    <div style="width: 24px; height: 24px; border: 3px solid #667eea; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span>AI가 당신의 호흡 데이터를 분석하고 있습니다...</span>
                </div>
            `;
        }
        
        if (badgeEl) {
            badgeEl.textContent = '분석 중...';
        }
        
        await this.loadMotivationMessage();
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ai_evaluation_requested', {
                user_id: this.userId,
                timestamp: new Date().toISOString()
            });
        }
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
        
        // ✨ AI 동기부여 시스템 초기화 (자동 분석 제거)
        await this.initMotivationSystem();
        
        return true;
    }

    // 🧠 AI 동기부여 시스템 초기화 (자동 분석 비활성화)
    async initMotivationSystem() {
        console.log('🧠 AI 동기부여 시스템 초기화 (수동 모드)...');
        
        // 자동 업데이트 제거 - 사용자가 원할 때만 분석
        // this.motivationUpdateInterval = setInterval(() => {
        //     this.loadMotivationMessage();
        // }, 10 * 60 * 1000);
    }

    // 🕐 UTC를 KST로 변환하는 유틸리티 함수
    utcToKst(utcDateString) {
        const utcDate = new Date(utcDateString);
        const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
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

    // 🤖 AI 조언 데이터 조회
    async fetchAIAdviceData() {
        try {
            // view_user_ai_advice가 없다면 기본 테이블에서 조회
            const { data, error } = await this.supabaseClient
                .from('ai_advice')
                .select(`
                    *,
                    exercise_sessions!inner(user_id)
                `)
                .eq('exercise_sessions.user_id', this.userId)
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
        
        const recentAvg = recent7.reduce((sum, s) => sum + (s.completed_breaths || 0), 0) / recent7.length;
        const previousAvg = previous7.reduce((sum, s) => sum + (s.completed_breaths || 0), 0) / previous7.length;
        
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

    // 🔥 loadMotivationMessage 함수도 단순화
    async loadMotivationMessage() {
        console.log('🤖 AI 동기부여 메시지 요청 중...');

        // in-flight 가드
        if (this.isMotivationLoading) {
            console.log('⏳ 이미 요청 처리 중입니다. 중복 호출 방지.');
            return;
        }

        this.isMotivationLoading = true;
        
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
            // 🎯 단순화된 AI 조언 요청 (analysisData 필요 없음)
            const motivationAdvice = await this.getMotivationAdviceFromAI(null);

            if (motivationAdvice) {
                this.showMotivationMessage({
                    title: '🤖 AI 숨트레이너 실시간 분석',
                    message: motivationAdvice.motivationMessage,
                    level: '실시간 분석 완료',
                    insight: motivationAdvice.insight,
                    source: motivationAdvice.source,
                    userStats: motivationAdvice.userStats
                });
                this.motivationCache = motivationAdvice;
                this.lastMotivationUpdate = new Date();
            } else {
                // 폴백 메시지 사용
                this.showMotivationMessage({
                    title: '🤗 꾸준함이 가장 큰 힘이에요',
                    message: '현재 분석을 불러올 수 없지만, 꾸준히 운동하며 데이터를 쌓아가는 모습이 정말 대단해요!',
                    insight: '매일 조금씩 발전하는 모습이 보여요. 자신감을 가지세요!',
                    source: 'fallback'
                });
            }
            
        } catch (error) {
            console.error('❌ AI 동기부여 메시지 로드 실패:', error);
            this.showMotivationError(`요청 실패: ${error.message}`);
        } finally {
            this.isMotivationLoading = false;
        }
    }

    // 🔥 기존 복잡한 함수를 완전히 교체
    async getMotivationAdviceFromAI(analysisData) {
        try {
            console.log('🤖 새로운 motivation-advice 엔드포인트 호출 시작');
            
            if (!window.currentUserId) {
                throw new Error('사용자 ID가 없습니다.');
            }

            // 🎯 단순한 요청 구조 (ai-advice 패턴)
            const requestBody = {
                userId: window.currentUserId,
                requestType: 'comprehensive_evaluation'
            };
            
            console.log('🌐 요청 데이터:', requestBody);
            
            // 새로운 엔드포인트로 요청
            const SUPABASE_URL = 'https://rfqbzibewzvqopqgovbc.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJ6aWJld3p2cW9wcWdvdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzIwNTMsImV4cCI6MjA2OTk0ODA1M30.nAXbnAFe4jM7F56QN4b42NhwNJG_iuSXOVM5zC72Bs4';
            
            const response = await fetch(`${SUPABASE_URL}/functions/v1/motivation-advice`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            // 상태 코드 체크
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📦 응답 데이터:', result);
            
            // 응답 구조 검증
            if (!result.success || !result.evaluation) {
                throw new Error(`응답 구조 오류: ${JSON.stringify(result)}`);
            }
            
            // 🎯 새로운 응답 구조에 맞춰 데이터 반환
            const motivationData = {
                motivationMessage: result.evaluation.motivationMessage,
                insight: result.evaluation.insight,
                progressTrend: result.evaluation.progressTrend,
                source: 'motivation_advice_endpoint',
                userStats: result.userStats,
                requestTime: new Date().toISOString()
            };
            
            console.log('✅ motivation-advice 요청 성공');
            return motivationData;
            
        } catch (error) {
            console.error('🚨 motivation-advice 요청 실패:', error);
            
            // 구체적인 에러 표시
            this.showMotivationError(`연결 오류: ${error.message}`);
            return null;
        }
    }

    // 🔧 트렌드에서 사용자 피드백 추론
    inferFeedbackFromTrend(trend) {
        switch(trend) {
            case 'excellent_progress': return 'perfect';
            case 'good_progress': return 'perfect';
            case 'stable': return 'perfect';
            case 'needs_encouragement': return 'hard';
            default: return 'perfect';
        }
    }

    // 🔧 운동 시간 포맷팅 (세션 수 기반 추정)
    formatExerciseTime(totalSessions) {
        const estimatedMinutes = Math.max(1, totalSessions * 5);
        const minutes = Math.floor(estimatedMinutes);
        const seconds = Math.floor((estimatedMinutes % 1) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // 🔧 AI 조언에서 인사이트 추출
    extractInsightFromAdvice(advice) {
        if (advice.comprehensiveAdvice && advice.comprehensiveAdvice.includes('도전')) {
            return '성장하고 계시네요! 다음 단계로 도전해보세요.';
        } else if (advice.comprehensiveAdvice && advice.comprehensiveAdvice.includes('꾸준')) {
            return '꾸준함이 가장 큰 힘입니다. 계속 화이팅하세요!';
        } else {
            return '매일 조금씩 발전하는 모습이 보여요. 자신감을 가지세요!';
        }
    }

    // 🔧 로컬 인사이트 생성
    generateLocalInsight(analysisData) {
        if (analysisData.level === 'expert') {
            return '전문가 수준에 도달했네요! 이제 다른 사람들에게도 영감을 주는 존재예요.';
        } else if (analysisData.consecutiveDays >= 7) {
            return '일주일 연속 트레이닝! 습관이 몸에 배기 시작했어요.';
        } else if (analysisData.completionRate >= 80) {
            return '높은 완주율을 보이고 계시네요. 의지력이 정말 대단해요!';
        } else {
            return '꾸준히 하는 것만으로도 충분히 훌륭해요. 자신을 격려해주세요!';
        }
    }

    // 🎯 개선된 폴백 동기부여 메시지 생성
    generateFallbackMotivation(analysisData) {
        const messages = {
            beginner: {
                type: 'encouragement',
                title: '💪 좋은 시작이에요!',
                message: `${analysisData.totalSessions}번의 트레이닝으로 호흡근이 조금씩 강해지고 있어요.\n꾸준함이 가장 큰 힘이니까 오늘도 화이팅!`,
                level: '초급자',
                insight: '첫 주는 기초를 다지는 시간이에요. 무리하지 말고 꾸준히 해보세요.'
            },
            intermediate: {
                type: 'progress',
                title: '🌟 실력이 늘고 있어요!',
                message: `완료율 ${analysisData.completionRate}%로 꾸준히 발전하고 계시네요.\n이제 저항 강도를 한 단계 올려볼까요?`,
                level: '중급자',
                insight: '성장 곡선이 가팔라지는 시기예요. 도전을 두려워하지 마세요!'
            },
            advanced: {
                type: 'challenge',
                title: '🔥 고수의 경지에요!',
                message: `${analysisData.totalBreaths}회의 호흡으로 이미 전문가 수준!\n더 높은 목표를 향해 도전해보세요.`,
                level: '고급자',
                insight: '이제 다른 사람들에게 영감을 주는 단계예요. 자신감을 가지세요!'
            },
            expert: {
                type: 'mastery',
                title: '👑 호흡 마스터!',
                message: `${analysisData.consecutiveDays}일 연속 트레이닝! 정말 대단해요.\n이제 다른 사람들에게도 영감을 주는 존재가 되었어요.`,
                level: '전문가',
                insight: '마스터의 경지에 도달했네요. 이제 새로운 도전을 찾아보세요!'
            }
        };
        
        // 트렌드에 따른 추가 메시지
        const trendMessages = {
            excellent_progress: '\n\n🚀 최근 성과가 정말 뛰어나요! 이 속도로 계속 가시면 곧 다음 레벨이에요.',
            good_progress: '\n\n📈 꾸준한 발전이 눈에 보여요. 좋은 페이스를 유지하고 있어요!',
            stable: '\n\n⚖️ 안정적인 페이스를 유지하고 계시네요. 때로는 휴식도 중요해요.',
            needs_encouragement: '\n\n💙 컨디션이 좋지 않으신가요? 무리하지 마시고 천천히 해보세요.'
        };
        
        const baseMessage = messages[analysisData.level] || messages.beginner;
        const trendMessage = trendMessages[analysisData.trend] || '';
        
        return {
            ...baseMessage,
            message: baseMessage.message + trendMessage
        };
    }

    // 🔥 showMotivationMessage 함수 수정 (운동 현황 제거)
    showMotivationMessage(motivationData) {
        const contentEl = document.getElementById('aiEvaluationContent');
        const badgeEl = document.getElementById('aiEvaluationBadge');
        const actionsEl = document.getElementById('aiMotivationActions');
        
        if (contentEl) {
            // 🔥 AI 분석 결과 공간 최대 활용 (5단계)
            contentEl.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="icons/coach-avatar.png" style="width: 32px; height: 32px; border-radius: 50%; margin-bottom: 12px;" alt="AI">
                </div>
                <div style="line-height: 1.6; font-size: 15px; color: #374151;">
                    ${(motivationData.message || '계속 화이팅하세요!')
                      .replace(/\n\n/g, '</p><p style="margin: 12px 0; line-height: 1.6;">')
                      .replace(/\n/g, '<br style="margin-bottom: 4px;">')}
                </div>
                ${motivationData.insight ? `
                <div style="background: #f8f9fa; padding: 16px; border-radius: 12px; margin-top: 20px; border-left: 4px solid #667eea;">
                    <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #667eea;">트레이너 인사이트</div>
                    <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">${motivationData.insight}</div>
                </div>
                ` : ''}
            `;
        }
        
        if (badgeEl) {
            badgeEl.textContent = '실시간 분석 완료';
        }
        
        if (actionsEl) {
            actionsEl.style.display = 'flex';
        }
    }

    // 🔥 동기부여 답변을 데이터베이스에 저장
    async saveMotivationToDatabase(motivationData, sessionId) {
        try {
            console.log('💾 동기부여 답변 데이터베이스 저장 시작');
            
            // 최근 3건과 중복/유사도 검사
            const { data: recent } = await this.supabaseClient
                .from('motivation_responses')
                .select('motivation_message')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false })
                .limit(3);

            const incoming = (motivationData.motivationMessage || '').trim();
            let isDuplicate = false;
            if (incoming && recent && recent.length) {
                for (const r of recent) {
                    const prev = (r.motivation_message || '').trim();
                    const sim = this.computeTextSimilarity(incoming, prev);
                    if (!prev) continue;
                    if (incoming === prev || sim >= 0.9) {
                        isDuplicate = true;
                        console.log(`⚠️ 최근 응답과 유사(유사도 ${sim.toFixed(2)}), 저장 스킵`);
                        break;
                    }
                }
            }
            if (isDuplicate) return null;

            const motivationRecord = {
                user_id: this.userId,
                session_id: sessionId,
                motivation_message: motivationData.motivationMessage,
                comprehensive_advice: motivationData.comprehensiveAdvice,
                intensity_advice: motivationData.intensityAdvice,
                insight: motivationData.insight,
                analysis_data: motivationData.analysisData,
                user_level: motivationData.analysisData.level,
                user_trend: motivationData.analysisData.trend,
                total_sessions: motivationData.analysisData.totalSessions,
                completion_rate: motivationData.analysisData.completionRate,
                consecutive_days: motivationData.analysisData.consecutiveDays,
                avg_resistance: motivationData.analysisData.avgResistance,
                ai_source: 'gemini',
                request_type: 'motivation',
                created_at: new Date().toISOString(),
                request_time: motivationData.requestTime
            };
            
            console.log('📝 저장할 동기부여 데이터:', motivationRecord);
            
            const { data, error } = await this.supabaseClient
                .from('motivation_responses')
                .insert(motivationRecord)
                .select();
            
            if (error) {
                throw error;
            }
            
            console.log('✅ 동기부여 응답 저장 성공:', data[0]);
            return data[0];
            
        } catch (error) {
            console.error('❌ 동기부여 응답 저장 실패:', error);
            throw error;
        }
    }

    // 👉 간단한 텍스트 유사도(Jaccard) 계산
    computeTextSimilarity(a, b) {
        if (!a || !b) return 0;
        if (a === b) return 1;
        const tokenize = (t) => new Set(
            t
              .toLowerCase()
              .replace(/[^가-힣a-z0-9\s]/g, ' ')
              .split(/\s+/)
              .filter(Boolean)
        );
        const A = tokenize(a);
        const B = tokenize(b);
        let inter = 0;
        for (const w of A) if (B.has(w)) inter++;
        const union = A.size + B.size - inter;
        return union === 0 ? 0 : inter / union;
    }

    // 함수 제거됨: updateMotivationQuality (DB 컬럼 삭제로 더 이상 사용하지 않음)

    // 🔥 과거 동기부여 응답 조회
    async getMotivationHistory(limit = 10) {
        try {
            console.log(`📚 과거 동기부여 응답 조회 (최근 ${limit}개)`);
            
            const { data, error } = await this.supabaseClient
                .from('motivation_responses')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) {
                throw error;
            }
            
            console.log(`✅ 과거 동기부여 응답 ${data.length}개 조회 완료`);
            return data;
            
        } catch (error) {
            console.error('❌ 동기부여 히스토리 조회 실패:', error);
            return [];
        }
    }

    // 🔥 동기부여 응답 패턴 분석
    async analyzeMotivationPatterns() {
        try {
            console.log('🔍 동기부여 응답 패턴 분석 시작');
            
            const history = await this.getMotivationHistory(30);
            
            if (history.length === 0) {
                return {
                    pattern: 'insufficient_data',
                    message: '분석할 데이터가 부족합니다.'
                };
            }
            
            const levels = history.map(h => h.user_level);
            const levelProgress = this.analyzeLevelProgression(levels);
            
            const trends = history.map(h => h.user_trend);
            const trendPattern = this.analyzeTrendPattern(trends);
            
            // 품질 평가 관련 분석 제거 (response_quality 컬럼 삭제)
            const avgQuality = null;
            
            const daysSinceFirst = history.length > 0 
                ? Math.ceil((new Date() - new Date(history[history.length - 1].created_at)) / (1000 * 60 * 60 * 24))
                : 0;
            const usageFrequency = daysSinceFirst > 0 ? history.length / daysSinceFirst : 0;
            
            return {
                pattern: 'analyzed',
                levelProgress,
                trendPattern,
                avgQuality,
                usageFrequency,
                totalResponses: history.length,
                daysSinceFirst,
                insights: this.generatePatternInsights(levelProgress, trendPattern, avgQuality, usageFrequency)
            };
            
        } catch (error) {
            console.error('❌ 동기부여 패턴 분석 실패:', error);
            return {
                pattern: 'error',
                message: '패턴 분석 중 오류가 발생했습니다.'
            };
        }
    }

    // 🔥 레벨 진행 분석
    analyzeLevelProgression(levels) {
        const levelOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
        const progressions = [];
        
        for (let i = 1; i < levels.length; i++) {
            const currentIndex = levelOrder.indexOf(levels[i-1]);
            const previousIndex = levelOrder.indexOf(levels[i]);
            
            if (currentIndex > previousIndex) {
                progressions.push('up');
            } else if (currentIndex < previousIndex) {
                progressions.push('down');
            } else {
                progressions.push('stable');
            }
        }
        
        const upCount = progressions.filter(p => p === 'up').length;
        const downCount = progressions.filter(p => p === 'down').length;
        const stableCount = progressions.filter(p => p === 'stable').length;
        
        return {
            trend: upCount > downCount ? 'improving' : downCount > upCount ? 'declining' : 'stable',
            upCount,
            downCount,
            stableCount,
            currentLevel: levels[0],
            startLevel: levels[levels.length - 1]
        };
    }

    // 🔥 트렌드 패턴 분석
    analyzeTrendPattern(trends) {
        const trendCounts = trends.reduce((acc, trend) => {
            acc[trend] = (acc[trend] || 0) + 1;
            return acc;
        }, {});
        
        const dominantTrend = Object.keys(trendCounts).reduce((a, b) => 
            trendCounts[a] > trendCounts[b] ? a : b
        );
        
        return {
            dominantTrend,
            trendCounts,
            consistency: Math.max(...Object.values(trendCounts)) / trends.length
        };
    }

    // 🔥 패턴 인사이트 생성
    generatePatternInsights(levelProgress, trendPattern, avgQuality, usageFrequency) {
        const insights = [];
        
        if (levelProgress.trend === 'improving') {
            insights.push('꾸준히 실력이 향상되고 있어요! 🚀');
        }
        
        if (trendPattern.dominantTrend === 'excellent_progress') {
            insights.push('대부분의 기간 동안 훌륭한 성과를 보이고 계세요! ⭐');
        }
        
        // 품질 평가 기반 인사이트 제거 (avgQuality는 항상 null)
        
        if (usageFrequency >= 0.5) {
            insights.push('정기적으로 동기부여를 받으시는 모습이 훌륭해요! 📅');
        }
        
        if (insights.length === 0) {
            insights.push('데이터를 더 쌓으면 더 정확한 분석을 받을 수 있어요! 📊');
        }
        
        return insights;
    }

    // 함수 제거됨: rateMotivation (DB 컬럼 삭제로 더 이상 사용하지 않음)

    // 🔥 에러 표시 함수 개선
    showMotivationError(errorMessage) {
        const contentEl = document.getElementById('aiEvaluationContent');
        const badgeEl = document.getElementById('aiEvaluationBadge');
        const actionsEl = document.getElementById('aiMotivationActions');
        
        if (contentEl) {
            contentEl.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #ef4444;">
                    <div style="margin-bottom: 8px; font-size: 24px;">⚠️</div>
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">연결 문제가 발생했습니다</div>
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">${errorMessage}</div>
                    <button onclick="window.integratedDashboard.refreshMotivation()" style="background: rgba(102, 126, 234, 0.1); border: 1px solid #667eea; border-radius: 8px; padding: 8px 16px; font-size: 12px; color: #667eea; cursor: pointer;">
                        다시 시도
                    </button>
                </div>
            `;
        }
        
        if (badgeEl) badgeEl.textContent = '연결 오류';
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





    // 🎨 UI 업데이트 (2개 카드 시스템)
    updateUI() {
        // 기존 calculateStats() 관련 코드 제거
        // document.getElementById('dashboardTotalBreaths').textContent = stats.totalBreaths; // 삭제
        // document.getElementById('dashboardAvgBreaths').textContent = stats.avgBreaths; // 삭제
        // document.getElementById('dashboardCompletionRate').textContent = stats.completionRate; // 삭제
        // document.getElementById('dashboardAvgResistance').textContent = stats.avgResistance; // 삭제

        // 새로운 2개 카드 업데이트 추가
        this.updateTwoCards();
        
        // 주간 목표 업데이트
        this.updateWeeklyGoal();
        
        // 달력 렌더링
        this.renderCalendar();
        
        // ✨ AI 동기부여는 사용자 요청 시에만 실행
        // this.loadMotivationMessage(); // 제거됨
    }



    // 🎯 4주 순환 목표 시스템 함수들
    
    // 현재 주차 계산 (일요일 기준)
    getCurrentWeek() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // 이번 주 일요일
        
        const weeksSinceEpoch = Math.floor(startOfWeek.getTime() / (7 * 24 * 60 * 60 * 1000));
        return (weeksSinceEpoch % 4) + 1; // 1-4 순환
    }

    // 4주 목표 설정 (제목 최종 확정)
    getWeeklyGoal(week) {
        const goals = {
            1: {
                title: '시작해볼까 챌린지',
                label: '3일 연속 달성',
                target: 3,
                type: 'consecutive'
            },
            2: {
                title: '파워업 챌린지',
                label: '주간 200호흡',
                target: 200,
                type: 'total_breaths'
            },
            3: {
                title: '꾸준함의 힘 챌린지',
                label: '5일 연속 달성',
                target: 5,
                type: 'consecutive'
            },
            4: {
                title: '완벽 마스터 챌린지',
                label: '7일 연속 + 300호흡',
                target: { consecutive: 7, breaths: 300 },
                type: 'hybrid'
            }
        };
        return goals[week];
    }

    // 주간 목표 진행률 계산 (수정)
    calculateWeekProgress(goal) {
        const thisWeekData = this.getThisWeekData();
        
        switch(goal.type) {
            case 'consecutive':
                return this.calculateConsecutiveDays(thisWeekData, goal.target);
            case 'total_breaths':
                return this.calculateTotalBreaths(thisWeekData, goal.target);
            case 'hybrid':
                return this.calculateHybridProgress(thisWeekData, goal.target);
        }
    }

    // 이번 주 데이터 가져오기
    getThisWeekData() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // 일요일
        startOfWeek.setHours(0, 0, 0, 0);
        
        return this.exerciseData.filter(session => {
            const sessionDate = new Date(session.created_at);
            return sessionDate >= startOfWeek;
        });
    }

    // 🎯 2개 카드 시스템 함수들
    
    // 주차별 카드 내용 설정 (새로운 챌린지 시스템 적용)
    getWeeklyTwoCards(week, weekData, goalProgress) {
        const todayCompleted = this.isTodayCompleted(weekData);
        
        switch(week) {
            case 1: // 3일 연속 챌린지
                const currentDays1 = goalProgress.current;
                return {
                    status: {
                        content: `연속 ${currentDays1}일째`,
                        state: '진행중'
                    },
                    action: {
                        content: '지금 운동하면',
                        reward: todayCompleted ? '달성완료 ↗️' : `+1일 ↗️`
                    }
                };
                
            case 2: // 200호흡 챌린지
                const currentBreaths = goalProgress.current;
                const remaining = Math.max(0, 200 - currentBreaths);
                return {
                    status: {
                        content: `총 ${currentBreaths}회`,
                        state: '호흡중'
                    },
                    action: {
                        content: '지금 운동하면',
                        reward: remaining === 0 ? '달성완료 ↗️' : `+40회 ↗️`
                    }
                };
                
            case 3: // 5일 연속 챌린지
                const currentDays3 = goalProgress.current;
                return {
                    status: {
                        content: `연속 ${currentDays3}일째`,
                        state: '도전중'
                    },
                    action: {
                        content: '지금 운동하면',
                        reward: todayCompleted ? '달성완료 ↗️' : `+1일 ↗️`
                    }
                };
                
            case 4: // 완벽 챌린지 (7일 연속 + 300호흡)
                const consecutiveResult = goalProgress.details?.consecutive || { current: 0 };
                const breathsResult = goalProgress.details?.breaths || { current: 0 };
                
                const consecutiveNeeded = Math.max(0, 7 - consecutiveResult.current);
                const breathsNeeded = Math.max(0, 300 - breathsResult.current);
                
                let statusContent, reward;
                if (consecutiveNeeded > 0) {
                    statusContent = `연속 ${consecutiveResult.current}일째`;
                    reward = `+1일 ↗️`;
                } else {
                    statusContent = `총 ${breathsResult.current}회`;
                    reward = `+40회 ↗️`;
                }
                
                return {
                    status: {
                        content: statusContent,
                        state: '완벽도전'
                    },
                    action: {
                        content: '지금 운동하면',
                        reward: todayCompleted ? '완벽달성 ↗️' : reward
                    }
                };
                
            default:
                return {
                    status: { content: '준비 중', state: '' },
                    action: { content: '지금 운동하면', reward: '시작 ↗️' }
                };
        }
    }

    // 2개 카드 UI 업데이트 (수정된 요소명 사용)
    updateTwoCards() {
        const currentWeek = this.getCurrentWeek();
        const weekData = this.getThisWeekData();
        const goal = this.getWeeklyGoal(currentWeek);
        const goalProgress = this.calculateWeekProgress(goal);
        
        console.log(`[카드 업데이트] Week ${currentWeek}, Progress:`, goalProgress);
        
        const cardData = this.getWeeklyTwoCards(currentWeek, weekData, goalProgress);
        
        // 카드 1: 현재 상태
        document.getElementById('statusContent').textContent = cardData.status.content;
        document.getElementById('statusState').textContent = cardData.status.state;
        
        // 카드 2: 행동 유도
        document.getElementById('actionContent').textContent = cardData.action.content;
        document.getElementById('actionReward').textContent = cardData.action.reward;
        
        console.log('[카드 데이터]', cardData);
    }

    // 오늘 운동 완료 여부 확인
    isTodayCompleted(weekData) {
        const today = this.getKstDateString(new Date().toISOString());
        const todayData = weekData.filter(session => 
            this.getKstDateString(session.created_at) === today
        );
        
        const todayBreaths = todayData.reduce((sum, session) => 
            sum + (session.completed_breaths || 0), 0);
        
        return todayBreaths >= 40; // 일일 목표 달성 여부
    }

    // 연속 일수 계산
    getCurrentConsecutiveDays() {
        const dailyGoal = 40;
        let consecutive = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = this.getKstDateString(checkDate.toISOString());
            
            const dayData = this.exerciseData.filter(session => 
                this.getKstDateString(session.created_at) === dateStr
            );
            
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

    // 연속일 계산
    calculateConsecutiveDays(weekData, target) {
        // 구현: 연속 달성 일수 계산
        const dailyGoal = 40; // 2세트 40호흡
        const daysWithGoal = new Set();
        
        weekData.forEach(session => {
            if (session.completed_breaths >= dailyGoal) {
                const date = new Date(session.created_at).toDateString();
                daysWithGoal.add(date);
            }
        });
        
        // 연속일 계산 로직
        let consecutive = 0;
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = checkDate.toDateString();
            
            if (daysWithGoal.has(dateStr)) {
                consecutive++;
            } else {
                break;
            }
        }
        
        return {
            current: Math.min(consecutive, target),
            target: target,
            percentage: Math.min((consecutive / target) * 100, 100)
        };
    }

    // 총 호흡수 계산
    calculateTotalBreaths(weekData, target) {
        const totalBreaths = weekData.reduce((sum, session) => 
            sum + (session.completed_breaths || 0), 0);
        
        return {
            current: totalBreaths,
            target: target,
            percentage: Math.min((totalBreaths / target) * 100, 100)
        };
    }

    // 완주율 계산
    calculateCompletionRate(weekData, target) {
        if (weekData.length === 0) {
            return { current: 0, target: target, percentage: 0 };
        }
        
        const completedSessions = weekData.filter(session => !session.is_aborted).length;
        const completionRate = (completedSessions / weekData.length) * 100;
        
        return {
            current: Math.round(completionRate),
            target: target,
            percentage: Math.min((completionRate / target) * 100, 100)
        };
    }

    // 하이브리드 진행률 계산 (4주차용 - 수정)
    calculateHybridProgress(weekData, target) {
        const consecutiveResult = this.calculateConsecutiveDays(weekData, target.consecutive);
        const breathsResult = this.calculateTotalBreaths(weekData, target.breaths);
        
        // 두 조건의 최소값으로 진행률 계산
        const minProgress = Math.min(consecutiveResult.percentage, breathsResult.percentage);
        
        return {
            current: minProgress,
            target: 100,
            percentage: minProgress,
            details: {
                consecutive: consecutiveResult,
                breaths: breathsResult
            }
        };
    }

    // 목표 메시지 생성 (챌린지별 고정 메시지)
    generateGoalMessage(progress, goal, isPersonalBest) {
        const currentWeek = this.getCurrentWeek();
        
        const challengeMessages = {
            1: "3일 연속? 쉽다고 생각하세요? 막상 해보면 의외로 어려워요!",
            2: "호흡 200회 모으기 대작전! 과연 일주일 안에 성공할 수 있을까요?",
            3: "이제 장난 아니에요! 5일 연속, 진짜 끈기를 보여주세요",
            4: "최종 보스 등장! 7일 연속 + 300회, 완벽하게 클리어 가능한가요?"
        };
        
        return challengeMessages[currentWeek] || "새로운 도전을 시작해보세요!";
    }

    // 주간 목표 UI 업데이트 (단순화)
    updateWeeklyGoal() {
        const currentWeek = this.getCurrentWeek();
        const goal = this.getWeeklyGoal(currentWeek);
        const progress = this.calculateWeekProgress(goal);
        
        // 🔍 데이터 일관성 디버깅 로그
        console.log('🎯 updateWeeklyGoal - 데이터 일관성 체크:', {
            week: currentWeek,
            goalType: goal.type,
            progress: progress,
            percentage: Math.round(progress.percentage)
        });
        
        // UI 요소 업데이트
        document.getElementById('goalTitle').textContent = goal.title;
        // document.getElementById('weekIndicator').textContent = `(Week ${currentWeek}/4)`; // Week 표시 제거
        document.getElementById('goalLabel').textContent = goal.label;
        
        // 프로그레스 업데이트
        const percentage = Math.round(progress.percentage);
        document.getElementById('goalPercentage').textContent = `${percentage}%`;
        
        // 원형 프로그레스 업데이트
        const progressStroke = document.getElementById('goalProgressStroke');
        const circumference = 628;
        const offset = circumference - (percentage / 100) * circumference;
        progressStroke.style.strokeDashoffset = offset;
        
        // 목표 설명 단순화 - 복잡한 분수 제거
        document.getElementById('goalDescription').style.display = 'none'; // 숨김
        
        // 메시지 업데이트
        const message = this.generateGoalMessage(progress, goal, false); // 개인 최고 기록 로직은 나중에 추가
        document.getElementById('goalMessage').textContent = message;
    }

    // 📅 달력 렌더링
    renderCalendar() {
        const titleEl = document.getElementById('calendarTitle');
        if (titleEl) {
            const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                               '7월', '8월', '9월', '10월', '11월', '12월'];
            titleEl.textContent = `${this.currentCalendarYear}년 ${monthNames[this.currentCalendarMonth]}`;
        }
        
        const exerciseDates = new Set();
        this.exerciseData.forEach(record => {
            const kstDateStr = this.getKstDateString(record.created_at);
            exerciseDates.add(kstDateStr);
        });
        
        const calendarBody = document.getElementById('calendarBody');
        if (!calendarBody) return;
        
        const firstDay = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
        const lastDay = new Date(this.currentCalendarYear, this.currentCalendarMonth + 1, 0);
        const today = new Date();
        
        let html = '';
        let currentWeek = '';
        
        for (let i = 0; i < firstDay.getDay(); i++) {
            currentWeek += '<td class="empty" style="padding: 8px; color: #d1d5db;"></td>';
        }
        
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
                styles.push('background: #3B82F6', 'color: white', 'font-weight: 600');
            }
            if (isSelected) {
                classes.push('selected');
                styles.push('background: #1D4ED8', 'color: white', 'transform: scale(1.05)');
            }
            
            currentWeek += `<td class="${classes.join(' ')}" style="${styles.join('; ')}" data-date="${dateStr}" onclick="window.integratedDashboard.onDateClick('${dateStr}')">${day}</td>`;
            
            if ((firstDay.getDay() + day - 1) % 7 === 6) {
                html += `<tr>${currentWeek}</tr>`;
                currentWeek = '';
            }
        }
        
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
        
        const prevSelected = document.querySelector('.calendar-day.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
            prevSelected.style.background = prevSelected.classList.contains('has-record') ? '#3B82F6' : 
                                           prevSelected.classList.contains('today') ? '#ddd6fe' : '';
            prevSelected.style.transform = '';
        }
        
        const newSelected = document.querySelector(`[data-date="${dateStr}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
            newSelected.style.background = '#1D4ED8';
            newSelected.style.color = 'white';
            newSelected.style.transform = 'scale(1.05)';
        }
        
        this.selectedDate = dateStr;
        await this.renderSelectedDateRecords(dateStr);
    }

    // 📋 선택된 날짜의 운동 기록 렌더링
    async renderSelectedDateRecords(dateStr) {
        const container = document.getElementById('selectedDateRecords');
        if (!container) return;
        
        const dateRecords = this.exerciseData.filter(record => {
            const kstDateStr = this.getKstDateString(record.created_at);
            return kstDateStr === dateStr;
        }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        if (dateRecords.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
        let html = '';
        
        for (let i = 0; i < dateRecords.length; i++) {
            const record = dateRecords[i];
            const aiAdvice = this.aiAdviceData.find(advice => advice.session_id === record.id);
            
            const [year, month, day] = dateStr.split('-');
            const displayDate = `${year}년 ${month}월 ${day}일`;
            const sessionNumber = dateRecords.length > 1 ? ` (${i + 1}번째 트레이닝)` : '';
            
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
        
        this.selectedDate = null;
        document.getElementById('selectedDateRecords').style.display = 'none';
        this.renderCalendar();
    }

    // 🧹 정리
    destroy() {
        if (this.motivationUpdateInterval) {
            clearInterval(this.motivationUpdateInterval);
        }
    }
}

// 🚀 통합 기록 대시보드 초기화 함수
async function initIntegratedRecordsDashboard() {
    console.log('📊 CORS 해결된 AI 동기부여 대시보드 초기화 시작...');
    
    const recordsScreen = document.getElementById('recordsScreen');
    if (!recordsScreen) {
        console.error('❌ recordsScreen을 찾을 수 없습니다.');
        return;
    }

    recordsScreen.innerHTML = INTEGRATED_RECORDS_HTML;

    const dashboard = new IntegratedRecordsDashboard();
    const initialized = await dashboard.init();
    
    if (!initialized) {
        console.warn('⚠️ 대시보드 초기화 실패');
        return;
    }

    await dashboard.fetchExerciseData();
    await dashboard.fetchAIAdviceData();
    dashboard.updateUI();



    const prevBtn = document.getElementById('prevMonthBtn');
    const nextBtn = document.getElementById('nextMonthBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => dashboard.navigateCalendar('prev'));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => dashboard.navigateCalendar('next'));
    }

    window.integratedDashboard = dashboard;
    
    console.log('✅ CORS 해결된 AI 동기부여 대시보드 초기화 완료');
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'motivation_dashboard_initialized_cors_fixed', {
            user_id: dashboard.userId,
            timestamp: new Date().toISOString()
        });
    }
}

// 🎨 추가 CSS (동일)
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

document.head.insertAdjacentHTML('beforeend', INTEGRATED_CSS);

// 🔧 전역 함수 등록
window.initRecordsTab = initIntegratedRecordsDashboard;
window.onRecordsTabClick = initIntegratedRecordsDashboard;

console.log('🔧 CORS 문제 해결된 AI 동기부여 대시보드 모듈 로드 완료');
