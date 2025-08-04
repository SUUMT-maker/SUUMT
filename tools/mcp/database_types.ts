// 🗄️ Supabase 데이터베이스 타입 정의
// 숨트레이너 앱용

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          kakao_id: string
          nickname: string | null
          profile_image_url: string | null
          email: string | null
          created_at: string
          updated_at: string
          last_login_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          kakao_id: string
          nickname?: string | null
          profile_image_url?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          kakao_id?: string
          nickname?: string | null
          profile_image_url?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string
          is_active?: boolean
        }
      }
      exercise_records: {
        Row: {
          id: string
          user_id: string
          exercise_date: string
          exercise_time: number
          completed_sets: number
          completed_breaths: number
          is_aborted: boolean
          user_feedback: string | null
          resistance_settings: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_date: string
          exercise_time: number
          completed_sets: number
          completed_breaths: number
          is_aborted?: boolean
          user_feedback?: string | null
          resistance_settings?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_date?: string
          exercise_time?: number
          completed_sets?: number
          completed_breaths?: number
          is_aborted?: boolean
          user_feedback?: string | null
          resistance_settings?: Json | null
          created_at?: string
        }
      }
      ai_advice_history: {
        Row: {
          id: string
          user_id: string
          exercise_record_id: string
          advice_type: string
          advice_content: string
          feedback_analysis: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_record_id: string
          advice_type: string
          advice_content: string
          feedback_analysis?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_record_id?: string
          advice_type?: string
          advice_content?: string
          feedback_analysis?: Json | null
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          badge_name: string
          badge_icon: string
          badge_description: string | null
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          badge_name: string
          badge_icon: string
          badge_description?: string | null
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          badge_name?: string
          badge_icon?: string
          badge_description?: string | null
          earned_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_date: string
          selected_questions: Json
          correct_answers: number
          total_questions: number
          quiz_time: number | null
          is_perfect: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_date: string
          selected_questions: Json
          correct_answers: number
          total_questions: number
          quiz_time?: number | null
          is_perfect?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_date?: string
          selected_questions?: Json
          correct_answers?: number
          total_questions?: number
          quiz_time?: number | null
          is_perfect?: boolean
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_exercises: number
          total_sets: number
          total_breaths: number
          consecutive_days: number
          last_exercise_date: string | null
          average_sets: number
          total_quiz_attempts: number
          perfect_quiz_count: number
          total_badges_earned: number
          max_intensity_inhale: number
          max_intensity_exhale: number
          skipped_rest_count: number
          early_morning_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_exercises?: number
          total_sets?: number
          total_breaths?: number
          consecutive_days?: number
          last_exercise_date?: string | null
          average_sets?: number
          total_quiz_attempts?: number
          perfect_quiz_count?: number
          total_badges_earned?: number
          max_intensity_inhale?: number
          max_intensity_exhale?: number
          skipped_rest_count?: number
          early_morning_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_exercises?: number
          total_sets?: number
          total_breaths?: number
          consecutive_days?: number
          last_exercise_date?: string | null
          average_sets?: number
          total_quiz_attempts?: number
          perfect_quiz_count?: number
          total_badges_earned?: number
          max_intensity_inhale?: number
          max_intensity_exhale?: number
          skipped_rest_count?: number
          early_morning_count?: number
          created_at?: string
          updated_at?: string
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
export type ExerciseRecord = Database['public']['Tables']['exercise_records']['Row']
export type AIAdviceHistory = Database['public']['Tables']['ai_advice_history']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']
export type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row']
export type UserStats = Database['public']['Tables']['user_stats']['Row']

// 📊 저항 설정 타입
export interface ResistanceSettings {
  inhale: number
  exhale: number
}

// 🎮 퀴즈 관련 타입
export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

// 🎯 배지 타입
export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  hint: string
  condition: (stats: UserStats) => boolean
} 