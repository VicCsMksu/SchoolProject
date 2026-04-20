export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string;
          appointment_time: string;
          cancel_reason: string | null;
          created_at: string;
          doctor_id: string | null;
          id: string;
          mode: string | null;
          notes: string | null;
          patient_id: string;
          patient_name: string | null;
          reschedule_reason: string | null;
          service_id: string | null;
          status: string;
          updated_at: string;
          visit_note: string | null;
        };
        Insert: {
          appointment_date: string;
          appointment_time: string;
          cancel_reason?: string | null;
          created_at?: string;
          doctor_id?: string | null;
          id?: string;
          mode?: string | null;
          notes?: string | null;
          patient_id: string;
          patient_name?: string | null;
          reschedule_reason?: string | null;
          service_id?: string | null;
          status?: string;
          updated_at?: string;
          visit_note?: string | null;
        };
        Update: {
          appointment_date?: string;
          appointment_time?: string;
          cancel_reason?: string | null;
          created_at?: string;
          doctor_id?: string | null;
          id?: string;
          mode?: string | null;
          notes?: string | null;
          patient_id?: string;
          patient_name?: string | null;
          reschedule_reason?: string | null;
          service_id?: string | null;
          status?: string;
          updated_at?: string;
          visit_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      doctors: {
        Row: {
          availability: string | null;
          bio: string | null;
          created_at: string;
          department: string | null;
          email: string | null;
          id: string;
          name: string;
          patients_count: number | null;
          phone: string | null;
          rating: number | null;
          service_id: string | null;
          specialty: string | null;
          status: string | null;
          updated_at: string;
        };
        Insert: {
          availability?: string | null;
          bio?: string | null;
          created_at?: string;
          department?: string | null;
          email?: string | null;
          id?: string;
          name: string;
          patients_count?: number | null;
          phone?: string | null;
          rating?: number | null;
          service_id?: string | null;
          specialty?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Update: {
          availability?: string | null;
          bio?: string | null;
          created_at?: string;
          department?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          patients_count?: number | null;
          phone?: string | null;
          rating?: number | null;
          service_id?: string | null;
          specialty?: string | null;
          status?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctors_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          blood_type: string | null;
          county: string | null;
          created_at: string;
          date_of_birth: string | null;
          district: string | null;
          division: string | null;
          email: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          full_name: string | null;
          gender: string | null;
          id: string;
          location: string | null;
          phone: string | null;
          po_box: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          blood_type?: string | null;
          county?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          district?: string | null;
          division?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          full_name?: string | null;
          gender?: string | null;
          id?: string;
          location?: string | null;
          phone?: string | null;
          po_box?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          blood_type?: string | null;
          county?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          district?: string | null;
          division?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          full_name?: string | null;
          gender?: string | null;
          id?: string;
          location?: string | null;
          phone?: string | null;
          po_box?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          cost: string | null;
          cost_note: string | null;
          created_at: string;
          description: string | null;
          duration: string | null;
          duration_note: string | null;
          hero_description: string | null;
          icon: string | null;
          id: string;
          insurance_description: string | null;
          insurance_title: string | null;
          name: string;
          next_slot: string | null;
        };
        Insert: {
          cost?: string | null;
          cost_note?: string | null;
          created_at?: string;
          description?: string | null;
          duration?: string | null;
          duration_note?: string | null;
          hero_description?: string | null;
          icon?: string | null;
          id?: string;
          insurance_description?: string | null;
          insurance_title?: string | null;
          name: string;
          next_slot?: string | null;
        };
        Update: {
          cost?: string | null;
          cost_note?: string | null;
          created_at?: string;
          description?: string | null;
          duration?: string | null;
          duration_note?: string | null;
          hero_description?: string | null;
          icon?: string | null;
          id?: string;
          insurance_description?: string | null;
          insurance_title?: string | null;
          name?: string;
          next_slot?: string | null;
        };
        Relationships: [];
      };
      treatment_progress: {
        Row: {
          created_at: string;
          current_stage: string | null;
          expected_end_date: string | null;
          id: string;
          notes: string | null;
          patient_id: string;
          service_id: string | null;
          service_name: string | null;
          start_date: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_stage?: string | null;
          expected_end_date?: string | null;
          id?: string;
          notes?: string | null;
          patient_id: string;
          service_id?: string | null;
          service_name?: string | null;
          start_date?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_stage?: string | null;
          expected_end_date?: string | null;
          id?: string;
          notes?: string | null;
          patient_id?: string;
          service_id?: string | null;
          service_name?: string | null;
          start_date?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatment_progress_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "treatment_progress_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          appointment_id: string | null;
          body: string;
          created_at: string;
          id: string;
          read: boolean;
          title: string;
          type: string | null;
          user_id: string;
        };
        Insert: {
          appointment_id?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          read?: boolean;
          title: string;
          type?: string | null;
          user_id: string;
        };
        Update: {
          appointment_id?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          read?: boolean;
          title?: string;
          type?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: false;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      patient_instructions: {
        Row: {
          id: string;
          patient_id: string;
          title: string;
          body: string;
          appointment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          title: string;
          body: string;
          appointment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          title?: string;
          body?: string;
          appointment_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
