/**
 * SuumCountdownOverlay 컴포넌트
 * 숨트레이닝 시작 전 사용자의 준비 시간을 확보하는 카운트다운 오버레이
 */

class SuumCountdownOverlay {
    constructor() {
        this.isVisible = false;
        this.isCounting = false;
        this.onCompleteCallback = null;
        this.onCancelCallback = null;
        this.countdownInterval = null;
        this.currentCount = 3;
    }

    /**
     * SuumCountdownOverlay 초기화
     * @param {function} onComplete - 카운트다운 완료 시 호출될 콜백 함수
     * @param {function} onCancel - 취소 버튼 클릭 시 호출될 콜백 함수
     */
    init(onComplete, onCancel) {
        this.onCompleteCallback = onComplete;
        this.onCancelCallback = onCancel;
        this.render();
        this.initEventListeners();
        console.log('✅ SuumCountdownOverlay 초기화 완료');
    }

    /**
     * 컴포넌트 표시
     */
    show() {
        this.isVisible = true;
        this.updateVisibility();
        this.startCountdown();
        console.log('⏱️ SuumCountdownOverlay 표시');
    }

    /**
     * 컴포넌트 숨김
     */
    hide() {
        this.isVisible = false;
        this.isCounting = false;
        this.stopCountdown();
        this.updateVisibility();
        console.log('⏱️ SuumCountdownOverlay 숨김');
    }

    /**
     * 가시성 업데이트
     */
    updateVisibility() {
        const container = document.getElementById('suumCountdownOverlay');
        if (container) {
            container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    /**
     * 컴포넌트 렌더링
     */
    render() {
        // 기존 컨테이너가 있으면 제거
        const existingContainer = document.getElementById('suumCountdownOverlay');
        if (existingContainer) {
            existingContainer.remove();
        }

        // 새로운 컨테이너 생성
        const container = document.createElement('div');
        container.id = 'suumCountdownOverlay';
        container.className = 'suum-countdown-overlay';
        container.style.display = 'none';

        container.innerHTML = `
            <div class="countdown-overlay">
                <div class="countdown-content">
                    <!-- 카운트다운 숫자 -->
                    <div class="countdown-number" id="countdownNumber">3</div>
                    
                    <!-- 보조 텍스트 -->
                    <div class="countdown-text" id="countdownText">곧 훈련을 시작합니다</div>
                    
                    <!-- 취소 버튼 -->
                    <button class="countdown-cancel-btn" id="countdownCancelBtn">취소</button>
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
        // 취소 버튼
        const cancelBtn = document.getElementById('countdownCancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.handleCancel();
            });
        }

        // ESC 키로 취소
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.handleCancel();
            }
        });
    }

    /**
     * 카운트다운 시작
     */
    startCountdown() {
        this.isCounting = true;
        this.currentCount = 3;
        this.updateDisplay();
        
        this.countdownInterval = setInterval(() => {
            this.currentCount--;
            
            if (this.currentCount > 0) {
                this.updateDisplay();
            } else if (this.currentCount === 0) {
                this.showStartMessage();
            } else {
                this.completeCountdown();
            }
        }, 1000);
    }

    /**
     * 카운트다운 중지
     */
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    /**
     * 화면 업데이트
     */
    updateDisplay() {
        const numberEl = document.getElementById('countdownNumber');
        const textEl = document.getElementById('countdownText');
        
        if (numberEl) {
            numberEl.textContent = this.currentCount;
            numberEl.className = 'countdown-number fade-in';
            
            // 애니메이션 클래스 제거
            setTimeout(() => {
                if (numberEl) {
                    numberEl.classList.remove('fade-in');
                }
            }, 100);
        }
        
        if (textEl) {
            textEl.textContent = '곧 훈련을 시작합니다';
        }
    }

    /**
     * 시작 메시지 표시
     */
    showStartMessage() {
        const numberEl = document.getElementById('countdownNumber');
        const textEl = document.getElementById('countdownText');
        
        if (numberEl) {
            numberEl.textContent = '시작!';
            numberEl.className = 'countdown-number start-message fade-in';
        }
        
        if (textEl) {
            textEl.textContent = '훈련을 시작합니다';
        }
    }

    /**
     * 카운트다운 완료
     */
    completeCountdown() {
        this.stopCountdown();
        this.isCounting = false;
        
        // 1초 후 완료 콜백 실행
        setTimeout(() => {
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
            this.hide();
        }, 1000);
    }

    /**
     * 취소 처리
     */
    handleCancel() {
        console.log('❌ 카운트다운 취소');
        
        this.stopCountdown();
        this.isCounting = false;
        
        if (this.onCancelCallback) {
            this.onCancelCallback();
        }
        
        this.hide();
    }

    /**
     * 카운트다운 상태 확인
     */
    isCountdownActive() {
        return this.isCounting;
    }

    /**
     * 현재 카운트 반환
     */
    getCurrentCount() {
        return this.currentCount;
    }
}

// 전역 인스턴스 생성
const suumCountdownOverlay = new SuumCountdownOverlay();

// 전역으로 노출
window.suumCountdownOverlay = suumCountdownOverlay;

// 개발용 테스트 함수
window.testCountdown = () => {
    console.log('🧪 카운트다운 테스트 시작');
    suumCountdownOverlay.init(
        () => {
            console.log('✅ 테스트 카운트다운 완료!');
            alert('카운트다운 완료!');
        },
        () => {
            console.log('❌ 테스트 카운트다운 취소');
            alert('카운트다운 취소됨');
        }
    );
    suumCountdownOverlay.show();
};
