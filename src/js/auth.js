// 인증 관련 기능

// 카카오 로그인 함수
async function loginWithKakao() {
    try {
        console.log('🔐 카카오 로그인 시작...');
        
        const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'kakao',
            options: { 
                redirectTo: window.location.origin + '/index.html'
            }
        });
        
        if (error) {
            console.error('❌ 카카오 로그인 실패:', error);
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
            return;
        }
        
        console.log('✅ 카카오 로그인 성공:', data);
        
    } catch (error) {
        console.error('❌ 카카오 로그인 중 오류:', error);
        alert('로그인 중 오류가 발생했습니다.');
    }
}

// 로그아웃 함수
async function logout() {
    try {
        console.log('🚪 로그아웃 시작...');
        
        const { error } = await window.supabaseClient.auth.signOut();
        
        if (error) {
            console.error('❌ 로그아웃 실패:', error);
            alert('로그아웃에 실패했습니다.');
            return;
        }
        
        console.log('✅ 로그아웃 성공');
        window.currentUserId = null;
        
        // 로그인 화면으로 이동
        showLoginScreen();
        
    } catch (error) {
        console.error('❌ 로그아웃 중 오류:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
    }
}

// 로그인 화면 표시
function showLoginScreen() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
}

// 앱 화면 표시
function showAppScreen() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // 카카오 로그인 버튼
    const loginBtn = document.getElementById('loginKakaoBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', loginWithKakao);
    }
    
    // 로그아웃 버튼
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    console.log('✅ 인증 이벤트 리스너 등록 완료');
});
