/**
 * 사용자 친화적 업데이트 관리 시스템
 */
class UpdateManager {
    constructor() {
        this.updateInProgress = false;
        this.overlay = null;
    }

    /**
     * 업데이트 UI 생성
     */
    createUpdateUI() {
        if (this.overlay) return this.overlay;

        const overlay = document.createElement('div');
        overlay.id = 'update-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const messageBox = document.createElement('div');
        messageBox.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        messageBox.innerHTML = `
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #333;">
                앱을 업데이트하고 있습니다
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 20px;">
                잠시만 기다려주세요...
            </div>
            <div style="width: 100%; height: 4px; background: #f0f0f0; border-radius: 2px; overflow: hidden;">
                <div id="progress-bar" style="width: 0%; height: 100%; background: #007AFF; border-radius: 2px; transition: width 0.3s ease;"></div>
            </div>
        `;

        overlay.appendChild(messageBox);
        this.overlay = overlay;
        return overlay;
    }

    /**
     * 업데이트 프로세스 실행
     */
    async performUpdate(newVersion, currentVersion) {
        if (this.updateInProgress) return;
        
        this.updateInProgress = true;
        console.log(`업데이트 시작: ${currentVersion} → ${newVersion}`);

        try {
            // 업데이트 UI 표시
            const overlay = this.createUpdateUI();
            document.body.appendChild(overlay);
            
            const progressBar = overlay.querySelector('#progress-bar');

            // 진행률 시뮬레이션
            await this.updateProgress(progressBar, 20, 800);
            await this.updateProgress(progressBar, 60, 800);  
            await this.updateProgress(progressBar, 90, 500);
            await this.updateProgress(progressBar, 100, 300);
            
            // 완료 후 새로고침
            console.log('업데이트 완료, 새로고침 실행');
            window.location.reload();
            
        } catch (error) {
            console.error('업데이트 실패:', error);
            await this.handleUpdateError(error);
        }
    }

    /**
     * 진행률 업데이트
     */
    updateProgress(progressBar, percentage, delay) {
        return new Promise(resolve => {
            progressBar.style.width = percentage + '%';
            setTimeout(resolve, delay);
        });
    }

    /**
     * 업데이트 에러 처리
     */
    async handleUpdateError(error) {
        if (this.overlay) {
            const messageBox = this.overlay.querySelector('div > div');
            messageBox.innerHTML = `
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #FF3B30;">
                    업데이트 중 문제가 발생했습니다
                </div>
                <div style="font-size: 14px; color: #666; margin-bottom: 20px;">
                    앱을 다시 시작합니다...
                </div>
            `;

            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // 에러 발생시에도 새로고침
        window.location.reload();
    }
}

// 전역 인스턴스 생성
window.updateManager = new UpdateManager();
