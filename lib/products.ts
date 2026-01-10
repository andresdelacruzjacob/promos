import { createClient } from "@/lib/supabase/client";

export async function getProducts(category?: string) {
    const supabase = createClient();

    let query = supabase.from("products").select("*").order("name");

    if (category && category !== "Todas") {
        query = query.contains("category", [category]);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return data;
}

export async function getProduct(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

    if (error) {
        console.error("Error fetching product:", error);
        return null;
    }

    return data;
}
