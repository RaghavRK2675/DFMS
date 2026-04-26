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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          activity_score: number | null
          body_temp: number | null
          breed: string | null
          created_at: string
          created_by: string | null
          current_weight_kg: number | null
          date_of_birth: string | null
          health_status: string | null
          id: string
          is_isolated: boolean
          notes: string | null
          pen: string
          sex: string | null
          skin_color_index: number | null
          species: string
          status: string
          tag: string
          updated_at: string
        }
        Insert: {
          activity_score?: number | null
          body_temp?: number | null
          breed?: string | null
          created_at?: string
          created_by?: string | null
          current_weight_kg?: number | null
          date_of_birth?: string | null
          health_status?: string | null
          id?: string
          is_isolated?: boolean
          notes?: string | null
          pen?: string
          sex?: string | null
          skin_color_index?: number | null
          species: string
          status?: string
          tag: string
          updated_at?: string
        }
        Update: {
          activity_score?: number | null
          body_temp?: number | null
          breed?: string | null
          created_at?: string
          created_by?: string | null
          current_weight_kg?: number | null
          date_of_birth?: string | null
          health_status?: string | null
          id?: string
          is_isolated?: boolean
          notes?: string | null
          pen?: string
          sex?: string | null
          skin_color_index?: number | null
          species?: string
          status?: string
          tag?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          summary: string
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          summary: string
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          summary?: string
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      medical_events: {
        Row: {
          animal_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          occurred_at: string
          recorded_by: string | null
          severity: string | null
          title: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          occurred_at?: string
          recorded_by?: string | null
          severity?: string | null
          title: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          occurred_at?: string
          recorded_by?: string | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_events_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      mortality_records: {
        Row: {
          animal_id: string
          cause: string
          created_at: string
          died_at: string
          id: string
          post_mortem_notes: string | null
          recorded_by: string | null
        }
        Insert: {
          animal_id: string
          cause: string
          created_at?: string
          died_at?: string
          id?: string
          post_mortem_notes?: string | null
          recorded_by?: string | null
        }
        Update: {
          animal_id?: string
          cause?: string
          created_at?: string
          died_at?: string
          id?: string
          post_mortem_notes?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mortality_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          farm_name: string
          id: string
          license_id: string
          location: string
          name: string
          phone: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          farm_name?: string
          id: string
          license_id?: string
          location?: string
          name?: string
          phone?: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          farm_name?: string
          id?: string
          license_id?: string
          location?: string
          name?: string
          phone?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          animal_id: string
          created_at: string
          diagnosis: string
          dosage: string | null
          ended_at: string | null
          frequency: string | null
          id: string
          medication: string | null
          prescribing_vet: string | null
          recorded_by: string | null
          recovery_notes: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          diagnosis: string
          dosage?: string | null
          ended_at?: string | null
          frequency?: string | null
          id?: string
          medication?: string | null
          prescribing_vet?: string | null
          recorded_by?: string | null
          recovery_notes?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          diagnosis?: string
          dosage?: string | null
          ended_at?: string | null
          frequency?: string | null
          id?: string
          medication?: string | null
          prescribing_vet?: string | null
          recorded_by?: string | null
          recovery_notes?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          administered_at: string
          administered_by: string | null
          animal_id: string
          batch_number: string | null
          created_at: string
          dose: string | null
          id: string
          next_due_at: string | null
          notes: string | null
          vaccine_name: string
          vet_name: string | null
        }
        Insert: {
          administered_at?: string
          administered_by?: string | null
          animal_id: string
          batch_number?: string | null
          created_at?: string
          dose?: string | null
          id?: string
          next_due_at?: string | null
          notes?: string | null
          vaccine_name: string
          vet_name?: string | null
        }
        Update: {
          administered_at?: string
          administered_by?: string | null
          animal_id?: string
          batch_number?: string | null
          created_at?: string
          dose?: string | null
          id?: string
          next_due_at?: string | null
          notes?: string | null
          vaccine_name?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _uid: string
        }
        Returns: boolean
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
      app_role:
        | "admin"
        | "farmer"
        | "veterinarian"
        | "farm_worker"
        | "supervisor"
        | "inspector"
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
      app_role: [
        "admin",
        "farmer",
        "veterinarian",
        "farm_worker",
        "supervisor",
        "inspector",
      ],
    },
  },
} as const
