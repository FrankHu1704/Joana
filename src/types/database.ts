export type Category = {
  id: string
  slug: string
  name: string
  icon: string | null
  sort_order: number
  created_at: string
}

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  promo_price: number | null
  category_id: string | null
  images: string[]
  is_promotion: boolean
  is_featured: boolean
  is_new: boolean
  is_active: boolean
  views_count: number
  sales_count: number
  created_at: string
  updated_at: string
}

export type ProductWithCategory = Product & { category: Category | null }

export type StoreAdmin = {
  user_id: string
  full_name: string
  created_at: string
}

export type VisitorSession = {
  session_id: string
  first_seen: string
  last_seen: string
  visit_count: number
  user_agent: string | null
}

export type PageView = {
  id: string
  session_id: string
  path: string
  product_id: string | null
  category_id: string | null
  referrer: string | null
  created_at: string
}

export type Coupon = {
  id: string
  code: string
  discount_percent: number
  discount_amount: number
  valid_until: string | null
  max_uses: number | null
  used_count: number
  is_active: boolean
  created_at: string
}

export type PushSubscriptionRow = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

export type OrderItem = { product_id: string; name: string; quantity: number; unit_price: number }

export type Order = {
  id: string
  items: OrderItem[]
  customer_name: string
  customer_phone: string
  customer_email: string | null
  coupon_code: string | null
  subtotal: number
  discount: number
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'cancelled'
  provider: string
  provider_transaction_id: string | null
  payment_url: string | null
  created_at: string
  updated_at: string
}

export type AdminStats = {
  total_visitors: number
  visitors_today: number
  total_products: number
  active_products: number
  views_today: number
  total_sales: number
}

// Minimal Supabase Database type used for typing the client — Row types are
// plain `type` aliases (not `interface`) so they structurally satisfy
// @supabase/postgrest-js's GenericTable (Row extends Record<string, unknown>).
type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>, Rel extends Relationship[] = []> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: Rel
}

export type Database = {
  public: {
    Tables: {
      store_categories: Table<Category>
      store_products: Table<
        Product,
        Partial<Product>,
        Partial<Product>,
        [{ foreignKeyName: 'store_products_category_id_fkey'; columns: ['category_id']; isOneToOne: false; referencedRelation: 'store_categories'; referencedColumns: ['id'] }]
      >
      store_admins: Table<StoreAdmin>
      store_visitor_sessions: Table<VisitorSession>
      store_page_views: Table<
        PageView,
        Partial<PageView>,
        Partial<PageView>,
        [
          { foreignKeyName: 'store_page_views_category_id_fkey'; columns: ['category_id']; isOneToOne: false; referencedRelation: 'store_categories'; referencedColumns: ['id'] },
          { foreignKeyName: 'store_page_views_product_id_fkey'; columns: ['product_id']; isOneToOne: false; referencedRelation: 'store_products'; referencedColumns: ['id'] },
          { foreignKeyName: 'store_page_views_session_id_fkey'; columns: ['session_id']; isOneToOne: false; referencedRelation: 'store_visitor_sessions'; referencedColumns: ['session_id'] }
        ]
      >
      store_coupons: Table<Coupon>
      store_push_subscriptions: Table<PushSubscriptionRow>
      store_orders: Table<Order, Partial<Order>, Partial<Order>>
    }
    Views: Record<string, never>
    Functions: {
      store_is_admin: { Args: Record<string, never>; Returns: boolean }
      store_track_view: {
        Args: {
          p_session_id: string
          p_path: string
          p_product_id?: string | null
          p_category_id?: string | null
          p_referrer?: string | null
          p_user_agent?: string | null
        }
        Returns: undefined
      }
      store_admin_stats: { Args: Record<string, never>; Returns: AdminStats }
      store_validate_coupon: {
        Args: { p_code: string }
        Returns: { valid: boolean; error?: string; code?: string; discount_percent?: number; discount_amount?: number }
      }
      store_redeem_coupon: { Args: { p_code: string }; Returns: undefined }
      store_record_sale: { Args: { p_product_ids: string[] }; Returns: undefined }
      store_subscribe_push: { Args: { p_endpoint: string; p_p256dh: string; p_auth: string }; Returns: undefined }
      store_unsubscribe_push: { Args: { p_endpoint: string }; Returns: undefined }
      store_create_order: {
        Args: {
          p_items: { product_id: string; quantity: number }[]
          p_customer_name: string
          p_customer_phone: string
          p_customer_email?: string | null
          p_coupon_code?: string | null
        }
        Returns: Order
      }
      store_set_order_payment_session: { Args: { p_order_id: string; p_payment_url: string }; Returns: undefined }
      store_mark_order_paid: {
        Args: { p_order_id: string; p_provider_transaction_id?: string | null }
        Returns: Order | null
      }
    }
  }
}
