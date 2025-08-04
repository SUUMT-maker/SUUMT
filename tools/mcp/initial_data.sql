-- 🗄️ 숨트레이너 초기 데이터 삽입
-- 배지, 퀴즈 문제, 상품 정보 등

-- 🎯 배지 데이터 삽입
INSERT INTO badges (id, name, icon, description, hint, category, order_index) VALUES
('first_step', '첫 걸음', '🌱', '첫 번째 호흡 트레이닝 완료', '첫 트레이닝', 'general', 1),
('daily_warrior', '일일 전사', '⚡', '하루에 3번 이상 트레이닝 완료', '하루 3회', 'daily', 2),
('week_master', '주간 마스터', '🔥', '7일 연속 트레이닝 완료', '7일 연속', 'streak', 3),
('breath_collector', '호흡 수집가', '🫁', '총 1000회 호흡 달성', '총 1000회', 'breath', 4),
('endurance_king', '지구력 왕', '👑', '50회 트레이닝 완주', '50회 완주', 'endurance', 5),
('high_intensity', '고강도 도전자', '💪', '들숨/날숨 모두 4단계 이상 달성', '고강도 달성', 'intensity', 6),
('perfect_month', '완벽한 달', '🌟', '30일 연속 트레이닝 완료', '30일 연속', 'streak', 7),
('speed_demon', '스피드 데몬', '⚡', '하루에 5번 이상 트레이닝 완료', '하루 5회', 'daily', 8),
('early_bird', '얼리버드', '🌅', '아침 6시 이전에 트레이닝 완료', '아침 트레이닝', 'time', 9),
('consistency_champion', '꾸준함 챔피언', '🏆', '100일 연속 트레이닝 완료', '100일 연속', 'streak', 10),
('breath_master', '호흡 마스터', '🎯', '총 5000회 호흡 달성', '총 5000회', 'breath', 11),
('intensity_legend', '강도 전설', '🔥', '들숨/날숨 모두 5단계 달성', '최고 강도', 'intensity', 12),
('quiz_explorer', '퀴즈 탐험가', '🧠', '첫 번째 퀴즈 완료', '퀴즈 도전', 'quiz', 13),
('quiz_perfectionist', '퀴즈 완벽주의자', '⭐', '퀴즈 10번 연속 만점', '퀴즈 만점', 'quiz', 14),
('quiz_master', '퀴즈 마스터', '🏆', '총 50번 퀴즈 완료', '퀴즈 마스터', 'quiz', 15)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    description = EXCLUDED.description,
    hint = EXCLUDED.hint,
    category = EXCLUDED.category,
    order_index = EXCLUDED.order_index;

-- 🧠 퀴즈 문제 데이터 삽입
INSERT INTO quiz_questions (id, question, options, correct_answer, explanation, category, difficulty) VALUES
(1, '숨트를 사용한 호흡 운동의 주요 목적은 무엇인가요?', 
 '["폐활량 증가", "근육 강화", "체중 감량", "유연성 향상"]', 
 0, 
 '숨트는 호흡근을 강화하여 폐활량을 증가시키는 것이 주요 목적입니다.', 
 'breathing', 'easy'),

(2, '올바른 호흡 방법은 무엇인가요?', 
 '["빠르고 얕게", "천천히 깊게", "불규칙하게", "입으로만"]', 
 1, 
 '천천히 깊게 호흡하는 것이 폐활량 증가에 가장 효과적입니다.', 
 'breathing', 'easy'),

(3, '호흡 운동 시 주의사항으로 올바른 것은?', 
 '["무리하게 강도 높이기", "정기적으로 휴식 취하기", "빠른 속도로 연속 운동", "식사 직후 운동"]', 
 1, 
 '정기적인 휴식은 호흡근의 회복과 안전한 운동을 위해 중요합니다.', 
 'safety', 'easy'),

(4, '숨트 사용 시 저항 강도를 높이는 적절한 시기는?', 
 '["처음부터 최고 강도", "점진적으로 낮은 강도에서 시작", "무작정 높이기", "한 번에 3단계씩 올리기"]', 
 1, 
 '점진적으로 낮은 강도에서 시작하여 천천히 높이는 것이 안전하고 효과적입니다.', 
 'intensity', 'medium'),

(5, '호흡 운동의 효과를 극대화하는 방법은?', 
 '["하루에 한 번만", "정기적으로 꾸준히", "가끔씩만", "한 번에 오래"]', 
 1, 
 '정기적이고 꾸준한 운동이 호흡근 강화와 폐활량 증가에 가장 효과적입니다.', 
 'effectiveness', 'medium'),

