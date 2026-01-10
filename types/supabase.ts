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
                    created_at?: string
                }
            }
        }
    }
}
