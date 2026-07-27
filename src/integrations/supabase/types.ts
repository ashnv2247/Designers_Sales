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
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_products: {
        Row: {
          blog_post_id: string
          display_order: number
          product_id: string
        }
        Insert: {
          blog_post_id: string
          display_order?: number
          product_id: string
        }
        Update: {
          blog_post_id?: string
          display_order?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_products_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          blog_post_id: string
          tag_id: string
        }
        Insert: {
          blog_post_id: string
          tag_id: string
        }
        Update: {
          blog_post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          country: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          quantity: number
          selected_size: string
          unit_price: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          quantity?: number
          selected_size: string
          unit_price: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          quantity?: number
          selected_size?: string
          unit_price?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          converted_at: string | null
          created_at: string
          currency: string
          id: string
          status: Database["public"]["Enums"]["cart_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      colors: {
        Row: {
          created_at: string
          hex_code: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          hex_code?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          hex_code?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      curated_pages: {
        Row: {
          created_at: string
          description: string | null
          hero_image_url: string | null
          id: string
          mobile_hero_image_url: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hero_image_url?: string | null
          id?: string
          mobile_hero_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hero_image_url?: string | null
          id?: string
          mobile_hero_image_url?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      curated_section_blog_posts: {
        Row: {
          blog_post_id: string
          display_order: number
          section_id: string
        }
        Insert: {
          blog_post_id: string
          display_order?: number
          section_id: string
        }
        Update: {
          blog_post_id?: string
          display_order?: number
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_section_blog_posts_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_section_blog_posts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "curated_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_section_categories: {
        Row: {
          category_id: string
          custom_image_url: string | null
          custom_title: string | null
          display_order: number
          section_id: string
        }
        Insert: {
          category_id: string
          custom_image_url?: string | null
          custom_title?: string | null
          display_order?: number
          section_id: string
        }
        Update: {
          category_id?: string
          custom_image_url?: string | null
          custom_title?: string | null
          display_order?: number
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_section_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_section_categories_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "curated_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_section_merchants: {
        Row: {
          display_order: number
          merchant_id: string
          section_id: string
        }
        Insert: {
          display_order?: number
          merchant_id: string
          section_id: string
        }
        Update: {
          display_order?: number
          merchant_id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_section_merchants_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_section_merchants_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "curated_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_section_products: {
        Row: {
          display_order: number
          product_id: string
          section_id: string
        }
        Insert: {
          display_order?: number
          product_id: string
          section_id: string
        }
        Update: {
          display_order?: number
          product_id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_section_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_section_products_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "curated_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_section_sales: {
        Row: {
          display_order: number
          sale_id: string
          section_id: string
        }
        Insert: {
          display_order?: number
          sale_id: string
          section_id: string
        }
        Update: {
          display_order?: number
          sale_id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_section_sales_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curated_section_sales_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "curated_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_sections: {
        Row: {
          content: string | null
          created_at: string
          curated_page_id: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          link_label: string | null
          link_url: string | null
          mobile_image_url: string | null
          section_type: Database["public"]["Enums"]["curated_section_type"]
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          curated_page_id: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          mobile_image_url?: string | null
          section_type: Database["public"]["Enums"]["curated_section_type"]
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          curated_page_id?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_label?: string | null
          link_url?: string | null
          mobile_image_url?: string | null
          section_type?: Database["public"]["Enums"]["curated_section_type"]
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_sections_curated_page_id_fkey"
            columns: ["curated_page_id"]
            isOneToOne: false
            referencedRelation: "curated_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      merchants: {
        Row: {
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          instagram_url: string | null
          is_active: boolean
          is_featured: boolean
          logo_url: string | null
          name: string
          owner_user_id: string | null
          phone: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["merchant_status"]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name: string
          owner_user_id?: string | null
          phone?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["merchant_status"]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["merchant_status"]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          colour: string | null
          created_at: string
          designer: string
          id: string
          image: string | null
          name: string
          order_id: string
          product_id: string
          quantity: number
          size: string | null
          unit_price_cents: number
          user_id: string
        }
        Insert: {
          colour?: string | null
          created_at?: string
          designer: string
          id?: string
          image?: string | null
          name: string
          order_id: string
          product_id: string
          quantity?: number
          size?: string | null
          unit_price_cents: number
          user_id: string
        }
        Update: {
          colour?: string | null
          created_at?: string
          designer?: string
          id?: string
          image?: string | null
          name?: string
          order_id?: string
          product_id?: string
          quantity?: number
          size?: string | null
          unit_price_cents?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          gift_note: string | null
          id: string
          reference: string
          shipping_address: string
          shipping_cents: number
          shipping_city: string
          shipping_country: string
          shipping_email: string
          shipping_method: string
          shipping_name: string
          shipping_postcode: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gift_note?: string | null
          id?: string
          reference: string
          shipping_address: string
          shipping_cents?: number
          shipping_city: string
          shipping_country?: string
          shipping_email: string
          shipping_method?: string
          shipping_name: string
          shipping_postcode: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gift_note?: string | null
          id?: string
          reference?: string
          shipping_address?: string
          shipping_cents?: number
          shipping_city?: string
          shipping_country?: string
          shipping_email?: string
          shipping_method?: string
          shipping_name?: string
          shipping_postcode?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          product_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          product_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_materials: {
        Row: {
          component: string | null
          created_at: string
          id: string
          material_id: string
          percentage: number | null
          product_id: string
        }
        Insert: {
          component?: string | null
          created_at?: string
          id?: string
          material_id: string
          percentage?: number | null
          product_id: string
        }
        Update: {
          component?: string | null
          created_at?: string
          id?: string
          material_id?: string
          percentage?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_measurements: {
        Row: {
          created_at: string
          id: string
          measurement_name: string
          measurement_value: number
          product_id: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          measurement_name: string
          measurement_value: number
          product_id: string
          unit?: string
        }
        Update: {
          created_at?: string
          id?: string
          measurement_name?: string
          measurement_value?: number
          product_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_measurements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_primary: boolean
          variant_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_primary?: boolean
          variant_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_primary?: boolean
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_id: string | null
          created_at: string
          currency: string
          discounted_price: number | null
          external_product_url: string | null
          id: string
          is_available: boolean
          is_default: boolean
          name: string | null
          original_price: number
          product_id: string
          sizes: string[]
          sku: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          color_id?: string | null
          created_at?: string
          currency?: string
          discounted_price?: number | null
          external_product_url?: string | null
          id?: string
          is_available?: boolean
          is_default?: boolean
          name?: string | null
          original_price: number
          product_id: string
          sizes?: string[]
          sku: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          color_id?: string | null
          created_at?: string
          currency?: string
          discounted_price?: number | null
          external_product_url?: string | null
          id?: string
          is_available?: boolean
          is_default?: boolean
          name?: string | null
          original_price?: number
          product_id?: string
          sizes?: string[]
          sku?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
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
          brand_id: string | null
          care_instructions: string | null
          category_id: string | null
          composition: string | null
          condition: Database["public"]["Enums"]["product_condition"]
          condition_notes: string | null
          country_of_origin: string | null
          created_at: string
          description: string | null
          dress_length: string | null
          fit: string | null
          gender: string | null
          id: string
          is_featured: boolean
          is_new_arrival: boolean
          merchant_id: string
          model_height_cm: number | null
          model_wears_size: string | null
          name: string
          neckline: string | null
          pattern: string | null
          product_type_id: string | null
          published_at: string | null
          season: string | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sleeve_length: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          care_instructions?: string | null
          category_id?: string | null
          composition?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          condition_notes?: string | null
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          dress_length?: string | null
          fit?: string | null
          gender?: string | null
          id?: string
          is_featured?: boolean
          is_new_arrival?: boolean
          merchant_id: string
          model_height_cm?: number | null
          model_wears_size?: string | null
          name: string
          neckline?: string | null
          pattern?: string | null
          product_type_id?: string | null
          published_at?: string | null
          season?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sleeve_length?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          care_instructions?: string | null
          category_id?: string | null
          composition?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          condition_notes?: string | null
          country_of_origin?: string | null
          created_at?: string
          description?: string | null
          dress_length?: string | null
          fit?: string | null
          gender?: string | null
          id?: string
          is_featured?: boolean
          is_new_arrival?: boolean
          merchant_id?: string
          model_height_cm?: number | null
          model_wears_size?: string | null
          name?: string
          neckline?: string | null
          pattern?: string | null
          product_type_id?: string | null
          published_at?: string | null
          season?: string | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sleeve_length?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
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
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      sale_variants: {
        Row: {
          display_order: number
          sale_id: string
          variant_id: string
        }
        Insert: {
          display_order?: number
          sale_id: string
          variant_id: string
        }
        Update: {
          display_order?: number
          sale_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_variants_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_variants_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          banner_image_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          merchant_id: string | null
          mobile_banner_image_url: string | null
          name: string
          slug: string
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          merchant_id?: string | null
          mobile_banner_image_url?: string | null
          name: string
          slug: string
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          merchant_id?: string | null
          mobile_banner_image_url?: string | null
          name?: string
          slug?: string
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          phone: string | null
          postal_code: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          email_verified: boolean
          first_name: string | null
          id: string
          last_login_at: string | null
          last_name: string | null
          phone: string | null
          phone_verified: boolean
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean
          first_name?: string | null
          id: string
          last_login_at?: string | null
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_verified?: boolean
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          phone?: string | null
          phone_verified?: boolean
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          preferred_variant_id: string | null
          product_id: string
          wishlist_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferred_variant_id?: string | null
          product_id: string
          wishlist_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferred_variant_id?: string | null
          product_id?: string
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_preferred_variant_id_fkey"
            columns: ["preferred_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            isOneToOne: false
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_product: {
        Args: { _product_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      owns_cart: {
        Args: { _cart_id: string; _user_id: string }
        Returns: boolean
      }
      owns_merchant: {
        Args: { _merchant_id: string; _user_id: string }
        Returns: boolean
      }
      owns_wishlist: {
        Args: { _user_id: string; _wishlist_id: string }
        Returns: boolean
      }
    }
    Enums: {
      cart_status: "active" | "converted" | "abandoned"
      content_status: "draft" | "published" | "archived"
      curated_section_type:
        | "hero"
        | "products"
        | "sales"
        | "merchants"
        | "categories"
        | "editorial"
        | "banner"
        | "blog_posts"
      merchant_status: "pending" | "approved" | "rejected" | "suspended"
      order_status:
        | "confirmed"
        | "preparing"
        | "in_transit"
        | "delivered"
        | "cancelled"
      product_condition:
        | "new"
        | "new_with_tags"
        | "new_without_tags"
        | "excellent"
        | "very_good"
        | "good"
        | "fair"
      product_status: "draft" | "published" | "archived" | "sold_out"
      user_role: "customer" | "merchant" | "admin" | "editor"
      user_status: "active" | "suspended" | "deleted"
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
      cart_status: ["active", "converted", "abandoned"],
      content_status: ["draft", "published", "archived"],
      curated_section_type: [
        "hero",
        "products",
        "sales",
        "merchants",
        "categories",
        "editorial",
        "banner",
        "blog_posts",
      ],
      merchant_status: ["pending", "approved", "rejected", "suspended"],
      order_status: [
        "confirmed",
        "preparing",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      product_condition: [
        "new",
        "new_with_tags",
        "new_without_tags",
        "excellent",
        "very_good",
        "good",
        "fair",
      ],
      product_status: ["draft", "published", "archived", "sold_out"],
      user_role: ["customer", "merchant", "admin", "editor"],
      user_status: ["active", "suspended", "deleted"],
    },
  },
} as const
