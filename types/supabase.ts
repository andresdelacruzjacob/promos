export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    category: string[]
                    price: number
                    image_url: string | null
                    stock: number
                    description: string | null
                    is_offer: boolean
                    condition: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    category: string[]
                    price: number
                    image_url?: string | null
                    stock?: number
                    description?: string | null
                    is_offer?: boolean
                    condition: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string[]
                    price?: number
                    image_url?: string | null
                    stock?: number
                    description?: string | null
                    is_offer?: boolean
                    condition?: string
                    created_at?: string
                }
            }
            orders: {
                Row: {
                    id: string
                    customer_name: string
                    customer_address: string
                    customer_city: string
                    total_amount: number
                    shipping_cost: number
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    customer_name: string
                    customer_address: string
                    customer_city: string
                    total_amount: number
                    shipping_cost: number
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    customer_name?: string
                    customer_address?: string
                    customer_city?: string
                    total_amount?: number
                    shipping_cost?: number
                    status?: string
                    created_at?: string
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string
                    product_name: string
                    quantity: number
                    price_at_order: number
                }
                Insert: {
                    id?: string
                    order_id: string
                    product_id: string
                    product_name: string
                    quantity: number
                    price_at_order: number
                }
                Update: {
                    id?: string
                    order_id?: string
                    product_id?: string
                    product_name?: string
                    quantity?: number
                    price_at_order?: number
                }
            }
        }
    }
}
