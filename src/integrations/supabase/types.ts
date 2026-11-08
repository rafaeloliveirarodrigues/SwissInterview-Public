export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      coffee_payments: {
        Row: {
          created_at: string
          email: string | null
          event_id: string
          id: string
          matched_user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          matched_user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          matched_user_id?: string | null
        }
        Relationships: []
      }
      interview_credits: {
        Row: {
          remaining: number
          updated_at: string
          user_id: string
        }
        Insert: {
          remaining?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          remaining?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interview_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          media_consent_at: string | null
          overall_score: number | null
          prep_id: string
          report: Json | null
          session_kind: string
          stage: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          media_consent_at?: string | null
          overall_score?: number | null
          prep_id: string
          report?: Json | null
          session_kind?: string
          stage?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          media_consent_at?: string | null
          overall_score?: number | null
          prep_id?: string
          report?: Json | null
          session_kind?: string
          stage?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_prep_id_fkey"
            columns: ["prep_id"]
            isOneToOne: false
            referencedRelation: "preps"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_turns: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          idx: number
          question: string
          question_kind: string | null
          session_id: string
          speech_metrics: Json | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          idx: number
          question: string
          question_kind?: string | null
          session_id: string
          speech_metrics?: Json | null
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          idx?: number
          question?: string
          question_kind?: string | null
          session_id?: string
          speech_metrics?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_turns_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      preps: {
        Row: {
          company_brief: Json | null
          company_name: string
          created_at: string
          cv_file_name: string | null
          cv_file_path: string | null
          cv_has_photo: boolean | null
          cv_page_count: number | null
          cv_review: Json | null
          cv_text: string | null
          id: string
          interview_guide: Json | null
          job_description: string
          language: string
          role_title: string
          swiss_cv_review: Json | null
          user_id: string
        }
        Insert: {
          company_brief?: Json | null
          company_name: string
          created_at?: string
          cv_file_name?: string | null
          cv_file_path?: string | null
          cv_has_photo?: boolean | null
          cv_page_count?: number | null
          cv_review?: Json | null
          cv_text?: string | null
          id?: string
          interview_guide?: Json | null
          job_description: string
          language?: string
          role_title: string
          swiss_cv_review?: Json | null
          user_id: string
        }
        Update: {
          company_brief?: Json | null
          company_name?: string
          created_at?: string
          cv_file_name?: string | null
          cv_file_path?: string | null
          cv_has_photo?: boolean | null
          cv_page_count?: number | null
          cv_review?: Json | null
          cv_text?: string | null
          id?: string
          interview_guide?: Json | null
          job_description?: string
          language?: string
          role_title?: string
          swiss_cv_review?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          inactivity_warned_at: string | null
          last_active_at: string | null
          privacy_consent_at: string | null
          privacy_policy_version: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          inactivity_warned_at?: string | null
          last_active_at?: string | null
          privacy_consent_at?: string | null
          privacy_policy_version?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          inactivity_warned_at?: string | null
          last_active_at?: string | null
          privacy_consent_at?: string | null
          privacy_policy_version?: number | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string | null
          grants: number
          id: string
          max_uses: number | null
          note: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at?: string | null
          grants?: number
          id?: string
          max_uses?: number | null
          note?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string | null
          grants?: number
          id?: string
          max_uses?: number | null
          note?: string | null
        }
        Relationships: []
      }
      promo_redemptions: {
        Row: {
          code_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      question_practice: {
        Row: {
          answer: string
          created_at: string
          feedback: Json
          id: string
          speech_metrics: Json | null
          turn_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          feedback: Json
          id?: string
          speech_metrics?: Json | null
          turn_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          feedback?: Json
          id?: string
          speech_metrics?: Json | null
          turn_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_practice_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "interview_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      rav_applications: {
        Row: {
          application_date: string
          company: string
          contact: string
          country: string
          created_at: string
          email: string
          id: string
          job_url: string
          method: string
          outcome: string
          phone: string
          po_box: string
          postal_city: string
          prep_id: string | null
          rav_assigned: boolean
          role: string
          street: string
          street_number: string
          user_id: string
          workload: string
        }
        Insert: {
          application_date: string
          company: string
          contact?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          job_url?: string
          method?: string
          outcome?: string
          phone?: string
          po_box?: string
          postal_city?: string
          prep_id?: string | null
          rav_assigned?: boolean
          role: string
          street?: string
          street_number?: string
          user_id: string
          workload?: string
        }
        Update: {
          application_date?: string
          company?: string
          contact?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          job_url?: string
          method?: string
          outcome?: string
          phone?: string
          po_box?: string
          postal_city?: string
          prep_id?: string | null
          rav_assigned?: boolean
          role?: string
          street?: string
          street_number?: string
          user_id?: string
          workload?: string
        }
        Relationships: [
          {
            foreignKeyName: "rav_applications_prep_id_fkey"
            columns: ["prep_id"]
            isOneToOne: false
            referencedRelation: "preps"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_reviews: {
        Row: {
          created_at: string
          file_name: string
          id: string
          report: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          report: Json
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          report?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_interview_credit: { Args: never; Returns: number }
      find_confirmed_user_by_email: {
        Args: { _email: string }
        Returns: string
      }
      get_interview_credits: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_promo: { Args: { _code: string }; Returns: number }
      refund_interview_credit: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
