// 유틸리티 함수들

// UTC → KST 시간대 변환 함수
function toKSTDateString(utcDateStr) {
    if (!utcDateStr) return new Date().toISOString().split('T')[0];
    
    const utcDate = new Date(utcDateStr);
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    return kstDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}

// 날짜 포맷팅 함수
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
}

// 시간 포맷팅 함수 (초 → 분:초)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

// 퍼센트 계산 함수
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

// 로컬 스토리지 유틸리티
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('❌ 로컬 스토리지 저장 실패:', error);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('❌ 로컬 스토리지 읽기 실패:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('❌ 로컬 스토리지 삭제 실패:', error);
        }
    }
};

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 쿠키 유틸리티
const cookies = {
    set: (name, value, days = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    get: (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    remove: (name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

// API 에러 처리 함수
function handleApiError(error, context = '') {
    console.error(`❌ ${context} API 오류:`, error);
    
    let message = '오류가 발생했습니다.';
    
    if (error.message) {
        message = error.message;
    } else if (error.error_description) {
        message = error.error_description;
    }
    
    // 사용자에게 알림 (필요시)
    // alert(message);
    
    return message;
}

// 로딩 상태 관리
const loading = {
    show: (elementId = 'loadingScreen') => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    hide: (elementId = 'loadingScreen') => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }
};

console.log('✅ 유틸리티 함수 로드 완료');
