// 🗄️ Supabase 클라이언트 설정
// 숨트레이너 앱용

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database_types'

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// Supabase 클라이언트 생성
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 🔐 인증 관련 함수들
export const auth = {
  // 카카오톡 로그인
  async signInWithKakao(kakaoId: string, userData: {
    nickname?: string
    profileImageUrl?: string
    email?: string
  }) {
    try {
      // 사용자 정보 조회 또는 생성
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('kakao_id', kakaoId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingUser) {
        // 기존 사용자 로그인 시간 업데이트
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ 
            last_login_at: new Date().toISOString(),
            nickname: userData.nickname || existingUser.nickname,
            profile_image_url: userData.profileImageUrl || existingUser.profile_image_url,
            email: userData.email || existingUser.email
          })
          .eq('id', existingUser.id)
          .select()
          .single()

        if (updateError) throw updateError
        return { user: updatedUser, isNew: false }
      } else {
        // 새 사용자 생성
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            kakao_id: kakaoId,
            nickname: userData.nickname,
            profile_image_url: userData.profileImageUrl,
            email: userData.email
          })
          .select()
          .single()

        if (insertError) throw insertError
        return { user: newUser, isNew: true }
      }
    } catch (error) {
      console.error('카카오 로그인 오류:', error)
      throw error
    }
  },

  // 로그아웃
  async signOut() {
    try {
      // 로컬 스토리지 정리
      localStorage.removeItem('breathTrainerUser')
      localStorage.removeItem('breathTrainerStats')
      localStorage.removeItem('breathTrainerHistory')
      
      return { success: true }
    } catch (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
  }
}

// 📊 운동 기록 관련 함수들
export const exerciseRecords = {
  // 운동 기록 저장
  async saveExerciseRecord(userId: string, exerciseData: {
    exerciseDate: string
    exerciseTime: number
    completedSets: number
    completedBreaths: number
    isAborted: boolean
    userFeedback?: string
    resistanceSettings?: { inhale: number; exhale: number }
  }) {
    try {
      const { data, error } = await supabase
        .from('exercise_records')
        .insert({
          user_id: userId,
          exercise_date: exerciseData.exerciseDate,
          exercise_time: exerciseData.exerciseTime,
          completed_sets: exerciseData.completedSets,
          completed_breaths: exerciseData.completedBreaths,
          is_aborted: exerciseData.isAborted,
          user_feedback: exerciseData.userFeedback,
          resistance_settings: exerciseData.resistanceSettings
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('운동 기록 저장 오류:', error)
      throw error
    }
  },

  // 사용자의 운동 기록 조회
  async getUserExerciseRecords(userId: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('exercise_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('운동 기록 조회 오류:', error)
      throw error
    }
  }
}

// 🤖 AI 조언 관련 함수들
export const aiAdvice = {
  // AI 조언 저장
  async saveAdvice(userId: string, exerciseRecordId: string, adviceData: {
    adviceType: 'trainer_advice' | 'local_advice'
    adviceContent: string
    feedbackAnalysis?: any
  }) {
    try {
      const { data, error } = await supabase
        .from('ai_advice_history')
        .insert({
          user_id: userId,
          exercise_record_id: exerciseRecordId,
          advice_type: adviceData.adviceType,
          advice_content: adviceData.adviceContent,
          feedback_analysis: adviceData.feedbackAnalysis
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('AI 조언 저장 오류:', error)
      throw error
    }
  },

  // 사용자의 AI 조언 히스토리 조회
  async getUserAdviceHistory(userId: string, limit = 5) {
    try {
      const { data, error } = await supabase
        .from('ai_advice_history')
        .select(`
          *,
          exercise_records (
            exercise_date,
            completed_sets,
            completed_breaths
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('AI 조언 히스토리 조회 오류:', error)
      throw error
    }
  }
}

// 🎯 배지 관련 함수들
export const badges = {
  // 배지 획득
  async earnBadge(userId: string, badgeData: {
    badgeId: string
    badgeName: string
    badgeIcon: string
    badgeDescription?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeData.badgeId,
          badge_name: badgeData.badgeName,
          badge_icon: badgeData.badgeIcon,
          badge_description: badgeData.badgeDescription
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('배지 획득 오류:', error)
      throw error
    }
  },

  // 사용자의 배지 목록 조회
  async getUserBadges(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('배지 목록 조회 오류:', error)
      throw error
    }
  }
}

// 🎮 퀴즈 관련 함수들
export const quiz = {
  // 퀴즈 시도 기록
  async saveQuizAttempt(userId: string, quizData: {
    quizDate: string
    selectedQuestions: number[]
    correctAnswers: number
    totalQuestions: number
    quizTime?: number
    isPerfect: boolean
  }) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: userId,
          quiz_date: quizData.quizDate,
          selected_questions: quizData.selectedQuestions,
          correct_answers: quizData.correctAnswers,
          total_questions: quizData.totalQuestions,
          quiz_time: quizData.quizTime,
          is_perfect: quizData.isPerfect
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('퀴즈 시도 저장 오류:', error)
      throw error
    }
  },

  // 사용자의 퀴즈 기록 조회
  async getUserQuizAttempts(userId: string, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error('퀴즈 기록 조회 오류:', error)
      throw error
    }
  }
}

// 📈 통계 관련 함수들
export const stats = {
  // 사용자 통계 조회
  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('사용자 통계 조회 오류:', error)
      throw error
    }
  },

  // 통계 업데이트
  async updateUserStats(userId: string, statsData: Partial<Database['public']['Tables']['user_stats']['Update']>) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update(statsData)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('통계 업데이트 오류:', error)
      throw error
    }
  }
} 