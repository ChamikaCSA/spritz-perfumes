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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          district: string
          first_name: string
          id: string
          is_default: boolean
          label: string
          last_name: string
          phone: string
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          district: string
          first_name: string
          id?: string
          is_default?: boolean
          label?: string
          last_name: string
          phone: string
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          district?: string
          first_name?: string
          id?: string
          is_default?: boolean
          label?: string
          last_name?: string
          phone?: string
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          banner_url: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          website: string | null
        }
        Insert: {
          banner_url?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          website?: string | null
        }
        Update: {
          banner_url?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          website?: string | null
        }
        Relationships: []
      }
      inventory_events: {
        Row: {
          created_at: string
          created_by: string | null
          delta_ml: number
          id: string
          kind: Database["public"]["Enums"]["inventory_event_kind"]
          lot_id: string | null
          note: string | null
          product_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delta_ml?: number
          id?: string
          kind: Database["public"]["Enums"]["inventory_event_kind"]
          lot_id?: string | null
          note?: string | null
          product_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delta_ml?: number
          id?: string
          kind?: Database["public"]["Enums"]["inventory_event_kind"]
          lot_id?: string | null
          note?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_events_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_lots: {
        Row: {
          cost_lkr: number | null
          fill_ml: number
          id: string
          notes: string | null
          product_id: string
          received_at: string
          remaining_ml: number
          status: Database["public"]["Enums"]["lot_status"]
          updated_at: string
        }
        Insert: {
          cost_lkr?: number | null
          fill_ml: number
          id?: string
          notes?: string | null
          product_id: string
          received_at?: string
          remaining_ml: number
          status?: Database["public"]["Enums"]["lot_status"]
          updated_at?: string
        }
        Update: {
          cost_lkr?: number | null
          fill_ml?: number
          id?: string
          notes?: string | null
          product_id?: string
          received_at?: string
          remaining_ml?: number
          status?: Database["public"]["Enums"]["lot_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          brand_name: string
          id: string
          line_total_lkr: number
          order_id: string
          product_name: string
          quantity: number
          size_ml: number
          sku: string
          unit_price_lkr: number
          variant_id: string | null
          variant_type: Database["public"]["Enums"]["variant_type"]
        }
        Insert: {
          brand_name: string
          id?: string
          line_total_lkr: number
          order_id: string
          product_name: string
          quantity: number
          size_ml: number
          sku: string
          unit_price_lkr: number
          variant_id?: string | null
          variant_type: Database["public"]["Enums"]["variant_type"]
        }
        Update: {
          brand_name?: string
          id?: string
          line_total_lkr?: number
          order_id?: string
          product_name?: string
          quantity?: number
          size_ml?: number
          sku?: string
          unit_price_lkr?: number
          variant_id?: string | null
          variant_type?: Database["public"]["Enums"]["variant_type"]
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          district: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          order_number: string
          phone: string
          postal_code: string | null
          shipped_at: string | null
          shipping_lkr: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal_lkr: number
          total_lkr: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          district: string
          email: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          order_number: string
          phone: string
          postal_code?: string | null
          shipped_at?: string | null
          shipping_lkr?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_lkr: number
          total_lkr: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          district?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          order_number?: string
          phone?: string
          postal_code?: string | null
          shipped_at?: string | null
          shipping_lkr?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_lkr?: number
          total_lkr?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_lkr: number
          created_at: string
          currency: string
          id: string
          method: string | null
          order_id: string
          payhere_order_id: string
          payhere_payment_id: string | null
          raw_notify: Json | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_lkr: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          order_id: string
          payhere_order_id: string
          payhere_payment_id?: string | null
          raw_notify?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_lkr?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          order_id?: string
          payhere_order_id?: string
          payhere_payment_id?: string | null
          raw_notify?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          compare_at_price_lkr: number | null
          created_at: string
          id: string
          is_active: boolean
          price_lkr: number
          product_id: string
          size_ml: number
          sku: string
          type: Database["public"]["Enums"]["variant_type"]
        }
        Insert: {
          compare_at_price_lkr?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          price_lkr: number
          product_id: string
          size_ml: number
          sku: string
          type: Database["public"]["Enums"]["variant_type"]
        }
        Update: {
          compare_at_price_lkr?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          price_lkr?: number
          product_id?: string
          size_ml?: number
          sku?: string
          type?: Database["public"]["Enums"]["variant_type"]
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          collection: Database["public"]["Enums"]["product_collection"]
          concentration: Database["public"]["Enums"]["concentration"]
          country_of_origin: string | null
          created_at: string
          description: string | null
          gender: Database["public"]["Enums"]["product_gender"] | null
          id: string
          images: string[]
          inspired_by: string | null
          is_active: boolean
          longevity: string | null
          name: string
          notes: Json
          occasion: string | null
          perfumers: string[]
          projection: string | null
          search_vector: unknown
          season: string | null
          slug: string
          updated_at: string
          year_released: number | null
        }
        Insert: {
          brand_id: string
          collection?: Database["public"]["Enums"]["product_collection"]
          concentration?: Database["public"]["Enums"]["concentration"]
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          gender?: Database["public"]["Enums"]["product_gender"] | null
          id?: string
          images?: string[]
          inspired_by?: string | null
          is_active?: boolean
          longevity?: string | null
          name: string
          notes?: Json
          occasion?: string | null
          perfumers?: string[]
          projection?: string | null
          search_vector?: unknown
          season?: string | null
          slug: string
          updated_at?: string
          year_released?: number | null
        }
        Update: {
          brand_id?: string
          collection?: Database["public"]["Enums"]["product_collection"]
          concentration?: Database["public"]["Enums"]["concentration"]
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          gender?: Database["public"]["Enums"]["product_gender"] | null
          id?: string
          images?: string[]
          inspired_by?: string | null
          is_active?: boolean
          longevity?: string | null
          name?: string
          notes?: Json
          occasion?: string | null
          perfumers?: string[]
          projection?: string | null
          search_vector?: unknown
          season?: string | null
          slug?: string
          updated_at?: string
          year_released?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      return_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          order_id: string
          reason: string
          status: Database["public"]["Enums"]["return_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          order_id: string
          reason: string
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          order_id?: string
          reason?: string
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_approved: boolean
          longevity_score: number | null
          packaging_score: number | null
          product_id: string
          projection_score: number | null
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          value_score: number | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          longevity_score?: number | null
          packaging_score?: number | null
          product_id: string
          projection_score?: number | null
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          value_score?: number | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          longevity_score?: number | null
          packaging_score?: number | null
          product_id?: string
          projection_score?: number | null
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          value_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      product_rating_summary: {
        Row: {
          avg_rating: number | null
          product_id: string | null
          review_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sales_summary: {
        Row: {
          product_id: string | null
          units_sold: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      fulfill_order_inventory: {
        Args: { p_order_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      open_lot_for_decanting: {
        Args: { lot_id: string }
        Returns: {
          cost_lkr: number | null
          fill_ml: number
          id: string
          notes: string | null
          product_id: string
          received_at: string
          remaining_ml: number
          status: Database["public"]["Enums"]["lot_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "inventory_lots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      product_stock_summary: { Args: { p_product_id: string }; Returns: Json }
      user_has_purchased_product: {
        Args: { p_product_id: string; p_user_id?: string }
        Returns: boolean
      }
      variant_is_purchasable: {
        Args: { p_variant_id: string }
        Returns: boolean
      }
    }
    Enums: {
      concentration: "EDT" | "EDP" | "Parfum" | "Extrait" | "EDC" | "Other"
      inventory_event_kind:
        | "receive"
        | "open"
        | "adjust"
        | "loss"
        | "sample"
        | "sale"
      lot_status: "sealed" | "open" | "depleted"
      order_status:
        | "pending_payment"
        | "paid"
        | "packing"
        | "shipped"
        | "cancelled"
        | "delivered"
        | "returned"
        | "refunded"
      payment_status: "pending" | "success" | "failed" | "chargedback"
      product_collection: "core" | "gift_set" | "new" | "sale" | "limited"
      product_gender: "women" | "men" | "unisex"
      return_status: "pending" | "approved" | "rejected" | "refunded"
      user_role: "customer" | "admin"
      variant_type: "full_size" | "decant"
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
      concentration: ["EDT", "EDP", "Parfum", "Extrait", "EDC", "Other"],
      inventory_event_kind: [
        "receive",
        "open",
        "adjust",
        "loss",
        "sample",
        "sale",
      ],
      lot_status: ["sealed", "open", "depleted"],
      order_status: [
        "pending_payment",
        "paid",
        "packing",
        "shipped",
        "cancelled",
        "delivered",
        "returned",
        "refunded",
      ],
      payment_status: ["pending", "success", "failed", "chargedback"],
      product_collection: ["core", "gift_set", "new", "sale", "limited"],
      product_gender: ["women", "men", "unisex"],
      return_status: ["pending", "approved", "rejected", "refunded"],
      user_role: ["customer", "admin"],
      variant_type: ["full_size", "decant"],
    },
  },
} as const
