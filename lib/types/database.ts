export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      households: {
        Row: {
          created_at: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      learner_state: {
        Row: {
          current_level: string;
          next_focus: string | null;
          strengths: Json;
          updated_at: string;
          user_id: string;
          weak_points: Json;
        };
        Insert: {
          current_level?: string;
          next_focus?: string | null;
          strengths?: Json;
          updated_at?: string;
          user_id: string;
          weak_points?: Json;
        };
        Update: {
          current_level?: string;
          next_focus?: string | null;
          strengths?: Json;
          updated_at?: string;
          user_id?: string;
          weak_points?: Json;
        };
        Relationships: [];
      };
      personal_context: {
        Row: {
          active: boolean;
          category: Database["public"]["Enums"]["context_category"];
          created_at: string;
          detail: string | null;
          household_id: string;
          id: string;
          label: string;
          source: Database["public"]["Enums"]["context_source"];
          tags: string[];
        };
        Insert: {
          active?: boolean;
          category: Database["public"]["Enums"]["context_category"];
          created_at?: string;
          detail?: string | null;
          household_id: string;
          id?: string;
          label: string;
          source?: Database["public"]["Enums"]["context_source"];
          tags?: string[];
        };
        Update: {
          active?: boolean;
          category?: Database["public"]["Enums"]["context_category"];
          created_at?: string;
          detail?: string | null;
          household_id?: string;
          id?: string;
          label?: string;
          source?: Database["public"]["Enums"]["context_source"];
          tags?: string[];
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          cefr_level: string;
          created_at: string;
          display_name: string | null;
          household_id: string;
          id: string;
          onboarded: boolean;
          target_language: string;
        };
        Insert: {
          cefr_level?: string;
          created_at?: string;
          display_name?: string | null;
          household_id: string;
          id: string;
          onboarded?: boolean;
          target_language?: string;
        };
        Update: {
          cefr_level?: string;
          created_at?: string;
          display_name?: string | null;
          household_id?: string;
          id?: string;
          onboarded?: boolean;
          target_language?: string;
        };
        Relationships: [];
      };
      session_analysis: {
        Row: {
          difficulty_read: string | null;
          errors: Json;
          id: string;
          new_vocab: Json;
          session_id: string;
          suggested_focus: string | null;
        };
        Insert: {
          difficulty_read?: string | null;
          errors?: Json;
          id?: string;
          new_vocab?: Json;
          session_id: string;
          suggested_focus?: string | null;
        };
        Update: {
          difficulty_read?: string | null;
          errors?: Json;
          id?: string;
          new_vocab?: Json;
          session_id?: string;
          suggested_focus?: string | null;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          ended_at: string | null;
          est_cost: number | null;
          id: string;
          input_tokens: number | null;
          output_tokens: number | null;
          scenario: string | null;
          started_at: string;
          transcript: Json;
          user_id: string;
        };
        Insert: {
          ended_at?: string | null;
          est_cost?: number | null;
          id?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          scenario?: string | null;
          started_at?: string;
          transcript?: Json;
          user_id: string;
        };
        Update: {
          ended_at?: string | null;
          est_cost?: number | null;
          id?: string;
          input_tokens?: number | null;
          output_tokens?: number | null;
          scenario?: string | null;
          started_at?: string;
          transcript?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      vocab_items: {
        Row: {
          due_at: string | null;
          ease: number;
          english: string;
          first_seen_session: string | null;
          id: string;
          italian: string;
          user_id: string;
        };
        Insert: {
          due_at?: string | null;
          ease?: number;
          english: string;
          first_seen_session?: string | null;
          id?: string;
          italian: string;
          user_id: string;
        };
        Update: {
          due_at?: string | null;
          ease?: number;
          english?: string;
          first_seen_session?: string | null;
          id?: string;
          italian?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Enums: {
      context_category:
        | "person"
        | "place"
        | "food"
        | "trip"
        | "joke"
        | "regional"
        | "interest";
      context_source: "seed" | "harvested";
    };
  };
};

export const Constants = {
  public: {
    Enums: {
      context_category: [
        "person",
        "place",
        "food",
        "trip",
        "joke",
        "regional",
        "interest",
      ] as const,
      context_source: ["seed", "harvested"] as const,
    },
  },
} as const;

export type ContextCategory = Database["public"]["Enums"]["context_category"];
export type TranscriptEntry = { role: "user" | "assistant"; text: string };
