-- 🗄️ 숨트레이너 데이터베이스 스키마 v2
-- Supabase PostgreSQL 데이터베이스용
-- 익명 사용자 지원 및 개선된 구조

-- 1. 사용자 테이블 (익명 사용자 지원)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  timezone TEXT DEFAULT 'Asia/Seoul',
  is_anonymous BOOLEAN DEFAULT true,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 운동 세션 기록
CREATE TABLE exercise_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  exercise_duration INTEGER,
  completed_sets INTEGER DEFAULT 0,
  completed_breaths INTEGER DEFAULT 0,
  target_sets INTEGER DEFAULT 2,
  target_breaths_per_set INTEGER DEFAULT 10,
  is_aborted BOOLEAN DEFAULT false,
  inhale_resistance INTEGER DEFAULT 1,
  exhale_resistance INTEGER DEFAULT 1,
  user_feedback TEXT CHECK (user_feedback IN ('easy', 'perfect', 'hard')),
  ai_advice JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 사용자 통계
CREATE TABLE user_stats (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  total_exercises INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_breaths INTEGER DEFAULT 0,
  consecutive_days INTEGER DEFAULT 0,
  last_exercise_date DATE,
  max_inhale_resistance INTEGER DEFAULT 1,
  max_exhale_resistance INTEGER DEFAULT 1,
  skipped_rest_count INTEGER DEFAULT 0,
  early_morning_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 배지 마스터
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  hint TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 사용자 배지 획득
CREATE TABLE user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 6. 퀴즈 문제 마스터
CREATE TABLE quiz_questions (
  id INTEGER PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  category TEXT DEFAULT 'breathing',
  difficulty TEXT DEFAULT 'easy',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 퀴즈 시도 기록
CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES exercise_sessions(id) ON DELETE CASCADE,
  questions_attempted JSONB,
  answers_given JSONB,
  correct_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 2,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quiz_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 피드백 히스토리
CREATE TABLE feedback_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES exercise_sessions(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL CHECK (feedback IN ('easy', 'perfect', 'hard')),
  inhale_resistance INTEGER NOT NULL,
  exhale_resistance INTEGER NOT NULL,
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 상품 정보
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  original_price TEXT NOT NULL,
  discount_price TEXT NOT NULL,
  discount_percent INTEGER NOT NULL,
  image_url TEXT,
  description TEXT,
  special_path TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔍 인덱스 생성 (성능 최적화)
CREATE INDEX idx_users_device_id ON users(device_id);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_exercise_sessions_user_id ON exercise_sessions(user_id);
CREATE INDEX idx_exercise_sessions_started_at ON exercise_sessions(started_at);
CREATE INDEX idx_exercise_sessions_completed_at ON exercise_sessions(completed_at);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_session_id ON quiz_attempts(session_id);
CREATE INDEX idx_feedback_history_user_id ON feedback_history(user_id);
CREATE INDEX idx_feedback_history_session_id ON feedback_history(session_id);
CREATE INDEX idx_products_order_index ON products(order_index);
CREATE INDEX idx_products_is_active ON products(is_active);

-- 🔒 RLS (Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 RLS 정책 (익명 사용자 지원)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text OR device_id = current_setting('app.device_id', true));

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text OR device_id = current_setting('app.device_id', true));

-- 운동 세션 RLS 정책
CREATE POLICY "Users can view own exercise sessions" ON exercise_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own exercise sessions" ON exercise_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own exercise sessions" ON exercise_sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 사용자 통계 RLS 정책
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 배지 마스터 RLS 정책 (읽기 전용)
CREATE POLICY "Anyone can view active badges" ON badges
    FOR SELECT USING (is_active = true);

-- 사용자 배지 RLS 정책
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 퀴즈 문제 RLS 정책 (읽기 전용)
CREATE POLICY "Anyone can view active quiz questions" ON quiz_questions
    FOR SELECT USING (is_active = true);

-- 퀴즈 시도 RLS 정책
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 피드백 히스토리 RLS 정책
CREATE POLICY "Users can view own feedback history" ON feedback_history
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own feedback history" ON feedback_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 상품 정보 RLS 정책 (읽기 전용)
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

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
CREATE OR REPLACE FUNCTION update_user_stats_after_session()
RETURNS TRIGGER AS $$
BEGIN
    -- 사용자 통계 업데이트
    INSERT INTO user_stats (user_id, total_exercises, total_sets, total_breaths, last_exercise_date)
    VALUES (NEW.user_id, 1, NEW.completed_sets, NEW.completed_breaths, DATE(NEW.completed_at))
    ON CONFLICT (user_id) DO UPDATE SET
        total_exercises = user_stats.total_exercises + 1,
        total_sets = user_stats.total_sets + NEW.completed_sets,
        total_breaths = user_stats.total_breaths + NEW.completed_breaths,
        last_exercise_date = DATE(NEW.completed_at),
        max_inhale_resistance = GREATEST(user_stats.max_inhale_resistance, NEW.inhale_resistance),
        max_exhale_resistance = GREATEST(user_stats.max_exhale_resistance, NEW.exhale_resistance),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 운동 세션 완료 시 통계 자동 업데이트
CREATE TRIGGER trigger_update_stats_after_session
    AFTER UPDATE OF completed_at ON exercise_sessions
    FOR EACH ROW 
    WHEN (NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL)
    EXECUTE FUNCTION update_user_stats_after_session();

-- 🎯 배지 획득 시 통계 업데이트
CREATE OR REPLACE FUNCTION update_badge_count_after_badge_earned()
RETURNS TRIGGER AS $$
BEGIN
    -- 배지 카운트는 별도 컬럼으로 관리하지 않고 user_badges 테이블에서 COUNT로 계산
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
    -- 퀴즈 통계는 별도 컬럼으로 관리하지 않고 quiz_attempts 테이블에서 계산
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_quiz_stats
    AFTER INSERT ON quiz_attempts
    FOR EACH ROW EXECUTE FUNCTION update_quiz_stats_after_attempt();

-- 📱 디바이스 ID 설정 함수
CREATE OR REPLACE FUNCTION set_device_id(device_id_param TEXT)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.device_id', device_id_param, false);
END;
$$ language 'plpgsql';

-- 🔧 연속일수 계산 함수
CREATE OR REPLACE FUNCTION calculate_consecutive_days(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    consecutive_count INTEGER := 0;
    current_date DATE := CURRENT_DATE;
    check_date DATE;
BEGIN
    LOOP
        SELECT COUNT(*) INTO consecutive_count
        FROM exercise_sessions
        WHERE user_id = user_uuid 
        AND DATE(completed_at) = check_date
        AND is_aborted = false;
        
        IF consecutive_count = 0 THEN
            EXIT;
        END IF;
        
        consecutive_count := consecutive_count + 1;
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    RETURN consecutive_count;
END;
$$ language 'plpgsql'; 