export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      employee_availabilities: {
        Row: {
          created_at: string | null
          date: string | null
          day_of_week: number | null
          employee_id: string
          end_time: string
          id: string
          note: string | null
          recurrence: string
          start_time: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          day_of_week?: number | null
          employee_id: string
          end_time: string
          id?: string
          note?: string | null
          recurrence: string
          start_time: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          day_of_week?: number | null
          employee_id?: string
          end_time?: string
          id?: string
          note?: string | null
          recurrence?: string
          start_time?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_availabilities_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_preferences: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          preferred_days: number[]
          preferred_hours: Json
          preferred_positions: string[]
          preferred_shifts: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          preferred_days: number[]
          preferred_hours: Json
          preferred_positions: string[]
          preferred_shifts: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          preferred_days?: number[]
          preferred_hours?: Json
          preferred_positions?: string[]
          preferred_shifts?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_preferences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          city: string
          contract_type: string
          country_of_birth: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          employee_status: string | null
          end_date: string | null
          first_name: string
          gross_monthly_salary: number | null
          hiring_date: string | null
          hourly_rate: number | null
          id: string
          last_name: string
          notification_days: number | null
          phone: string
          place_of_birth: string | null
          position: string
          postal_code: string
          restaurant_id: string
          start_date: string
          street_address: string
          updated_at: string | null
        }
        Insert: {
          city: string
          contract_type: string
          country_of_birth?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          employee_status?: string | null
          end_date?: string | null
          first_name: string
          gross_monthly_salary?: number | null
          hiring_date?: string | null
          hourly_rate?: number | null
          id?: string
          last_name: string
          notification_days?: number | null
          phone: string
          place_of_birth?: string | null
          position: string
          postal_code: string
          restaurant_id: string
          start_date: string
          street_address: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          contract_type?: string
          country_of_birth?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          employee_status?: string | null
          end_date?: string | null
          first_name?: string
          gross_monthly_salary?: number | null
          hiring_date?: string | null
          hourly_rate?: number | null
          id?: string
          last_name?: string
          notification_days?: number | null
          phone?: string
          place_of_birth?: string | null
          position?: string
          postal_code?: string
          restaurant_id?: string
          start_date?: string
          street_address?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          based_on: string
          confidence: number
          created_at: string | null
          date: string
          factors: Json | null
          forecasted_covers: number
          forecasted_turnover: number
          id: string
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          based_on: string
          confidence: number
          created_at?: string | null
          date: string
          factors?: Json | null
          forecasted_covers: number
          forecasted_turnover: number
          id?: string
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          based_on?: string
          confidence?: number
          created_at?: string | null
          date?: string
          factors?: Json | null
          forecasted_covers?: number
          forecasted_turnover?: number
          id?: string
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_data_entries: {
        Row: {
          covers: number
          created_at: string | null
          date: string
          dinner_turnover: number | null
          entered_by: string
          id: string
          lunch_turnover: number | null
          notes: string | null
          restaurant_id: string
          turnover: number
        }
        Insert: {
          covers: number
          created_at?: string | null
          date: string
          dinner_turnover?: number | null
          entered_by: string
          id?: string
          lunch_turnover?: number | null
          notes?: string | null
          restaurant_id: string
          turnover: number
        }
        Update: {
          covers?: number
          created_at?: string | null
          date?: string
          dinner_turnover?: number | null
          entered_by?: string
          id?: string
          lunch_turnover?: number | null
          notes?: string | null
          restaurant_id?: string
          turnover?: number
        }
        Relationships: [
          {
            foreignKeyName: "manual_data_entries_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          absence_hours: number
          average_check: number
          average_hourly_cost: number
          covers: number
          created_at: string | null
          date: string
          gross_payroll_mass: number
          id: string
          overtime_hours: number
          restaurant_id: string
          scheduled_hours: number
          staff_cost_ratio: number
          total_hours_worked: number
          turnover: number
          updated_at: string | null
        }
        Insert: {
          absence_hours: number
          average_check: number
          average_hourly_cost: number
          covers: number
          created_at?: string | null
          date: string
          gross_payroll_mass: number
          id?: string
          overtime_hours: number
          restaurant_id: string
          scheduled_hours: number
          staff_cost_ratio: number
          total_hours_worked: number
          turnover: number
          updated_at?: string | null
        }
        Update: {
          absence_hours?: number
          average_check?: number
          average_hourly_cost?: number
          covers?: number
          created_at?: string | null
          date?: string
          gross_payroll_mass?: number
          id?: string
          overtime_hours?: number
          restaurant_id?: string
          scheduled_hours?: number
          staff_cost_ratio?: number
          total_hours_worked?: number
          turnover?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_credentials: {
        Row: {
          api_key: string | null
          created_at: string | null
          endpoint: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          password: string | null
          provider: string
          restaurant_id: string
          store_id: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          password?: string | null
          provider: string
          restaurant_id: string
          store_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          password?: string | null
          provider?: string
          restaurant_id?: string
          store_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_credentials_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_data: {
        Row: {
          average_check: number | null
          covers: number
          created_at: string | null
          date: string
          id: string
          restaurant_id: string
          sales_by_category: Json | null
          sales_by_hour: Json | null
          sales_by_service: Json | null
          source: string
          turnover: number
          updated_at: string | null
        }
        Insert: {
          average_check?: number | null
          covers: number
          created_at?: string | null
          date: string
          id?: string
          restaurant_id: string
          sales_by_category?: Json | null
          sales_by_hour?: Json | null
          sales_by_service?: Json | null
          source: string
          turnover: number
          updated_at?: string | null
        }
        Update: {
          average_check?: number | null
          covers?: number
          created_at?: string | null
          date?: string
          id?: string
          restaurant_id?: string
          sales_by_category?: Json | null
          sales_by_hour?: Json | null
          sales_by_service?: Json | null
          source?: string
          turnover?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_data_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          location: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          location: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_clock: {
        Row: {
          clock_in_time: string
          clock_out_time: string | null
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          restaurant_id: string
          status: string
          total_hours: number | null
          updated_at: string | null
        }
        Insert: {
          clock_in_time: string
          clock_out_time?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          restaurant_id: string
          status: string
          total_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          clock_in_time?: string
          clock_out_time?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          restaurant_id?: string
          status?: string
          total_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_clock_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_clock_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      time_clock_summary: {
        Row: {
          created_at: string | null
          date: string
          difference: number
          employee_id: string
          id: string
          restaurant_id: string
          scheduled_hours: number
          status: string
          total_hours: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          difference: number
          employee_id: string
          id?: string
          restaurant_id: string
          scheduled_hours: number
          status: string
          total_hours: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          difference?: number
          employee_id?: string
          id?: string
          restaurant_id?: string
          scheduled_hours?: number
          status?: string
          total_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_clock_summary_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_clock_summary_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_restaurant_access: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_restaurant_access_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
