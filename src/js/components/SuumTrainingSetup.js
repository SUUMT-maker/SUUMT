/**
 * SuumTrainingSetup 컴포넌트
 * 숨트레이닝 모드 선택 시 진입하는 운동 준비 화면
 */

class SuumTrainingSetup {
    constructor() {
        this.selectedInhale = 1;
        this.selectedExhale = 1;
        this.isVisible = false;
        this.onStartCallback = null;
    }

    /**
     * SuumTrainingSetup 초기화
     * @param {function} onStart - 시작 버튼 클릭 시 호출될 콜백 함수
     */
    init(onStart) {
        this.onStartCallback = onStart;
        this.render();
        this.initEventListeners();
        console.log('✅ SuumTrainingSetup 초기화 완료');
    }

    /**
     * 컴포넌트 표시
     */
    show() {
        this.isVisible = true;
        this.updateVisibility();
        console.log('🏃‍♂️ SuumTrainingSetup 표시');
    }

    /**
     * 컴포넌트 숨김
     */
    hide() {
        this.isVisible = false;
        this.updateVisibility();
        console.log('🏃‍♂️ SuumTrainingSetup 숨김');
    }

    /**
     * 가시성 업데이트
     */
    updateVisibility() {
        const container = document.getElementById('suumTrainingSetup');
        if (container) {
            container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    /**
     * 컴포넌트 렌더링
     */
    render() {
        // 기존 컨테이너가 있으면 제거
        const existingContainer = document.getElementById('suumTrainingSetup');
        if (existingContainer) {
            existingContainer.remove();
        }

        // 새로운 컨테이너 생성
        const container = document.createElement('div');
        container.id = 'suumTrainingSetup';
        container.className = 'suum-training-setup';
        container.style.display = 'none';

        container.innerHTML = `
            <div class="setup-overlay">
                <div class="setup-modal">
                    <div class="setup-content">
                        <!-- 제목 섹션 -->
                        <div class="setup-header">
                            <h2 class="setup-title">숨트레이닝을 시작해볼까요?</h2>
                            <p class="setup-subtitle">10회 x 2세트 · 약 3분 소요</p>
                        </div>

                        <!-- 저항값 선택 섹션 -->
                        <div class="resistance-selection">
                            <div class="resistance-item">
                                <label class="resistance-label">숨 들이마시기</label>
                                <div class="resistance-controls">
                                    <button class="resistance-btn" data-type="inhale" data-action="decrease">-</button>
                                    <span class="resistance-value" id="inhaleValue">1</span>
                                    <button class="resistance-btn" data-type="inhale" data-action="increase">+</button>
                                </div>
                                <div class="resistance-range">
                                    <span class="range-min">1</span>
                                    <div class="range-bar">
                                        <div class="range-fill" id="inhaleRangeFill"></div>
                                    </div>
                                    <span class="range-max">6</span>
                                </div>
                            </div>

                            <div class="resistance-item">
                                <label class="resistance-label">숨 내쉬기</label>
                                <div class="resistance-controls">
                                    <button class="resistance-btn" data-type="exhale" data-action="decrease">-</button>
                                    <span class="resistance-value" id="exhaleValue">1</span>
                                    <button class="resistance-btn" data-type="exhale" data-action="increase">+</button>
                                </div>
                                <div class="resistance-range">
                                    <span class="range-min">1</span>
                                    <div class="range-bar">
                                        <div class="range-fill" id="exhaleRangeFill"></div>
                                    </div>
                                    <span class="range-max">5</span>
                                </div>
                            </div>
                        </div>

                        <!-- 주의 문구 -->
                        <div class="setup-warning">
                            <p>운동 전 수분을 충분히 섭취하고, 건강에 이상이 있을 경우 전문가와 상담하세요.</p>
                        </div>

                        <!-- 버튼 섹션 -->
                        <div class="setup-actions">
                            <button class="setup-cancel-btn" id="setupCancelBtn">취소</button>
                            <button class="setup-start-btn" id="setupStartBtn" disabled>시작하기</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // body에 추가
        document.body.appendChild(container);
    }

    /**
     * 이벤트 리스너 초기화
     */
    initEventListeners() {
        // 저항값 조절 버튼
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('resistance-btn')) {
                const type = e.target.dataset.type;
                const action = e.target.dataset.action;
                this.adjustResistance(type, action);
            }
        });

        // 시작 버튼
        const startBtn = document.getElementById('setupStartBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.handleStart();
            });
        }

        // 취소 버튼
        const cancelBtn = document.getElementById('setupCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.handleCancel();
            });
        }

        // 오버레이 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('setup-overlay')) {
                this.handleCancel();
            }
        });
    }

    /**
     * 저항값 조절
     */
    adjustResistance(type, action) {
        if (type === 'inhale') {
            if (action === 'increase' && this.selectedInhale < 6) {
                this.selectedInhale++;
            } else if (action === 'decrease' && this.selectedInhale > 1) {
                this.selectedInhale--;
            }
            this.updateInhaleDisplay();
        } else if (type === 'exhale') {
            if (action === 'increase' && this.selectedExhale < 5) {
                this.selectedExhale++;
            } else if (action === 'decrease' && this.selectedExhale > 1) {
                this.selectedExhale--;
            }
            this.updateExhaleDisplay();
        }

        this.updateStartButton();
    }

    /**
     * 흡기 저항값 표시 업데이트
     */
    updateInhaleDisplay() {
        const valueEl = document.getElementById('inhaleValue');
        const rangeFillEl = document.getElementById('inhaleRangeFill');
        
        if (valueEl) {
            valueEl.textContent = this.selectedInhale;
        }
        
        if (rangeFillEl) {
            const percentage = ((this.selectedInhale - 1) / 5) * 100;
            rangeFillEl.style.width = `${percentage}%`;
        }
    }

    /**
     * 호기 저항값 표시 업데이트
     */
    updateExhaleDisplay() {
        const valueEl = document.getElementById('exhaleValue');
        const rangeFillEl = document.getElementById('exhaleRangeFill');
        
        if (valueEl) {
            valueEl.textContent = this.selectedExhale;
        }
        
        if (rangeFillEl) {
            const percentage = ((this.selectedExhale - 1) / 4) * 100;
            rangeFillEl.style.width = `${percentage}%`;
        }
    }

    /**
     * 시작 버튼 상태 업데이트
     */
    updateStartButton() {
        const startBtn = document.getElementById('setupStartBtn');
        if (startBtn) {
            const isValid = this.selectedInhale >= 1 && this.selectedExhale >= 1;
            startBtn.disabled = !isValid;
            
            if (isValid) {
                startBtn.classList.add('active');
            } else {
                startBtn.classList.remove('active');
            }
        }
    }

    /**
     * 시작 버튼 클릭 처리
     */
    handleStart() {
        if (this.onStartCallback) {
            const resistanceData = {
                inhale: this.selectedInhale,
                exhale: this.selectedExhale
            };
            
            console.log('🏃‍♂️ 숨트레이닝 시작:', resistanceData);
            this.onStartCallback(resistanceData);
        }
        
        this.hide();
    }

    /**
     * 취소 버튼 클릭 처리
     */
    handleCancel() {
        console.log('❌ 숨트레이닝 설정 취소');
        this.hide();
    }

    /**
     * 선택된 저항값 반환
     */
    getSelectedResistance() {
        return {
            inhale: this.selectedInhale,
            exhale: this.selectedExhale
        };
    }

    /**
     * 저항값 설정
     */
    setResistance(inhale, exhale) {
        this.selectedInhale = Math.max(1, Math.min(6, inhale));
        this.selectedExhale = Math.max(1, Math.min(5, exhale));
        
        this.updateInhaleDisplay();
        this.updateExhaleDisplay();
        this.updateStartButton();
    }
}

// 전역 인스턴스 생성
const suumTrainingSetup = new SuumTrainingSetup();

// 전역으로 노출
window.suumTrainingSetup = suumTrainingSetup;
