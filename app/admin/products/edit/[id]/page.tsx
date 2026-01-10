"use client";

import { useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { getProduct } from "@/lib/products";
import { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function EditProductPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getProduct(params.id);
            setProduct(data);
            setLoading(false);
        }
        load();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (!product) return <div className="p-8 text-center">Producto no encontrado</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <ProductForm initialData={product} isEditing />
        </div>
    );
}
