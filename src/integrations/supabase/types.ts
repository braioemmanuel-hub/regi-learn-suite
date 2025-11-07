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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academic_details: {
        Row: {
          created_at: string | null
          faculty: string
          id: string
          payment_status: string | null
          programme: string
          registration_number: string
          student_id: string
          updated_at: string | null
          year_of_admission: number
        }
        Insert: {
          created_at?: string | null
          faculty: string
          id?: string
          payment_status?: string | null
          programme: string
          registration_number: string
          student_id: string
          updated_at?: string | null
          year_of_admission: number
        }
        Update: {
          created_at?: string | null
          faculty?: string
          id?: string
          payment_status?: string | null
          programme?: string
          registration_number?: string
          student_id?: string
          updated_at?: string | null
          year_of_admission?: number
        }
        Relationships: [
          {
            foreignKeyName: "academic_details_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_code: string
          course_title: string
          created_at: string | null
          credit_units: number
          faculty: string
          id: string
          programme: string
          semester: number
        }
        Insert: {
          course_code: string
          course_title: string
          created_at?: string | null
          credit_units: number
          faculty: string
          id?: string
          programme: string
          semester: number
        }
        Update: {
          course_code?: string
          course_title?: string
          created_at?: string | null
          credit_units?: number
          faculty?: string
          id?: string
          programme?: string
          semester?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_type: string
          document_url: string
          id: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_type: string
          document_url: string
          id?: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_type?: string
          document_url?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel: {
        Row: {
          block: string | null
          created_at: string | null
          hostel_name: string
          id: string
          room_number: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          block?: string | null
          created_at?: string | null
          hostel_name: string
          id?: string
          room_number: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          block?: string | null
          created_at?: string | null
          hostel_name?: string
          id?: string
          room_number?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_registration_payment: boolean | null
          paid_date: string | null
          payment_proof: string | null
          payment_type: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_registration_payment?: boolean | null
          paid_date?: string | null
          payment_proof?: string | null
          payment_type: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_registration_payment?: boolean | null
          paid_date?: string | null
          payment_proof?: string | null
          payment_type?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string | null
          full_name: string
          gender: string | null
          home_address: string | null
          hometown: string | null
          id: string
          last_name: string | null
          lga: string | null
          marital_status: string | null
          next_of_kin_address: string | null
          next_of_kin_email: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          passport_photo: string | null
          phone_number: string | null
          place_of_birth: string | null
          proposed_course: string | null
          registration_approved: boolean | null
          religion: string | null
          state: string | null
          state_of_origin: string | null
          student_unique_id: string | null
          surname: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          full_name: string
          gender?: string | null
          home_address?: string | null
          hometown?: string | null
          id: string
          last_name?: string | null
          lga?: string | null
          marital_status?: string | null
          next_of_kin_address?: string | null
          next_of_kin_email?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          passport_photo?: string | null
          phone_number?: string | null
          place_of_birth?: string | null
          proposed_course?: string | null
          registration_approved?: boolean | null
          religion?: string | null
          state?: string | null
          state_of_origin?: string | null
          student_unique_id?: string | null
          surname?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          full_name?: string
          gender?: string | null
          home_address?: string | null
          hometown?: string | null
          id?: string
          last_name?: string | null
          lga?: string | null
          marital_status?: string | null
          next_of_kin_address?: string | null
          next_of_kin_email?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          passport_photo?: string | null
          phone_number?: string | null
          place_of_birth?: string | null
          proposed_course?: string | null
          registration_approved?: boolean | null
          religion?: string | null
          state?: string | null
          state_of_origin?: string | null
          student_unique_id?: string | null
          surname?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_documents: {
        Row: {
          birth_certificate: string | null
          created_at: string | null
          id: string
          passport_photo: string | null
          ssce_result: string | null
          state_of_origin_cert: string | null
          student_id: string
        }
        Insert: {
          birth_certificate?: string | null
          created_at?: string | null
          id?: string
          passport_photo?: string | null
          ssce_result?: string | null
          state_of_origin_cert?: string | null
          student_id: string
        }
        Update: {
          birth_certificate?: string | null
          created_at?: string | null
          id?: string
          passport_photo?: string | null
          ssce_result?: string | null
          state_of_origin_cert?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          course_id: string
          created_at: string | null
          grade: string | null
          id: string
          score: number | null
          semester: number
          session: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          grade?: string | null
          id?: string
          score?: number | null
          semester: number
          session: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          grade?: string | null
          id?: string
          score?: number | null
          semester?: number
          session?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "results_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_courses: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          semester: number
          session: string
          student_id: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          semester: number
          session: string
          student_id: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          semester?: number
          session?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          course_id: string
          created_at: string | null
          day_of_week: string
          end_time: string
          id: string
          semester: number
          start_time: string
          venue: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          day_of_week: string
          end_time: string
          id?: string
          semester: number
          start_time: string
          venue: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          day_of_week?: string
          end_time?: string
          id?: string
          semester?: number
          start_time?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      delete_user: { Args: { user_id: string }; Returns: undefined }
      generate_student_id: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "student"],
    },
  },
} as const
