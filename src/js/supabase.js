// Supabase 클라이언트 설정
const SUPABASE_URL = 'https://rfqbzibewzvqopqgovbc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmcWJ6aWJld3p2cW9wcWdvdmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzIwNTMsImV4cCI6MjA2OTk0ODA1M30.nAXbnAFe4jM7F56QN4b42NhwNJG_iuSXOVM5zC72Bs4';

// Supabase 클라이언트 초기화
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase 클라이언트 초기화 완료');

// 전역 변수로 현재 사용자 ID 저장
window.currentUserId = null;

// 사용자 인증 상태 확인
async function checkAuthStatus() {
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (session?.user) {
            window.currentUserId = session.user.id;
            console.log('✅ 로그인된 사용자:', session.user.id);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ 인증 상태 확인 실패:', error);
        return false;
    }
}

// 인증 상태 변경 감지
window.supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('🔄 인증 상태 변경:', event, session?.user?.id);
    
    if (event === 'SIGNED_IN' && session?.user) {
        window.currentUserId = session.user.id;
        console.log('✅ 사용자 로그인:', session.user.id);
    } else if (event === 'SIGNED_OUT') {
        window.currentUserId = null;
        console.log('❌ 사용자 로그아웃');
    }
});
