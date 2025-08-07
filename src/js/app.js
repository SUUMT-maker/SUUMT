// 메인 앱 로직

// 현재 활성 탭
let currentTab = 'home';

// 탭 전환 함수
function switchTab(tabName) {
    console.log(`🔄 탭 전환: ${currentTab} → ${tabName}`);
    
    // 이전 탭 비활성화
    const prevTabBtn = document.querySelector(`[data-tab="${currentTab}"]`);
    const prevTabContent = document.getElementById(`${currentTab}Tab`);
    
    if (prevTabBtn) prevTabBtn.classList.remove('active');
    if (prevTabContent) prevTabContent.classList.remove('active');
    
    // 새 탭 활성화
    const newTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const newTabContent = document.getElementById(`${tabName}Tab`);
    
    if (newTabBtn) newTabBtn.classList.add('active');
    if (newTabContent) newTabContent.classList.add('active');
    
    currentTab = tabName;
    
    // 탭별 초기화 함수 호출
    switch (tabName) {
        case 'home':
            initHomeTab();
            break;
        case 'records':
            onRecordsTabActivate();
            break;
        case 'settings':
            // 설정 탭 초기화 (필요시)
            break;
    }
}

// 탭 버튼 이벤트 리스너 등록
function initTabButtons() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            if (tabName && tabName !== currentTab) {
                switchTab(tabName);
            }
        });
    });
    
    console.log('✅ 탭 버튼 이벤트 리스너 등록 완료');
}

// 앱 초기화
async function initApp() {
    console.log('🚀 SUUMT v2 앱 초기화 시작...');
    
    try {
        // 로딩 화면 표시
        loading.show();
        
        // 인증 상태 확인
        const isAuthenticated = await checkAuthStatus();
        
        if (isAuthenticated) {
            console.log('✅ 인증된 사용자 - 앱 화면 표시');
            showAppScreen();
            
            // 탭 버튼 초기화
            initTabButtons();
            
            // 홈 탭 초기화
            await initHomeTab();
            
        } else {
            console.log('❌ 인증되지 않은 사용자 - 로그인 화면 표시');
            showLoginScreen();
        }
        
    } catch (error) {
        console.error('❌ 앱 초기화 중 오류:', error);
        showLoginScreen();
    } finally {
        // 로딩 화면 숨김
        loading.hide();
    }
    
    console.log('✅ SUUMT v2 앱 초기화 완료');
}

// 페이지 로드 시 앱 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 SUUMT v2 페이지 로드');
    
    // 약간의 지연 후 앱 초기화 (로딩 화면 표시를 위해)
    setTimeout(() => {
        initApp();
    }, 1000);
});

// 전역 함수로 노출
window.switchTab = switchTab;
window.initApp = initApp;
