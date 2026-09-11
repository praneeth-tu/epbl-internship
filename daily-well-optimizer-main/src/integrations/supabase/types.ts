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
      daily_inputs: {
        Row: {
          bmi: number
          created_at: string
          date: string
          exercise_minutes: number
          id: string
          meals: Json
          sleep_hours: number
          stress_level: string | null
          total_calories: number
          user_id: string
          water_glasses: number
          weight_kg: number
          yoga_minutes: number | null
        }
        Insert: {
          bmi: number
          created_at?: string
          date?: string
          exercise_minutes?: number
          id?: string
          meals?: Json
          sleep_hours: number
          stress_level?: string | null
          total_calories?: number
          user_id: string
          water_glasses?: number
          weight_kg: number
          yoga_minutes?: number | null
        }
        Update: {
          bmi?: number
          created_at?: string
          date?: string
          exercise_minutes?: number
          id?: string
          meals?: Json
          sleep_hours?: number
          stress_level?: string | null
          total_calories?: number
          user_id?: string
          water_glasses?: number
          weight_kg?: number
          yoga_minutes?: number | null
        }
        Relationships: []
      }
      foods: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number | null
          category: string | null
          created_at: string
          fat_per_100g: number | null
          fiber_per_100g: number | null
          id: string
          name: string
          protein_per_100g: number | null
        }
        Insert: {
          calories_per_100g: number
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          name: string
          protein_per_100g?: number | null
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number | null
          category?: string | null
          created_at?: string
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          id?: string
          name?: string
          protein_per_100g?: number | null
        }
        Relationships: []
      }
      predictions: {
        Row: {
          created_at: string
          date: string
          diabetes_risk: number
          diet_plan: Json
          heart_risk: number
          id: string
          obesity_risk: number
          risk_levels: Json
          sleep_risk: number
          tips: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          diabetes_risk: number
          diet_plan?: Json
          heart_risk: number
          id?: string
          obesity_risk: number
          risk_levels?: Json
          sleep_risk: number
          tips?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          diabetes_risk?: number
          diet_plan?: Json
          heart_risk?: number
          id?: string
          obesity_risk?: number
          risk_levels?: Json
          sleep_risk?: number
          tips?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          bmi: number
          created_at: string
          gender: string
          height_cm: number
          id: string
          name: string
          updated_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          age: number
          bmi: number
          created_at?: string
          gender: string
          height_cm: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          age?: number
          bmi?: number
          created_at?: string
          gender?: string
          height_cm?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_stress_level: {
        Args: { sleep_hours: number }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