(6, '숨트 사용 중 어지러움이나 불편함을 느낄 때 해야 할 일은?', 
 '["더 강하게 운동", "즉시 중단하고 휴식", "무시하고 계속", "빠르게 운동"]', 
 1, 
 '어지러움이나 불편함을 느끼면 즉시 중단하고 휴식을 취해야 합니다.', 
 'safety', 'easy')
ON CONFLICT (id) DO UPDATE SET
    question = EXCLUDED.question,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    category = EXCLUDED.category,
    difficulty = EXCLUDED.difficulty;

-- 🛒 상품 정보 데이터 삽입
INSERT INTO products (id, name, original_price, discount_price, discount_percent, image_url, description, special_path, order_index) VALUES
('suumt-basic', '숨트 베이직', '₩198,000', '₩168,300', 15, '/images/suumt-product.png', '기본 호흡 운동기구', '/products/basic', 1),
('suumt-pro', '숨트 프로', '₩298,000', '₩253,300', 15, '/images/suumt-product.png', '프리미엄 호흡 운동기구', '/products/pro', 2),
('suumt-accessory', '숨트 액세서리', '₩98,000', '₩83,300', 15, '/images/suumt-accessory.png', '호흡 운동 액세서리', '/products/accessory', 3)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    original_price = EXCLUDED.original_price,
    discount_price = EXCLUDED.discount_price,
    discount_percent = EXCLUDED.discount_percent,
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description,
    special_path = EXCLUDED.special_path,
    order_index = EXCLUDED.order_index;

-- 📊 샘플 사용자 생성 (테스트용)
INSERT INTO users (id, device_id, is_anonymous, timezone) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'test-device-001', true, 'Asia/Seoul'),
('550e8400-e29b-41d4-a716-446655440001', 'test-device-002', true, 'Asia/Seoul')
ON CONFLICT (device_id) DO NOTHING;

-- 📈 샘플 사용자 통계 생성
INSERT INTO user_stats (user_id, total_exercises, total_sets, total_breaths, consecutive_days, last_exercise_date) VALUES
('550e8400-e29b-41d4-a716-446655440000', 5, 10, 100, 3, CURRENT_DATE - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440001', 10, 20, 200, 7, CURRENT_DATE)
ON CONFLICT (user_id) DO UPDATE SET
    total_exercises = EXCLUDED.total_exercises,
    total_sets = EXCLUDED.total_sets,
    total_breaths = EXCLUDED.total_breaths,
    consecutive_days = EXCLUDED.consecutive_days,
    last_exercise_date = EXCLUDED.last_exercise_date;

-- 🎯 샘플 배지 획득 기록
INSERT INTO user_badges (user_id, badge_id) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'first_step'),
('550e8400-e29b-41d4-a716-446655440000', 'daily_warrior'),
('550e8400-e29b-41d4-a716-446655440001', 'first_step'),
('550e8400-e29b-41d4-a716-446655440001', 'week_master')
ON CONFLICT (user_id, badge_id) DO NOTHING;

-- 📝 샘플 운동 세션 기록
INSERT INTO exercise_sessions (user_id, started_at, completed_at, exercise_duration, completed_sets, completed_breaths, target_sets, target_breaths_per_set, is_aborted, inhale_resistance, exhale_resistance, user_feedback) VALUES
('550e8400-e29b-41d4-a716-446655440000', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes', 600, 2, 20, 2, 10, false, 2, 2, 'perfect'),
('550e8400-e29b-41d4-a716-446655440000', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '12 minutes', 720, 2, 20, 2, 10, false, 3, 3, 'hard'),
('550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '8 minutes', 480, 2, 20, 2, 10, false, 1, 1, 'easy'),
('550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '11 minutes', 660, 2, 20, 2, 10, false, 2, 2, 'perfect');

-- 🧠 샘플 퀴즈 시도 기록
INSERT INTO quiz_attempts (user_id, session_id, questions_attempted, answers_given, correct_count, total_questions, quiz_duration) VALUES
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM exercise_sessions WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1), '[0, 2]', '[0, 1]', 1, 2, 120),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM exercise_sessions WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' LIMIT 1), '[1, 3]', '[1, 3]', 2, 2, 90);

-- 💬 샘플 피드백 히스토리
INSERT INTO feedback_history (user_id, session_id, feedback, inhale_resistance, exhale_resistance, time_of_day) VALUES
('550e8400-e29b-41d4-a716-446655440000', (SELECT id FROM exercise_sessions WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' LIMIT 1), 'perfect', 2, 2, 'morning'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM exercise_sessions WHERE user_id = '550e8400-e29b-41d4-a716-446655440001' LIMIT 1), 'easy', 1, 1, 'afternoon'); 