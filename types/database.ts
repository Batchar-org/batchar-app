export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bids: {
        Row: {
          bidder_id: string
          created_at: string
          id: number
          price: number
          product_id: number
          status: Database["public"]["Enums"]["bid_status"]
          updated_at: string
        }
        Insert: {
          bidder_id: string
          created_at?: string
          id?: number
          price: number
          product_id: number
          status?: Database["public"]["Enums"]["bid_status"]
          updated_at?: string
        }
        Update: {
          bidder_id?: string
          created_at?: string
          id?: number
          price?: number
          product_id?: number
          status?: Database["public"]["Enums"]["bid_status"]
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "bids_bidder_id_fkey"; columns: ["bidder_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "bids_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ]
      }
      chat_messages: {
        Row: {
          chat_id: number
          created_at: string
          id: number
          is_read: boolean
          message: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          id?: number
          is_read?: boolean
          message: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          id?: number
          is_read?: boolean
          message?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "chat_messages_chat_id_fkey"; columns: ["chat_id"]; isOneToOne: false; referencedRelation: "chat_rooms"; referencedColumns: ["id"] },
          { foreignKeyName: "chat_messages_sender_id_fkey"; columns: ["sender_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
      chat_rooms: {
        Row: {
          buyer_confirmed: boolean
          buyer_deleted: boolean
          buyer_id: string
          created_at: string
          id: number
          product_id: number
          seller_confirmed: boolean
          seller_deleted: boolean
          seller_id: string
          status: Database["public"]["Enums"]["chat_status"]
          updated_at: string
        }
        Insert: {
          buyer_confirmed?: boolean
          buyer_deleted?: boolean
          buyer_id: string
          created_at?: string
          id?: number
          product_id: number
          seller_confirmed?: boolean
          seller_deleted?: boolean
          seller_id: string
          status?: Database["public"]["Enums"]["chat_status"]
          updated_at?: string
        }
        Update: {
          buyer_confirmed?: boolean
          buyer_deleted?: boolean
          buyer_id?: string
          created_at?: string
          id?: number
          product_id?: number
          seller_confirmed?: boolean
          seller_deleted?: boolean
          seller_id?: string
          status?: Database["public"]["Enums"]["chat_status"]
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "chat_rooms_buyer_id_fkey"; columns: ["buyer_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "chat_rooms_product_id_fkey"; columns: ["product_id"]; isOneToOne: true; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "chat_rooms_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
      email_verifications: {
        Row: {
          code: string | null
          code_expires_at: string | null
          created_at: string
          email: string
          id: number
          updated_at: string
          verified: boolean
          verified_expires_at: string | null
        }
        Insert: {
          code?: string | null
          code_expires_at?: string | null
          created_at?: string
          email: string
          id?: number
          updated_at?: string
          verified?: boolean
          verified_expires_at?: string | null
        }
        Update: {
          code?: string | null
          code_expires_at?: string | null
          created_at?: string
          email?: string
          id?: number
          updated_at?: string
          verified?: boolean
          verified_expires_at?: string | null
        }
        Relationships: []
      }
      product_media: {
        Row: {
          created_at: string
          id: number
          media_type: Database["public"]["Enums"]["product_media_type"]
          media_url: string
          product_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          media_type: Database["public"]["Enums"]["product_media_type"]
          media_url: string
          product_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          media_type?: Database["public"]["Enums"]["product_media_type"]
          media_url?: string
          product_id?: number
          updated_at?: string
        }
        Relationships: [
          { foreignKeyName: "product_media_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          current_price: number
          description: string
          end_time: string
          id: number
          seller_id: string
          start_price: number
          start_time: string
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          current_price: number
          description: string
          end_time: string
          id?: number
          seller_id: string
          start_price: number
          start_time?: string
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          current_price?: number
          description?: string
          end_time?: string
          id?: number
          seller_id?: string
          start_price?: number
          start_time?: string
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          { foreignKeyName: "products_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
          { foreignKeyName: "products_winner_id_fkey"; columns: ["winner_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
      users: {
        Row: {
          address: string
          created_at: string
          email: string
          id: string
          name: string
          profile_image_url: string | null
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          address: string
          created_at?: string
          email: string
          id: string
          name: string
          profile_image_url?: string | null
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          profile_image_url?: string | null
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: []
      }
      wishes: {
        Row: {
          created_at: string
          id: number
          product_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          product_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          product_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          { foreignKeyName: "wishes_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "wishes_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"] },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      check_email_available: { Args: { p_email: string }; Returns: boolean }
      check_name_available: { Args: { p_name: string }; Returns: boolean }
      close_auction: { Args: { p_product_id: number }; Returns: undefined }
      close_auction_manual: { Args: { p_product_id: number }; Returns: undefined }
      close_expired_auctions: { Args: never; Returns: number }
      confirm_trade: { Args: { p_chat_id: number }; Returns: undefined }
      delete_chat_room: { Args: { p_chat_id: number }; Returns: undefined }
      enter_chat_room: { Args: { p_chat_id: number }; Returns: number }
      get_product_detail: { Args: { p_product_id: number }; Returns: Json }
      list_my_chats: { Args: never; Returns: Json }
      list_my_wishes: { Args: { p_page?: number; p_size?: number }; Returns: Json }
      list_products: {
        Args: {
          p_category?: string
          p_keyword?: string
          p_page?: number
          p_size?: number
          p_user_id?: string
          p_view?: string
        }
        Returns: Json
      }
      place_bid: {
        Args: { p_price: number; p_product_id: number }
        Returns: {
          bidder_id: string
          created_at: string
          id: number
          price: number
          product_id: number
          status: Database["public"]["Enums"]["bid_status"]
          updated_at: string
        }
      }
    }
    Enums: {
      bid_status: "ACTIVE" | "WON"
      chat_status: "ACTIVE" | "CLOSED"
      product_media_type: "IMAGE" | "VIDEO"
      product_status: "ON_SALE" | "ENDED" | "FAILED" | "CANCELED" | "TRADED"
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
