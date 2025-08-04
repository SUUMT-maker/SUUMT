// 🗄️ Supabase 데이터베이스 타입 정의 v2
// 숨트레이너 앱용 - 익명 사용자 지원

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          device_id: string | null
          created_at: string
          updated_at: string
          timezone: string
          is_anonymous: boolean
          last_active: string
        }
        Insert: {
          id?: string
          device_id?: string | null
          created_at?: string
          updated_at?: string
          timezone?: string
          is_anonymous?: boolean
          last_active?: string
        }
        Update: {
          id?: string
          device_id?: string | null
          created_at?: string
          updated_at?: string
          timezone?: string
          is_anonymous?: boolean
          last_active?: string
        }
      }
      exercise_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          completed_at: string | null
          exercise_duration: number | null
          completed_sets: number
          completed_breaths: number
          target_sets: number
          target_breaths_per_set: number
          is_aborted: boolean
          inhale_resistance: number
          exhale_resistance: number
          user_feedback: 'easy' | 'perfect' | 'hard' | null
          ai_advice: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          started_at?: string
          completed_at?: string | null
          exercise_duration?: number | null
          completed_sets?: number
          completed_breaths?: number
          target_sets?: number
          target_breaths_per_set?: number
          is_aborted?: boolean
          inhale_resistance?: number
          exhale_resistance?: number
          user_feedback?: 'easy' | 'perfect' | 'hard' | null
          ai_advice?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          started_at?: string
          completed_at?: string | null
          exercise_duration?: number | null
          completed_sets?: number
          completed_breaths?: number
          target_sets?: number
          target_breaths_per_set?: number
          is_aborted?: boolean
          inhale_resistance?: number
          exhale_resistance?: number
          user_feedback?: 'easy' | 'perfect' | 'hard' | null
          ai_advice?: Json | null
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          total_exercises: number
          total_sets: number
          total_breaths: number
          consecutive_days: number
          last_exercise_date: string | null
          max_inhale_resistance: number
          max_exhale_resistance: number
          skipped_rest_count: number
          early_morning_count: number
          updated_at: string
        }
        Insert: {
          user_id: string
          total_exercises?: number
          total_sets?: number
          total_breaths?: number
          consecutive_days?: number
          last_exercise_date?: string | null
          max_inhale_resistance?: number
          max_exhale_resistance?: number
          skipped_rest_count?: number
          early_morning_count?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          total_exercises?: number
          total_sets?: number
          total_breaths?: number
          consecutive_days?: number
          last_exercise_date?: string | null
          max_inhale_resistance?: number
          max_exhale_resistance?: number
          skipped_rest_count?: number
          early_morning_count?: number
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          icon: string
          description: string
          hint: string
          category: string
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          icon: string
          description: string
          hint: string
          category?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          description?: string
          hint?: string
          category?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: number
          question: string
          options: Json
          correct_answer: number
          explanation: string
          category: string
          difficulty: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: number
          question: string
          options: Json
          correct_answer: number
          explanation: string
          category?: string
          difficulty?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          question?: string
          options?: Json
          correct_answer?: number
          explanation?: string
          category?: string
          difficulty?: string
          is_active?: boolean
          created_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          session_id: string
          questions_attempted: Json
          answers_given: Json
          correct_count: number
          total_questions: number
          completed_at: string
          quiz_duration: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          questions_attempted: Json
          answers_given: Json
          correct_count?: number
          total_questions?: number
          completed_at?: string
          quiz_duration?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          questions_attempted?: Json
          answers_given?: Json
          correct_count?: number
          total_questions?: number
          completed_at?: string
          quiz_duration?: number | null
          created_at?: string
        }
      }
      feedback_history: {
        Row: {
          id: string
          user_id: string
          session_id: string
          feedback: 'easy' | 'perfect' | 'hard'
          inhale_resistance: number
          exhale_resistance: number
          time_of_day: 'morning' | 'afternoon' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          feedback: 'easy' | 'perfect' | 'hard'
          inhale_resistance: number
          exhale_resistance: number
          time_of_day?: 'morning' | 'afternoon' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          feedback?: 'easy' | 'perfect' | 'hard'
          inhale_resistance?: number
          exhale_resistance?: number
          time_of_day?: 'morning' | 'afternoon' | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          original_price: string
          discount_price: string
          discount_percent: number
          image_url: string | null
          description: string | null
          special_path: string | null
          is_active: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          original_price: string
          discount_price: string
          discount_percent: number
          image_url?: string | null
          description?: string | null
          special_path?: string | null
          is_active?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          original_price?: string
          discount_price?: string
          discount_percent?: number
          image_url?: string | null
          description?: string | null
          special_path?: string | null
          is_active?: boolean
          order_index?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 🎯 앱에서 사용할 타입 정의
export type User = Database['public']['Tables']['users']['Row']
export type ExerciseSession = Database['public']['Tables']['exercise_sessions']['Row']
export type UserStats = Database['public']['Tables']['user_stats']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']
export type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row']
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
export type FeedbackHistory = Database['public']['Tables']['feedback_history']['Row']
export type Product = Database['public']['Tables']['products']['Row']

// 📊 저항 설정 타입
export interface ResistanceSettings {
  inhale: number
  exhale: number
}

// 🎮 퀴즈 관련 타입
export interface QuizQuestionData {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: string
  difficulty: string
}

// 🎯 배지 타입
export interface BadgeData {
  id: string
  name: string
  icon: string
  description: string
  hint: string
  category: string
  orderIndex: number
  isActive: boolean
}

// 📱 디바이스 정보 타입
export interface DeviceInfo {
  deviceId: string
  timezone: string
  isAnonymous: boolean
}

// 🏃‍♂️ 운동 세션 타입
export interface ExerciseSessionData {
  userId: string
  targetSets: number
  targetBreathsPerSet: number
  inhaleResistance: number
  exhaleResistance: number
}

// 💬 피드백 타입
export type FeedbackType = 'easy' | 'perfect' | 'hard'
export type TimeOfDay = 'morning' | 'afternoon'

// 🛒 상품 타입
export interface ProductData {
  id: string
  name: string
  originalPrice: string
  discountPrice: string
  discountPercent: number
  imageUrl?: string
  description?: string
  specialPath?: string
  orderIndex: number
  isActive: boolean
} 