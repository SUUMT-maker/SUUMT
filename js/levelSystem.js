// 🎮 레벨 시스템 전용 모듈
class LevelSystem {
    constructor() {
        this.expData = this.loadExpData();
        this.levelConfig = this.getLevelConfig();
    }

    // 레벨 구간 설정
    getLevelConfig() {
        return [
            { level: 1, minExp: 0, maxExp: 166, title: '뉴비' },
            { level: 2, minExp: 167, maxExp: 333, title: '뉴비' },
            { level: 3, minExp: 334, maxExp: 500, title: '뉴비' },
            { level: 4, minExp: 501, maxExp: 750, title: '초급자' },
            { level: 5, minExp: 751, maxExp: 1000, title: '초급자' },
            { level: 6, minExp: 1001, maxExp: 1250, title: '초급자' },
            { level: 7, minExp: 1251, maxExp: 1500, title: '초급자' },
            { level: 8, minExp: 1501, maxExp: 2000, title: '중급자' },
            { level: 9, minExp: 2001, maxExp: 2500, title: '중급자' },
            { level: 10, minExp: 2501, maxExp: 3000, title: '중급자' },
            { level: 11, minExp: 3001, maxExp: 3250, title: '중급자' },
            { level: 12, minExp: 3251, maxExp: 3500, title: '중급자' },
            { level: 13, minExp: 3501, maxExp: 4500, title: '고급자' },
            { level: 14, minExp: 4501, maxExp: 5000, title: '고급자' },
            { level: 15, minExp: 5001, maxExp: 5500, title: '고급자' },
            { level: 16, minExp: 5501, maxExp: 6000, title: '고급자' },
            { level: 17, minExp: 6001, maxExp: 6500, title: '고급자' },
            { level: 18, minExp: 6501, maxExp: 7000, title: '고급자' },
            { level: 19, minExp: 7001, maxExp: 8000, title: '마스터' },
            { level: 20, minExp: 8001, maxExp: 9000, title: '마스터' },
            { level: 21, minExp: 9001, maxExp: 10000, title: '마스터' },
            { level: 22, minExp: 10001, maxExp: 10500, title: '마스터' },
            { level: 23, minExp: 10501, maxExp: 11000, title: '마스터' },
            { level: 24, minExp: 11001, maxExp: 11500, title: '마스터' },
            { level: 25, minExp: 11501, maxExp: 12000, title: '마스터' },
            { level: 26, minExp: 12001, maxExp: 999999, title: '레전드' }
        ];
    }

    // EXP 데이터 로드
    loadExpData() {
        try {
            const saved = localStorage.getItem('userLevelData');
            return saved ? JSON.parse(saved) : {
                totalExp: 0,
                currentLevel: 1,
                lastExpGain: [],
                consecutiveDays: 0,
                lastExerciseDate: null
            };
        } catch (error) {
            console.error('레벨 데이터 로드 실패:', error);
            return {
                totalExp: 0,
                currentLevel: 1,
                lastExpGain: [],
                consecutiveDays: 0,
                lastExerciseDate: null
            };
        }
    }

    // EXP 데이터 저장
    saveExpData() {
        try {
            localStorage.setItem('userLevelData', JSON.stringify(this.expData));
        } catch (error) {
            console.error('레벨 데이터 저장 실패:', error);
        }
    }

    // 운동 데이터 기반 EXP 계산
    calculateExpFromExerciseData(exerciseData) {
        if (!exerciseData || !exerciseData.length) return 0;

        // 일별 운동 완료 여부 체크 (2세트 40호흡 = 100 EXP)
        const dailyGoal = 40;
        const dailyCompletions = new Set();
        
        exerciseData.forEach(session => {
            const dateStr = new Date(session.created_at).toISOString().split('T')[0];
            const dayData = exerciseData.filter(s => 
                new Date(s.created_at).toISOString().split('T')[0] === dateStr
            );
            
            const dayBreaths = dayData.reduce((sum, s) => sum + (s.completed_breaths || 0), 0);
            if (dayBreaths >= dailyGoal) {
                dailyCompletions.add(dateStr);
            }
        });

        // 기본 EXP (일일 목표 달성)
        let totalExp = dailyCompletions.size * 100;

        // 연속 달성 보너스 계산 (간단히)
        const consecutiveDays = this.calculateConsecutiveDays(Array.from(dailyCompletions));
        if (consecutiveDays >= 30) totalExp += 1000;
        else if (consecutiveDays >= 7) totalExp += 200;
        else if (consecutiveDays >= 3) totalExp += 50;

        return totalExp;
    }

    // 연속 일수 계산
    calculateConsecutiveDays(completedDates) {
        if (!completedDates.length) return 0;
        
        const sortedDates = completedDates.sort((a, b) => new Date(b) - new Date(a));
        let consecutive = 0;
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toISOString().split('T')[0];
            
            if (sortedDates.includes(dateStr)) {
                consecutive++;
            } else {
                break;
            }
        }
        
        return consecutive;
    }

    // 레벨 계산
    calculateLevel(totalExp) {
        for (let i = this.levelConfig.length - 1; i >= 0; i--) {
            const config = this.levelConfig[i];
            if (totalExp >= config.minExp) {
                return {
                    level: config.level,
                    title: config.title,
                    currentExp: totalExp,
                    minExp: config.minExp,
                    maxExp: config.maxExp,
                    progress: Math.min(((totalExp - config.minExp) / (config.maxExp - config.minExp)) * 100, 100)
                };
            }
        }
        
        return {
            level: 1,
            title: '뉴비',
            currentExp: totalExp,
            minExp: 0,
            maxExp: 166,
            progress: (totalExp / 166) * 100
        };
    }

    // 운동 데이터로 레벨 업데이트
    updateFromExerciseData(exerciseData) {
        const newTotalExp = this.calculateExpFromExerciseData(exerciseData);
        const oldLevel = this.expData.currentLevel;
        
        this.expData.totalExp = newTotalExp;
        const levelData = this.calculateLevel(newTotalExp);
        this.expData.currentLevel = levelData.level;
        
        this.saveExpData();
        
        return {
            ...levelData,
            isLevelUp: levelData.level > oldLevel,
            oldLevel: oldLevel
        };
    }

    // 현재 레벨 데이터 반환
    getLevelData() {
        return this.calculateLevel(this.expData.totalExp);
    }

    // 주간 챌린지 완료 보너스 (나중에 사용)
    addChallengeBonus(challengeType) {
        const bonusMap = {
            'week1': 300,
            'week2': 300, 
            'week3': 300,
            'week4': 500
        };
        
        const bonus = bonusMap[challengeType] || 300;
        this.expData.totalExp += bonus;
        
        const levelData = this.calculateLevel(this.expData.totalExp);
        const isLevelUp = levelData.level > this.expData.currentLevel;
        this.expData.currentLevel = levelData.level;
        
        this.saveExpData();
        
        return {
            bonus: bonus,
            isLevelUp: isLevelUp,
            newLevel: levelData
        };
    }
}

// 전역 인스턴스 생성
window.levelSystem = new LevelSystem();

console.log('🎮 레벨 시스템 로드 완료');
