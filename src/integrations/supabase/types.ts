export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          display_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          status: Database["public"]["Enums"]["user_status"];
          email_verified: boolean;
          phone_verified: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          status?: Database["public"]["Enums"]["user_status"];
          email_verified?: boolean;
          phone_verified?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          status?: Database["public"]["Enums"]["user_status"];
          email_verified?: boolean;
          phone_verified?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
        };
        Relationships: [];
      };
      user_addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string | null;
          full_name: string;
          phone: string | null;
          address_line_1: string;
          address_line_2: string | null;
          city: string;
          state: string | null;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label?: string | null;
          full_name: string;
          phone?: string | null;
          address_line_1: string;
          address_line_2?: string | null;
          city: string;
          state?: string | null;
          postal_code: string;
          country: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string | null;
          full_name?: string;
          phone?: string | null;
          address_line_1?: string;
          address_line_2?: string | null;
          city?: string;
          state?: string | null;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      merchants: {
        Row: {
          id: string;
          owner_user_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          logo_url: string | null;
          logo_public_id: string | null;
          cover_image_url: string | null;
          cover_image_public_id: string | null;
          website_url: string | null;
          instagram_url: string | null;
          email: string | null;
          phone: string | null;
          city: string | null;
          country: string | null;
          status: Database["public"]["Enums"]["merchant_status"];
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          description?: string | null;
          logo_url?: string | null;
          logo_public_id?: string | null;
          cover_image_url?: string | null;
          cover_image_public_id?: string | null;
          website_url?: string | null;
          instagram_url?: string | null;
          email?: string | null;
          phone?: string | null;
          city?: string | null;
          country?: string | null;
          status?: Database["public"]["Enums"]["merchant_status"];
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string | null;
          name?: string;
          slug?: string;
          short_description?: string | null;
          description?: string | null;
          logo_url?: string | null;
          logo_public_id?: string | null;
          cover_image_url?: string | null;
          cover_image_public_id?: string | null;
          website_url?: string | null;
          instagram_url?: string | null;
          email?: string | null;
          phone?: string | null;
          city?: string | null;
          country?: string | null;
          status?: Database["public"]["Enums"]["merchant_status"];
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "merchants_owner_user_id_fkey";
            columns: ["owner_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          logo_public_id: string | null;
          cover_image_url: string | null;
          cover_image_public_id: string | null;
          website_url: string | null;
          country: string | null;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          logo_public_id?: string | null;
          cover_image_url?: string | null;
          cover_image_public_id?: string | null;
          website_url?: string | null;
          country?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          logo_public_id?: string | null;
          cover_image_url?: string | null;
          cover_image_public_id?: string | null;
          website_url?: string | null;
          country?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          parent_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          image_public_id: string | null;
          metadata: Json | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          image_public_id?: string | null;
          metadata?: Json | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          image_public_id?: string | null;
          metadata?: Json | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_types: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          image_public_id: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          image_public_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          image_public_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_types_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          merchant_id: string;
          brand_id: string | null;
          category_id: string | null;
          product_type_id: string | null;
          name: string;
          slug: string;
          sku: string | null;
          short_description: string | null;
          description: string | null;
          original_price: number;
          discounted_price: number | null;
          currency: string;
          condition: Database["public"]["Enums"]["product_condition"];
          condition_notes: string | null;
          materials: string[];
          measurements: Json;
          tags: string[];
          composition: string | null;
          care_instructions: string | null;
          country_of_origin: string | null;
          fit: string | null;
          pattern: string | null;
          neckline: string | null;
          sleeve_length: string | null;
          dress_length: string | null;
          gender: string | null;
          season: string | null;
          external_product_url: string | null;
          status: Database["public"]["Enums"]["product_status"];
          is_featured: boolean;
          is_new_arrival: boolean;
          seo_title: string | null;
          seo_description: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          brand_id?: string | null;
          category_id?: string | null;
          product_type_id?: string | null;
          name: string;
          slug: string;
          sku?: string | null;
          short_description?: string | null;
          description?: string | null;
          original_price: number;
          discounted_price?: number | null;
          currency?: string;
          condition?: Database["public"]["Enums"]["product_condition"];
          condition_notes?: string | null;
          materials?: string[];
          measurements?: Json;
          tags?: string[];
          composition?: string | null;
          care_instructions?: string | null;
          country_of_origin?: string | null;
          fit?: string | null;
          pattern?: string | null;
          neckline?: string | null;
          sleeve_length?: string | null;
          dress_length?: string | null;
          gender?: string | null;
          season?: string | null;
          external_product_url?: string | null;
          status?: Database["public"]["Enums"]["product_status"];
          is_featured?: boolean;
          is_new_arrival?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          brand_id?: string | null;
          category_id?: string | null;
          product_type_id?: string | null;
          name?: string;
          slug?: string;
          sku?: string | null;
          short_description?: string | null;
          description?: string | null;
          original_price?: number;
          discounted_price?: number | null;
          currency?: string;
          condition?: Database["public"]["Enums"]["product_condition"];
          condition_notes?: string | null;
          materials?: string[];
          measurements?: Json;
          tags?: string[];
          composition?: string | null;
          care_instructions?: string | null;
          country_of_origin?: string | null;
          fit?: string | null;
          pattern?: string | null;
          neckline?: string | null;
          sleeve_length?: string | null;
          dress_length?: string | null;
          gender?: string | null;
          season?: string | null;
          external_product_url?: string | null;
          status?: Database["public"]["Enums"]["product_status"];
          is_featured?: boolean;
          is_new_arrival?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_merchant_id_fkey";
            columns: ["merchant_id"];
            isOneToOne: false;
            referencedRelation: "merchants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_product_type_id_fkey";
            columns: ["product_type_id"];
            isOneToOne: false;
            referencedRelation: "product_types";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          color_name: string;
          color_hex: string | null;
          size: string;
          sku: string | null;
          barcode: string | null;
          stock_quantity: number;
          original_price: number | null;
          discounted_price: number | null;
          original_price_override: number | null;
          discounted_price_override: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          color_name: string;
          color_hex?: string | null;
          size: string;
          sku?: string | null;
          barcode?: string | null;
          stock_quantity?: number;
          original_price?: number | null;
          discounted_price?: number | null;
          original_price_override?: number | null;
          discounted_price_override?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          color_name?: string;
          color_hex?: string | null;
          size?: string;
          sku?: string | null;
          barcode?: string | null;
          stock_quantity?: number;
          original_price?: number | null;
          discounted_price?: number | null;
          original_price_override?: number | null;
          discounted_price_override?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          color_name: string | null;
          image_url: string;
          image_public_id: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          color_name?: string | null;
          image_url: string;
          image_public_id: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          color_name?: string | null;
          image_url?: string;
          image_public_id?: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          status: Database["public"]["Enums"]["cart_status"];
          currency: string;
          created_at: string;
          updated_at: string;
          converted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: Database["public"]["Enums"]["cart_status"];
          currency?: string;
          created_at?: string;
          updated_at?: string;
          converted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: Database["public"]["Enums"]["cart_status"];
          currency?: string;
          created_at?: string;
          updated_at?: string;
          converted_at?: string | null;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          variant_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          variant_id: string;
          quantity?: number;
          unit_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cart_id?: string;
          product_id?: string;
          variant_id?: string;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey";
            columns: ["cart_id"];
            isOneToOne: false;
            referencedRelation: "carts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          id: string;
          wishlist_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wishlist_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wishlist_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey";
            columns: ["wishlist_id"];
            isOneToOne: false;
            referencedRelation: "wishlists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          reference: string;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number;
          shipping_cents: number;
          total_cents: number;
          shipping_name: string;
          shipping_email: string;
          shipping_address: string;
          shipping_city: string;
          shipping_postcode: string;
          shipping_country: string;
          shipping_method: string;
          gift_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reference: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents?: number;
          shipping_cents?: number;
          total_cents?: number;
          shipping_name: string;
          shipping_email: string;
          shipping_address: string;
          shipping_city: string;
          shipping_postcode: string;
          shipping_country?: string;
          shipping_method?: string;
          gift_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reference?: string;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents?: number;
          shipping_cents?: number;
          total_cents?: number;
          shipping_name?: string;
          shipping_email?: string;
          shipping_address?: string;
          shipping_city?: string;
          shipping_postcode?: string;
          shipping_country?: string;
          shipping_method?: string;
          gift_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          merchant_name: string | null;
          brand_name: string | null;
          selected_color: string | null;
          selected_size: string | null;
          product_sku: string | null;
          variant_sku: string | null;
          image_url: string | null;
          unit_price_cents: number;
          quantity: number;
          line_total_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          merchant_name?: string | null;
          brand_name?: string | null;
          selected_color?: string | null;
          selected_size?: string | null;
          product_sku?: string | null;
          variant_sku?: string | null;
          image_url?: string | null;
          unit_price_cents: number;
          quantity?: number;
          line_total_cents: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          merchant_name?: string | null;
          brand_name?: string | null;
          selected_color?: string | null;
          selected_size?: string | null;
          product_sku?: string | null;
          variant_sku?: string | null;
          image_url?: string | null;
          unit_price_cents?: number;
          quantity?: number;
          line_total_cents?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      sales: {
        Row: {
          id: string;
          merchant_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          banner_image_url: string | null;
          banner_image_public_id: string | null;
          mobile_banner_image_url: string | null;
          mobile_banner_image_public_id: string | null;
          starts_at: string | null;
          ends_at: string | null;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          banner_image_url?: string | null;
          banner_image_public_id?: string | null;
          mobile_banner_image_url?: string | null;
          mobile_banner_image_public_id?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          banner_image_url?: string | null;
          banner_image_public_id?: string | null;
          mobile_banner_image_url?: string | null;
          mobile_banner_image_public_id?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sale_products: {
        Row: {
          sale_id: string;
          product_id: string;
          display_order: number;
          discount_type: Database["public"]["Enums"]["sale_discount_type"] | null;
          discount_value: number | null;
          discount_base: Database["public"]["Enums"]["sale_discount_base"];
          original_price_snapshot: number | null;
          current_price_snapshot: number | null;
          sale_price: number | null;
          is_manually_overridden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          sale_id: string;
          product_id: string;
          display_order?: number;
          discount_type?: Database["public"]["Enums"]["sale_discount_type"] | null;
          discount_value?: number | null;
          discount_base?: Database["public"]["Enums"]["sale_discount_base"];
          original_price_snapshot?: number | null;
          current_price_snapshot?: number | null;
          sale_price?: number | null;
          is_manually_overridden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          sale_id?: string;
          product_id?: string;
          display_order?: number;
          discount_type?: Database["public"]["Enums"]["sale_discount_type"] | null;
          discount_value?: number | null;
          discount_base?: Database["public"]["Enums"]["sale_discount_base"];
          original_price_snapshot?: number | null;
          current_price_snapshot?: number | null;
          sale_price?: number | null;
          is_manually_overridden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sale_products_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      curated_pages: {
        Row: {
          id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          description: string | null;
          hero_image_url: string | null;
          hero_image_public_id: string | null;
          mobile_hero_image_url: string | null;
          mobile_hero_image_public_id: string | null;
          status: Database["public"]["Enums"]["content_status"];
          seo_title: string | null;
          seo_description: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          subtitle?: string | null;
          description?: string | null;
          hero_image_url?: string | null;
          hero_image_public_id?: string | null;
          mobile_hero_image_url?: string | null;
          mobile_hero_image_public_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          subtitle?: string | null;
          description?: string | null;
          hero_image_url?: string | null;
          hero_image_public_id?: string | null;
          mobile_hero_image_url?: string | null;
          mobile_hero_image_public_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      curated_page_products: {
        Row: {
          id: string;
          curated_page_id: string;
          product_id: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          curated_page_id: string;
          product_id: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          curated_page_id?: string;
          product_id?: string;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curated_page_products_curated_page_id_fkey";
            columns: ["curated_page_id"];
            isOneToOne: false;
            referencedRelation: "curated_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "curated_page_products_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_posts: {
        Row: {
          id: string;
          author_id: string | null;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image_url: string | null;
          featured_image_public_id: string | null;
          tags: string[];
          status: Database["public"]["Enums"]["content_status"];
          is_featured: boolean;
          seo_title: string | null;
          seo_description: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          slug: string;
          excerpt?: string | null;
          content: string;
          featured_image_url?: string | null;
          featured_image_public_id?: string | null;
          tags?: string[];
          status?: Database["public"]["Enums"]["content_status"];
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string | null;
          title?: string;
          slug?: string;
          excerpt?: string | null;
          content?: string;
          featured_image_url?: string | null;
          featured_image_public_id?: string | null;
          tags?: string[];
          status?: Database["public"]["Enums"]["content_status"];
          is_featured?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      has_role: {
        Args: {
          _user_id: string;
          _role: Database["public"]["Enums"]["user_role"];
        };
        Returns: boolean;
      };
      is_staff: {
        Args: {
          _user_id: string;
        };
        Returns: boolean;
      };
      owns_merchant: {
        Args: {
          _user_id: string;
          _merchant_id: string;
        };
        Returns: boolean;
      };
      can_edit_product: {
        Args: {
          _user_id: string;
          _product_id: string;
        };
        Returns: boolean;
      };
      owns_cart: {
        Args: {
          _user_id: string;
          _cart_id: string;
        };
        Returns: boolean;
      };
      owns_wishlist: {
        Args: {
          _user_id: string;
          _wishlist_id: string;
        };
        Returns: boolean;
      };
      duplicate_curated_page: {
        Args: {
          _page_id: string;
        };
        Returns: string;
      };
      save_sale_with_products: {
        Args: { p_sale: unknown; p_products: unknown };
        Returns: string;
      };
    };
    Enums: {
      user_role: "customer" | "merchant" | "admin" | "editor";
      user_status: "active" | "suspended" | "deleted";
      merchant_status: "pending" | "approved" | "rejected" | "suspended";
      product_status: "draft" | "published" | "archived" | "sold_out";
      product_condition:
        "new" | "new_with_tags" | "new_without_tags" | "excellent" | "very_good" | "good" | "fair";
      cart_status: "active" | "converted" | "abandoned";
      content_status: "draft" | "published" | "archived";
      order_status: "confirmed" | "preparing" | "in_transit" | "delivered" | "cancelled";
      sale_discount_type: "percentage" | "fixed_amount" | "final_price";
      sale_discount_base: "original_price" | "current_price";
    };
    CompositeTypes: {};
  };
};
