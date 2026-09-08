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
      admin_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          action_type: string | null
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          action_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          created_at: string
          details: string
          id: string
          image_url: string
          is_active: boolean
          issue_date: string
          issuer: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string
          id?: string
          image_url?: string
          is_active?: boolean
          issue_date?: string
          issuer?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          image_url?: string
          is_active?: boolean
          issue_date?: string
          issuer?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      custom_orders: {
        Row: {
          admin_notes: string | null
          colors: string | null
          company: string | null
          created_at: string
          delivery_time: string | null
          design_details: string | null
          email: string
          id: string
          moq: string | null
          name: string
          phone: string | null
          product: string | null
          quantity: number | null
          status: string
          tracking_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          colors?: string | null
          company?: string | null
          created_at?: string
          delivery_time?: string | null
          design_details?: string | null
          email: string
          id?: string
          moq?: string | null
          name: string
          phone?: string | null
          product?: string | null
          quantity?: number | null
          status?: string
          tracking_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          colors?: string | null
          company?: string | null
          created_at?: string
          delivery_time?: string | null
          design_details?: string | null
          email?: string
          id?: string
          moq?: string | null
          name?: string
          phone?: string | null
          product?: string | null
          quantity?: number | null
          status?: string
          tracking_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      customization_videos: {
        Row: {
          caption_style: Json | null
          captions: Json | null
          captions_raw: string | null
          captions_url: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_published: boolean | null
          process_type: string | null
          thumbnail_url: string | null
          title: string
          total_pauses: number | null
          total_plays: number | null
          total_time_watched: number | null
          updated_at: string | null
          video_url: string
        }
        Insert: {
          caption_style?: Json | null
          captions?: Json | null
          captions_raw?: string | null
          captions_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          process_type?: string | null
          thumbnail_url?: string | null
          title: string
          total_pauses?: number | null
          total_plays?: number | null
          total_time_watched?: number | null
          updated_at?: string | null
          video_url: string
        }
        Update: {
          caption_style?: Json | null
          captions?: Json | null
          captions_raw?: string | null
          captions_url?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_published?: boolean | null
          process_type?: string | null
          thumbnail_url?: string | null
          title?: string
          total_pauses?: number | null
          total_plays?: number | null
          total_time_watched?: number | null
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          order_id: string | null
          recipient: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          order_id?: string | null
          recipient: string
          status: string
          subject: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          order_id?: string | null
          recipient?: string
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_banners: {
        Row: {
          accent: string
          created_at: string
          cta_label: string
          cta_url: string
          draft_data: Json | null
          id: string
          image_url: string
          is_active: boolean
          published_at: string | null
          scheduled_publish_at: string | null
          secondary_label: string
          secondary_url: string
          sort_order: number
          status: string
          subtitle: string
          title1: string
          title2: string
          updated_at: string
        }
        Insert: {
          accent?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          draft_data?: Json | null
          id?: string
          image_url: string
          is_active?: boolean
          published_at?: string | null
          scheduled_publish_at?: string | null
          secondary_label?: string
          secondary_url?: string
          sort_order?: number
          status?: string
          subtitle?: string
          title1: string
          title2?: string
          updated_at?: string
        }
        Update: {
          accent?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          draft_data?: Json | null
          id?: string
          image_url?: string
          is_active?: boolean
          published_at?: string | null
          scheduled_publish_at?: string | null
          secondary_label?: string
          secondary_url?: string
          sort_order?: number
          status?: string
          subtitle?: string
          title1?: string
          title2?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          status?: string
          type: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          status?: string
          type?: string
        }
        Relationships: []
      }
      instagram_posts: {
        Row: {
          caption: string | null
          category_target: string | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          media_hash: string | null
          media_type: string | null
          media_url: string | null
          page_target: string | null
          permalink: string | null
          source: string | null
          thumbnail_url: string | null
          timestamp: string | null
        }
        Insert: {
          caption?: string | null
          category_target?: string | null
          created_at?: string | null
          id: string
          is_visible?: boolean | null
          media_hash?: string | null
          media_type?: string | null
          media_url?: string | null
          page_target?: string | null
          permalink?: string | null
          source?: string | null
          thumbnail_url?: string | null
          timestamp?: string | null
        }
        Update: {
          caption?: string | null
          category_target?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          media_hash?: string | null
          media_type?: string | null
          media_url?: string | null
          page_target?: string | null
          permalink?: string | null
          source?: string | null
          thumbnail_url?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      instagram_settings: {
        Row: {
          access_token: string | null
          auto_publish: boolean | null
          caption_language: string | null
          created_at: string | null
          id: string
          instagram_user_id: string | null
          is_connected: boolean | null
          last_sync: string | null
          last_sync_error: string | null
          last_sync_status: string | null
          oauth_state: string | null
          oauth_state_expires_at: string | null
          token_expires_at: string | null
          updated_at: string | null
          username: string | null
          webhook_verify_token: string | null
        }
        Insert: {
          access_token?: string | null
          auto_publish?: boolean | null
          caption_language?: string | null
          created_at?: string | null
          id?: string
          instagram_user_id?: string | null
          is_connected?: boolean | null
          last_sync?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          oauth_state?: string | null
          oauth_state_expires_at?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          username?: string | null
          webhook_verify_token?: string | null
        }
        Update: {
          access_token?: string | null
          auto_publish?: boolean | null
          caption_language?: string | null
          created_at?: string | null
          id?: string
          instagram_user_id?: string | null
          is_connected?: boolean | null
          last_sync?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          oauth_state?: string | null
          oauth_state_expires_at?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          username?: string | null
          webhook_verify_token?: string | null
        }
        Relationships: []
      }
      instagram_sync_logs: {
        Row: {
          created_at: string | null
          error_code: string | null
          id: string
          media_id: string | null
          message: string | null
          payload: Json | null
          posts_synced: number | null
          recommended_action: string | null
          resolved: boolean | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_code?: string | null
          id?: string
          media_id?: string | null
          message?: string | null
          payload?: Json | null
          posts_synced?: number | null
          recommended_action?: string | null
          resolved?: boolean | null
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_code?: string | null
          id?: string
          media_id?: string | null
          message?: string | null
          payload?: Json | null
          posts_synced?: number | null
          recommended_action?: string | null
          resolved?: boolean | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          email_status: string
          id: string
          status: string
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          email: string
          email_status?: string
          id?: string
          status?: string
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          email_status?: string
          id?: string
          status?: string
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          email: string
          id: string
          status: string
          stripe_payment_intent_id: string | null
          total_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          user_id?: string | null
        }
        Relationships: []
      }
      page_content: {
        Row: {
          body: string | null
          id: string
          image_url: string | null
          page: string
          section_key: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          id?: string
          image_url?: string | null
          page: string
          section_key: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          id?: string
          image_url?: string | null
          page?: string
          section_key?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          colors: Json
          cover_image: string | null
          created_at: string
          currency: string
          description: string | null
          draft_data: Json | null
          id: string
          images: Json
          is_active: boolean
          is_featured: boolean
          name: string
          price: number | null
          published_at: string | null
          scheduled_publish_at: string | null
          sizes: Json
          slug: string
          sort_order: number
          status: string
          stock: number
          updated_at: string
        }
        Insert: {
          category: string
          colors?: Json
          cover_image?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          draft_data?: Json | null
          id?: string
          images?: Json
          is_active?: boolean
          is_featured?: boolean
          name: string
          price?: number | null
          published_at?: string | null
          scheduled_publish_at?: string | null
          sizes?: Json
          slug: string
          sort_order?: number
          status?: string
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string
          colors?: Json
          cover_image?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          draft_data?: Json | null
          id?: string
          images?: Json
          is_active?: boolean
          is_featured?: boolean
          name?: string
          price?: number | null
          published_at?: string | null
          scheduled_publish_at?: string | null
          sizes?: Json
          slug?: string
          sort_order?: number
          status?: string
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      publish_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          notes: string | null
          publish_at: string
          published_at: string | null
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          notes?: string | null
          publish_at: string
          published_at?: string | null
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          notes?: string | null
          publish_at?: string
          published_at?: string | null
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string | null
          design_mockup_url: string | null
          email: string
          id: string
          name: string
          quantity: number | null
          sport_type: string | null
          status: string
          tracking_id: string | null
        }
        Insert: {
          created_at?: string | null
          design_mockup_url?: string | null
          email: string
          id?: string
          name: string
          quantity?: number | null
          sport_type?: string | null
          status?: string
          tracking_id?: string | null
        }
        Update: {
          created_at?: string | null
          design_mockup_url?: string | null
          email?: string
          id?: string
          name?: string
          quantity?: number | null
          sport_type?: string | null
          status?: string
          tracking_id?: string | null
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          columns: Json
          created_at: string | null
          date_range_type: string
          format: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          name: string
          recipient_email: string
        }
        Insert: {
          columns: Json
          created_at?: string | null
          date_range_type: string
          format?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name: string
          recipient_email: string
        }
        Update: {
          columns?: Json
          created_at?: string | null
          date_range_type?: string
          format?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name?: string
          recipient_email?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      theme_versions: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tracking: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device: string | null
          id: string
          ip: string | null
          latitude: number | null
          location_json: Json | null
          longitude: number | null
          os: string | null
          page_path: string | null
          postal_code: string | null
          region: string | null
          timezone: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip?: string | null
          latitude?: number | null
          location_json?: Json | null
          longitude?: number | null
          os?: string | null
          page_path?: string | null
          postal_code?: string | null
          region?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device?: string | null
          id?: string
          ip?: string | null
          latitude?: number | null
          location_json?: Json | null
          longitude?: number | null
          os?: string | null
          page_path?: string | null
          postal_code?: string | null
          region?: string | null
          timezone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      video_engagement: {
        Row: {
          action: string
          created_at: string | null
          id: string
          value: number | null
          video_id: string | null
          visitor_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          value?: number | null
          video_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          value?: number | null
          video_id?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_engagement_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "customization_videos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_video_stat: {
        Args: { col: string; val: number; vid_id: string }
        Returns: undefined
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin" | "developer" | "user"
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
      app_role: ["owner", "admin", "developer", "user"],
    },
  },
} as const
