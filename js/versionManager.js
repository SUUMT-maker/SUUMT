/**
 * 동적 버전 관리 시스템
 * sw.js의 VERSION 상수를 단일 소스로 사용
 */
class VersionManager {
    constructor() {
        this.currentVersion = null;
        this.initialized = false;
    }

    /**
     * Service Worker에서 현재 버전 가져오기
     */
    async getVersionFromSW() {
        if (!('serviceWorker' in navigator)) return null;
        
        try {
            const registration = await navigator.serviceWorker.ready;
            if (!registration.active) return null;

            return new Promise((resolve, reject) => {
                const messageChannel = new MessageChannel();
                
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.version);
                };
                
                setTimeout(() => reject(new Error('Timeout')), 2000);
                
                registration.active.postMessage(
                    { type: 'GET_VERSION' }, 
                    [messageChannel.port2]
                );
            });
        } catch (error) {
            console.warn('SW에서 버전 가져오기 실패:', error);
            return null;
        }
    }

    /**
     * 현재 앱 버전 반환
     */
    async getCurrentVersion() {
        if (this.currentVersion) return this.currentVersion;

        // 1. Service Worker에서 시도
        const swVersion = await this.getVersionFromSW();
        if (swVersion) {
            this.currentVersion = swVersion;
            return swVersion;
        }

        // 2. 폴백: meta 태그에서 읽기
        const metaVersion = document.querySelector('meta[name="version"]')?.content;
        if (metaVersion) {
            this.currentVersion = metaVersion;
            return metaVersion;
        }

        // 3. 최종 폴백
        this.currentVersion = '1.0.9';
        return this.currentVersion;
    }

    /**
     * HTML meta 태그 동적 업데이트
     */
    async updateMetaTag() {
        const version = await this.getCurrentVersion();
        let metaTag = document.querySelector('meta[name="version"]');
        
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = 'version';
            document.head.appendChild(metaTag);
        }
        
        metaTag.content = version;
        console.log(`Meta 태그 업데이트: ${version}`);
    }

    /**
     * 초기화
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            await this.updateMetaTag();
            this.initialized = true;
            console.log(`VersionManager 초기화 완료: ${this.currentVersion}`);
        } catch (error) {
            console.error('VersionManager 초기화 실패:', error);
        }
    }
}

// 전역 인스턴스 생성
window.versionManager = new VersionManager();
