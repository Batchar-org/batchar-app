export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.5' };
  public: {
    Tables: {
      bids: {
        Row: {
          bidder_id: string;
          created_at: string;
          id: number;
          price: number;
          product_id: number;
          status: Database['public']['Enums']['bid_status'];
          updated_at: string;
        };
        Insert: {
          bidder_id: string;
          created_at?: string;
          id?: number;
          price: number;
          product_id: number;
          status?: Database['public']['Enums']['bid_status'];
          updated_at?: string;
        };
        Update: {
          bidder_id?: string;
          created_at?: string;
          id?: number;
          price?: number;
          product_id?: number;
          status?: Database['public']['Enums']['bid_status'];
          updated_at?: string;
        };
        Relationships: [];
      };
      blocks: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string;
          id: number;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string;
          id?: number;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string;
          id?: number;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          chat_id: number;
          created_at: string;
          hidden: boolean;
          id: number;
          is_read: boolean;
          message: string;
          sender_id: string;
          updated_at: string;
        };
        Insert: {
          chat_id: number;
          created_at?: string;
          hidden?: boolean;
          id?: number;
          is_read?: boolean;
          message: string;
          sender_id: string;
          updated_at?: string;
        };
        Update: {
          chat_id?: number;
          created_at?: string;
          hidden?: boolean;
          id?: number;
          is_read?: boolean;
          message?: string;
          sender_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_rooms: {
        Row: {
          buyer_confirmed: boolean;
          buyer_deleted: boolean;
          buyer_id: string;
          created_at: string;
          id: number;
          product_id: number;
          seller_confirmed: boolean;
          seller_deleted: boolean;
          seller_id: string;
          status: Database['public']['Enums']['chat_status'];
          updated_at: string;
        };
        Insert: {
          buyer_confirmed?: boolean;
          buyer_deleted?: boolean;
          buyer_id: string;
          created_at?: string;
          id?: number;
          product_id: number;
          seller_confirmed?: boolean;
          seller_deleted?: boolean;
          seller_id: string;
          status?: Database['public']['Enums']['chat_status'];
          updated_at?: string;
        };
        Update: {
          buyer_confirmed?: boolean;
          buyer_deleted?: boolean;
          buyer_id?: string;
          created_at?: string;
          id?: number;
          product_id?: number;
          seller_confirmed?: boolean;
          seller_deleted?: boolean;
          seller_id?: string;
          status?: Database['public']['Enums']['chat_status'];
          updated_at?: string;
        };
        Relationships: [];
      };
      email_verifications: {
        Row: {
          code: string | null;
          code_expires_at: string | null;
          created_at: string;
          email: string;
          id: number;
          updated_at: string;
          verified: boolean;
          verified_expires_at: string | null;
        };
        Insert: {
          code?: string | null;
          code_expires_at?: string | null;
          created_at?: string;
          email: string;
          id?: number;
          updated_at?: string;
          verified?: boolean;
          verified_expires_at?: string | null;
        };
        Update: {
          code?: string | null;
          code_expires_at?: string | null;
          created_at?: string;
          email?: string;
          id?: number;
          updated_at?: string;
          verified?: boolean;
          verified_expires_at?: string | null;
        };
        Relationships: [];
      };
      product_media: {
        Row: {
          created_at: string;
          id: number;
          media_type: Database['public']['Enums']['product_media_type'];
          media_url: string;
          product_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          media_type: Database['public']['Enums']['product_media_type'];
          media_url: string;
          product_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          media_type?: Database['public']['Enums']['product_media_type'];
          media_url?: string;
          product_id?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category: string;
          created_at: string;
          current_price: number;
          description: string;
          end_time: string;
          id: number;
          seller_id: string;
          start_price: number;
          start_time: string;
          status: Database['public']['Enums']['product_status'];
          title: string;
          updated_at: string;
          winner_id: string | null;
        };
        Insert: {
          category: string;
          created_at?: string;
          current_price: number;
          description: string;
          end_time: string;
          id?: number;
          seller_id: string;
          start_price: number;
          start_time?: string;
          status?: Database['public']['Enums']['product_status'];
          title: string;
          updated_at?: string;
          winner_id?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string;
          current_price?: number;
          description?: string;
          end_time?: string;
          id?: number;
          seller_id?: string;
          start_price?: number;
          start_time?: string;
          status?: Database['public']['Enums']['product_status'];
          title?: string;
          updated_at?: string;
          winner_id?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          reason: Database['public']['Enums']['report_reason'];
          reporter_id: string;
          reviewed_at: string | null;
          status: Database['public']['Enums']['report_status'];
          target_message_id: number | null;
          target_product_id: number | null;
          target_user_id: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          reason: Database['public']['Enums']['report_reason'];
          reporter_id: string;
          reviewed_at?: string | null;
          status?: Database['public']['Enums']['report_status'];
          target_message_id?: number | null;
          target_product_id?: number | null;
          target_user_id?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          reason?: Database['public']['Enums']['report_reason'];
          reporter_id?: string;
          reviewed_at?: string | null;
          status?: Database['public']['Enums']['report_status'];
          target_message_id?: number | null;
          target_product_id?: number | null;
          target_user_id?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          address: string;
          created_at: string;
          email: string;
          id: string;
          name: string;
          profile_image_url: string | null;
          suspended_at: string | null;
          updated_at: string;
          withdrawn_at: string | null;
        };
        Insert: {
          address: string;
          created_at?: string;
          email: string;
          id: string;
          name: string;
          profile_image_url?: string | null;
          suspended_at?: string | null;
          updated_at?: string;
          withdrawn_at?: string | null;
        };
        Update: {
          address?: string;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          profile_image_url?: string | null;
          suspended_at?: string | null;
          updated_at?: string;
          withdrawn_at?: string | null;
        };
        Relationships: [];
      };
      wishes: {
        Row: {
          created_at: string;
          id: number;
          product_id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          product_id: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          product_id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      check_email_available: { Args: { p_email: string }; Returns: boolean };
      check_name_available: { Args: { p_name: string }; Returns: boolean };
      close_auction: { Args: { p_product_id: number }; Returns: undefined };
      close_auction_manual: { Args: { p_product_id: number }; Returns: undefined };
      close_expired_auctions: { Args: never; Returns: number };
      confirm_trade: { Args: { p_chat_id: number }; Returns: undefined };
      delete_chat_room: { Args: { p_chat_id: number }; Returns: undefined };
      enter_chat_room: { Args: { p_chat_id: number }; Returns: number };
      get_product_detail: { Args: { p_product_id: number }; Returns: Json };
      hide_chat_message: { Args: { p_id: number }; Returns: undefined };
      hide_product: { Args: { p_id: number }; Returns: undefined };
      is_blocked: { Args: { p_a: string; p_b: string }; Returns: boolean };
      is_user_active: { Args: { p_uid: string }; Returns: boolean };
      list_my_chats: { Args: never; Returns: Json };
      list_my_wishes: { Args: { p_page?: number; p_size?: number }; Returns: Json };
      list_products: {
        Args: {
          p_category?: string;
          p_keyword?: string;
          p_page?: number;
          p_size?: number;
          p_user_id?: string;
          p_view?: string;
        };
        Returns: Json;
      };
      place_bid: {
        Args: { p_price: number; p_product_id: number };
        Returns: {
          bidder_id: string;
          created_at: string;
          id: number;
          price: number;
          product_id: number;
          status: Database['public']['Enums']['bid_status'];
          updated_at: string;
        };
      };
      resolve_report: {
        Args: { p_id: number; p_status: Database['public']['Enums']['report_status'] };
        Returns: undefined;
      };
      suspend_user: { Args: { p_uid: string }; Returns: undefined };
      unsuspend_user: { Args: { p_uid: string }; Returns: undefined };
    };
    Enums: {
      bid_status: 'ACTIVE' | 'WON';
      chat_status: 'ACTIVE' | 'CLOSED';
      product_media_type: 'IMAGE' | 'VIDEO';
      product_status: 'ON_SALE' | 'ENDED' | 'FAILED' | 'CANCELED' | 'TRADED' | 'HIDDEN';
      report_reason: 'SPAM' | 'ABUSE' | 'FRAUD' | 'INAPPROPRIATE_CONTENT' | 'ETC';
      report_status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
