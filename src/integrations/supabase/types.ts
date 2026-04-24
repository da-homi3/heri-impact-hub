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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      arcade_budget_items: {
        Row: {
          category: string
          created_at: string
          id: string
          label: string
          notes: string | null
          per_unit_cost: number
          phase: string
          sort_order: number
          total_cost: number
          units: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          label: string
          notes?: string | null
          per_unit_cost?: number
          phase: string
          sort_order?: number
          total_cost?: number
          units?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          label?: string
          notes?: string | null
          per_unit_cost?: number
          phase?: string
          sort_order?: number
          total_cost?: number
          units?: number
          updated_at?: string
        }
        Relationships: []
      }
      arcade_operating_costs: {
        Row: {
          active: boolean
          category: string
          created_at: string
          id: string
          label: string
          monthly_cost: number
          notes: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          label: string
          monthly_cost?: number
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          label?: string
          monthly_cost?: number
          notes?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      arcade_sessions: {
        Row: {
          activated_at: string | null
          amount: number
          console_id: string | null
          created_at: string
          duration_minutes: number
          entry_code: string | null
          expires_at: string | null
          game_type: string
          id: string
          last_heartbeat_at: string | null
          mpesa_code: string
          phone: string
          player_name: string
          status: string
        }
        Insert: {
          activated_at?: string | null
          amount: number
          console_id?: string | null
          created_at?: string
          duration_minutes?: number
          entry_code?: string | null
          expires_at?: string | null
          game_type?: string
          id?: string
          last_heartbeat_at?: string | null
          mpesa_code: string
          phone: string
          player_name: string
          status?: string
        }
        Update: {
          activated_at?: string | null
          amount?: number
          console_id?: string | null
          created_at?: string
          duration_minutes?: number
          entry_code?: string | null
          expires_at?: string | null
          game_type?: string
          id?: string
          last_heartbeat_at?: string | null
          mpesa_code?: string
          phone?: string
          player_name?: string
          status?: string
        }
        Relationships: []
      }
      arcade_station_pings: {
        Row: {
          active_session_id: string | null
          cpu_temp: number | null
          created_at: string
          id: string
          metadata: Json | null
          station_code: string | null
          station_id: string | null
          uptime_seconds: number | null
        }
        Insert: {
          active_session_id?: string | null
          cpu_temp?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          station_code?: string | null
          station_id?: string | null
          uptime_seconds?: number | null
        }
        Update: {
          active_session_id?: string | null
          cpu_temp?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          station_code?: string | null
          station_id?: string | null
          uptime_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_station_pings_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "arcade_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_stations: {
        Row: {
          camera_id: string | null
          console_id: string | null
          created_at: string
          id: string
          installed_at: string | null
          ip_address: string | null
          last_heartbeat_at: string | null
          location: string
          name: string
          notes: string | null
          station_code: string
          status: string
          updated_at: string
        }
        Insert: {
          camera_id?: string | null
          console_id?: string | null
          created_at?: string
          id?: string
          installed_at?: string | null
          ip_address?: string | null
          last_heartbeat_at?: string | null
          location: string
          name: string
          notes?: string | null
          station_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          camera_id?: string | null
          console_id?: string | null
          created_at?: string
          id?: string
          installed_at?: string | null
          ip_address?: string | null
          last_heartbeat_at?: string | null
          location?: string
          name?: string
          notes?: string | null
          station_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      arcade_tamper_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          notes: string | null
          payload: Json
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          snapshot_url: string | null
          station_code: string | null
          station_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          notes?: string | null
          payload?: Json
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          snapshot_url?: string | null
          station_code?: string | null
          station_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          notes?: string | null
          payload?: Json
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          snapshot_url?: string | null
          station_code?: string | null
          station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arcade_tamper_events_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "arcade_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      arcade_workforce_roles: {
        Row: {
          created_at: string
          hourly_rate: number
          hours: number
          id: string
          payment_schedule: string | null
          payment_type: string
          phase: string
          role_name: string
          sort_order: number
          task_description: string | null
          total_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          hourly_rate?: number
          hours?: number
          id?: string
          payment_schedule?: string | null
          payment_type?: string
          phase: string
          role_name: string
          sort_order?: number
          task_description?: string | null
          total_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          hourly_rate?: number
          hours?: number
          id?: string
          payment_schedule?: string | null
          payment_type?: string
          phase?: string
          role_name?: string
          sort_order?: number
          task_description?: string | null
          total_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          donor_name: string | null
          id: string
          mpesa_code: string
          phone: string
          source: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          donor_name?: string | null
          id?: string
          mpesa_code: string
          phone: string
          source?: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          donor_name?: string | null
          id?: string
          mpesa_code?: string
          phone?: string
          source?: string
          status?: string
        }
        Relationships: []
      }
      escalated_concerns: {
        Row: {
          chat_history: Json
          concern: string
          created_at: string
          id: string
          name: string | null
          phone: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          chat_history?: Json
          concern: string
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          chat_history?: Json
          concern?: string
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: []
      }
      event_tickets: {
        Row: {
          buyer_name: string
          created_at: string
          email: string | null
          id: string
          mpesa_code: string
          phone: string
          quantity: number
          status: string
          ticket_type: string
          total_amount: number
        }
        Insert: {
          buyer_name: string
          created_at?: string
          email?: string | null
          id?: string
          mpesa_code: string
          phone: string
          quantity?: number
          status?: string
          ticket_type: string
          total_amount: number
        }
        Update: {
          buyer_name?: string
          created_at?: string
          email?: string | null
          id?: string
          mpesa_code?: string
          phone?: string
          quantity?: number
          status?: string
          ticket_type?: string
          total_amount?: number
        }
        Relationships: []
      }
      photo_uploads: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          phone: string | null
          reviewed_at: string | null
          status: string
          storage_path: string
          uploader_name: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          status?: string
          storage_path: string
          uploader_name: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          status?: string
          storage_path?: string
          uploader_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
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
      volunteers: {
        Row: {
          access_code: string | null
          availability: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          interests: string[] | null
          location: string
          payment_reference: string | null
          payment_status: string
          phone: string
          programme_rules_accepted: boolean
          skills: string[] | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_code?: string | null
          availability: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          interests?: string[] | null
          location: string
          payment_reference?: string | null
          payment_status?: string
          phone: string
          programme_rules_accepted?: boolean
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_code?: string | null
          availability?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          interests?: string[] | null
          location?: string
          payment_reference?: string | null
          payment_status?: string
          phone?: string
          programme_rules_accepted?: boolean
          skills?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_arcade_entry_code: { Args: never; Returns: string }
      generate_volunteer_access_code: { Args: never; Returns: string }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      redeem_arcade_code: {
        Args: { _code: string; _console_id?: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
