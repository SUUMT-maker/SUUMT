-- 🗄️ 숨트레이너 데이터베이스 스키마
-- Supabase PostgreSQL 데이터베이스용

-- 1. 사용자 테이블 (카카오톡 로그인)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kakao_id VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    profile_image_url TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. 운동 기록 테이블
CREATE TABLE IF NOT EXISTS exercise_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_date DATE NOT NULL,
    exercise_time INTEGER NOT NULL, -- 초 단위
    completed_sets INTEGER NOT NULL,
    completed_breaths INTEGER NOT NULL,
    is_aborted BOOLEAN DEFAULT FALSE,
    user_feedback TEXT,
    resistance_settings JSONB, -- {inhale: 1, exhale: 1}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AI 조언 히스토리 테이블
CREATE TABLE IF NOT EXISTS ai_advice_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_record_id UUID REFERENCES exercise_records(id) ON DELETE CASCADE,
    advice_type VARCHAR(50) NOT NULL, -- 'trainer_advice', 'local_advice'
    advice_content TEXT NOT NULL,
    feedback_analysis JSONB, -- 분석 결과
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 배지 획득 기록 테이블
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id VARCHAR(50) NOT NULL, -- 'first_step', 'daily_warrior' 등
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(10) NOT NULL,
    badge_description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 5. 퀴즈 풀이 기록 테이블
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_date DATE NOT NULL,
    selected_questions JSONB NOT NULL, -- [0, 2] 형태
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    quiz_time INTEGER, -- 퀴즈 풀이 시간 (초)
    is_perfect BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 사용자 통계 테이블
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_exercises INTEGER DEFAULT 0,
    total_sets INTEGER DEFAULT 0,
    total_breaths INTEGER DEFAULT 0,
    consecutive_days INTEGER DEFAULT 0,
    last_exercise_date DATE,
    average_sets DECIMAL(3,1) DEFAULT 0,
    total_quiz_attempts INTEGER DEFAULT 0,
    perfect_quiz_count INTEGER DEFAULT 0,
    total_badges_earned INTEGER DEFAULT 0,
    max_intensity_inhale INTEGER DEFAULT 1,
    max_intensity_exhale INTEGER DEFAULT 1,
    skipped_rest_count INTEGER DEFAULT 0,
    early_morning_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔍 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_exercise_records_user_date ON exercise_records(user_id, exercise_date);
CREATE INDEX IF NOT EXISTS idx_exercise_records_created_at ON exercise_records(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_advice_user_record ON ai_advice_history(user_id, exercise_record_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_date ON quiz_attempts(user_id, quiz_date);
CREATE INDEX IF NOT EXISTS idx_users_kakao_id ON users(kakao_id);

-- 🔒 RLS (Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_advice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 RLS 정책
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 운동 기록 RLS 정책
CREATE POLICY "Users can view own exercise records" ON exercise_records
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own exercise records" ON exercise_records
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own exercise records" ON exercise_records
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- AI 조언 히스토리 RLS 정책
CREATE POLICY "Users can view own AI advice" ON ai_advice_history
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own AI advice" ON ai_advice_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 배지 RLS 정책
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 퀴즈 기록 RLS 정책
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 사용자 통계 RLS 정책
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 🔄 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 📊 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_user_stats_after_exercise()
RETURNS TRIGGER AS $$
BEGIN
    -- 사용자 통계 업데이트
    INSERT INTO user_stats (user_id, total_exercises, total_sets, total_breaths, last_exercise_date)
    VALUES (NEW.user_id, 1, NEW.completed_sets, NEW.completed_breaths, NEW.exercise_date)
    ON CONFLICT (user_id) DO UPDATE SET
        total_exercises = user_stats.total_exercises + 1,
        total_sets = user_stats.total_sets + NEW.completed_sets,
        total_breaths = user_stats.total_breaths + NEW.completed_breaths,
        last_exercise_date = NEW.exercise_date,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 운동 기록 삽입 시 통계 자동 업데이트
CREATE TRIGGER trigger_update_stats_after_exercise
    AFTER INSERT ON exercise_records
    FOR EACH ROW EXECUTE FUNCTION update_user_stats_after_exercise();

-- 🎯 배지 획득 시 통계 업데이트
CREATE OR REPLACE FUNCTION update_badge_count_after_badge_earned()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_stats 
    SET total_badges_earned = total_badges_earned + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_badge_count
    AFTER INSERT ON user_badges
    FOR EACH ROW EXECUTE FUNCTION update_badge_count_after_badge_earned();

-- 🎮 퀴즈 완료 시 통계 업데이트
CREATE OR REPLACE FUNCTION update_quiz_stats_after_attempt()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_stats 
    SET total_quiz_attempts = total_quiz_attempts + 1,
        perfect_quiz_count = CASE WHEN NEW.is_perfect THEN perfect_quiz_count + 1 ELSE perfect_quiz_count END,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_quiz_stats
    AFTER INSERT ON quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION update_quiz_stats_after_attempt(); 