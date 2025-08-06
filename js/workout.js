/**
 * 💪 SUUMT 운동 모듈
 * 운동모드 선택 및 숨트레이닝 화면 렌더링
 */

// 💪 운동모드 선택 화면 렌더링
export function renderWorkoutModeScreen(container) {
    container.innerHTML = `
        <div class="workout-mode-header">
            <h2>💪 운동모드 선택</h2>
            <p>오늘은 어떤 호흡 운동을 하시겠어요?</p>
        </div>
        
        <div class="workout-modes-container">
            <!-- 웜업 모드 (비활성화) -->
            <div class="workout-mode-card disabled">
                <div class="mode-illustration">
                    <div class="mode-avatar">
                        <div class="avatar-bg warmup"></div>
                        <div class="avatar-icon">🌅</div>
                    </div>
                </div>
                <div class="mode-content">
                    <h3>웜업</h3>
                    <p>가벼운 호흡으로 몸을 깨우고 하루를 준비하세요.</p>
                    <div class="mode-pattern">2 - 2 - 2 호흡</div>
                </div>
                <div class="mode-status">곧 출시</div>
            </div>
            
            <!-- 숨트레이닝 모드 (활성화) -->
            <div class="workout-mode-card active" data-mode="breathtraining">
                <div class="mode-illustration">
                    <div class="mode-avatar">
                        <div class="avatar-bg breathtraining"></div>
                        <div class="avatar-icon">🫁</div>
                    </div>
                </div>
                <div class="mode-content">
                    <h3>숨트레이닝</h3>
                    <p>호흡근육을 강화하고 폐활량을 늘려보세요.</p>
                    <div class="mode-pattern">4 - 4 - 4 호흡</div>
                </div>
                <div class="mode-status">선택 가능</div>
            </div>
            
            <!-- 잠들기전 모드 (비활성화) -->
            <div class="workout-mode-card disabled">
                <div class="mode-illustration">
                    <div class="mode-avatar">
                        <div class="avatar-bg sleep"></div>
                        <div class="avatar-icon">🌙</div>
                    </div>
                </div>
                <div class="mode-content">
                    <h3>잠들기전</h3>
                    <p>긴장을 풀고 편안한 수면을 위한 호흡법입니다.</p>
                    <div class="mode-pattern">4 - 7 - 8 호흡</div>
                </div>
                <div class="mode-status">곧 출시</div>
            </div>
        </div>
    `;

    // 운동모드 카드 이벤트 리스너 설정
    const workoutModeCards = container.querySelectorAll('.workout-mode-card');
    workoutModeCards.forEach(card => {
        if (!card.classList.contains('disabled')) {
            card.addEventListener('click', (e) => {
                const mode = e.currentTarget.getAttribute('data-mode');
                if (mode) {
                    // app.js의 selectWorkoutMode 함수 호출
                    if (typeof window.selectWorkoutMode === 'function') {
                        window.selectWorkoutMode(mode);
                    }
                }
            });
        }
    });
}

// 🫁 숨트레이닝 모드 화면 렌더링
export function renderBreathTrainingScreen(container) {
    container.innerHTML = `
        <div class="section-header">
            <h2 class="section-title"><span class="section-icon">🫁</span> 숨트레이닝 모드</h2>
            <p class="section-subtitle">호흡 가이드, 저항 설정, 트레이닝 시작</p>
        </div>
        
        <!-- 가이드 카드 -->
        <div class="guide-card">
            <div class="guide-header">
                <div class="guide-title">📋 숨트 트레이닝 가이드</div>
            </div>
            
            <div class="important-notice">
                <span class="important-icon">💡</span>
                <span class="important-text">호흡할 때는 의식적으로 힘을 주어 깊게 호흡하세요!</span>
            </div>
            
            <div class="guide-step">숨트 기구의 다이얼을 돌려 저항 강도를 설정해주세요</div>
            <div class="guide-step">설정한 저항 강도를 아래 화면에 똑같이 입력하세요</div>
            <div class="guide-step">복식호흡으로 코가 아닌 입으로만 호흡하세요</div>
        </div>

        <!-- 저항 설정 -->
        <div class="resistance-card">
            <div class="resistance-header">
                <div class="resistance-title">🎯 저항 강도 설정</div>
            </div>
            
            <div class="resistance-controls">
                <div class="resistance-control">
                    <div class="resistance-label">들숨 (Inhale)</div>
                    <div class="resistance-selector">
                        <button class="resistance-btn" data-action="adjustResistance" data-type="inhale" data-direction="-1">−</button>
                        <div class="resistance-value" id="inhaleLevel">1</div>
                        <button class="resistance-btn" data-action="adjustResistance" data-type="inhale" data-direction="1">+</button>
                    </div>
                    <div class="resistance-dots" id="inhaleScale">
                        <div class="dot active"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>

                <div class="resistance-control">
                    <div class="resistance-label">날숨 (Exhale)</div>
                    <div class="resistance-selector">
                        <button class="resistance-btn" data-action="adjustResistance" data-type="exhale" data-direction="-1">−</button>
                        <div class="resistance-value" id="exhaleLevel">1</div>
                        <button class="resistance-btn" data-action="adjustResistance" data-type="exhale" data-direction="1">+</button>
                    </div>
                    <div class="resistance-dots" id="exhaleScale">
                        <div class="dot active"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            </div>

            <div class="resistance-tip">
                💡 처음이시면 1단계 추천 • 적당히 힘든 강도가 최적이에요!
            </div>
        </div>

        <!-- 트레이닝 시작 -->
        <div class="start-training-section">
            <button class="start-button" data-action="startExercise">
                <span>🚀</span>
                <span>트레이닝 시작</span>
            </button>
        </div>
    `;

    // 저항 조절 버튼 이벤트 리스너 설정
    const resistanceBtns = container.querySelectorAll('[data-action="adjustResistance"]');
    resistanceBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.getAttribute('data-type');
            const direction = parseInt(e.currentTarget.getAttribute('data-direction'));
            
            if (typeof window.adjustResistance === 'function') {
                window.adjustResistance(type, direction);
            }
        });
    });

    // 트레이닝 시작 버튼 이벤트 리스너 설정
    const startButton = container.querySelector('[data-action="startExercise"]');
    if (startButton) {
        startButton.addEventListener('click', (e) => {
            if (typeof window.startExercise === 'function') {
                window.startExercise();
            }
        });
    }
}

// 🎯 저항 강도 조절 함수 (기존 함수와 호환)
export function adjustResistance(type, direction) {
    const levelElement = document.getElementById(`${type}Level`);
    const scaleElement = document.getElementById(`${type}Scale`);
    
    if (!levelElement || !scaleElement) return;
    
    let currentLevel = parseInt(levelElement.textContent);
    const maxLevel = type === 'inhale' ? 6 : 5;
    
    // 레벨 조절
    currentLevel = Math.max(1, Math.min(maxLevel, currentLevel + direction));
    levelElement.textContent = currentLevel;
    
    // 점 표시 업데이트
    const dots = scaleElement.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index < currentLevel) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// 🚀 모듈 초기화
export function initializeWorkoutModule() {
    console.log('💪 운동 모듈 초기화 완료');
    
    // 전역 함수로 노출 (기존 코드와의 호환성)
    window.adjustResistance = adjustResistance;
} 