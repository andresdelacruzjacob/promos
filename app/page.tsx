"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { Header } from "@/components/header";
import { CategoryFilter } from "@/components/category-filter";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProducts } from "@/lib/products";
import { Database } from "@/types/supabase";


type Product = Database["public"]["Tables"]["products"]["Row"];

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const data = await getProducts(selectedCategory);
            setProducts(data || []);
            setLoading(false);
        }
        fetchProducts();
    }, [selectedCategory]);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Header />

            <main className="container py-6 space-y-6">
                <div className="container mx-auto px-4 py-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight uppercase">
                        Promociones del <span className="text-orange-600 font-black">mes</span>
                    </h1>
                </div>

                <div className="flex items-center justify-between px-4 md:px-0">
                    <CategoryFilter
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", viewMode === "grid" ? "bg-white shadow-sm" : "text-slate-400")}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", viewMode === "list" ? "bg-white shadow-sm" : "text-slate-400")}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className={cn(
                        "gap-4 px-4 md:px-0",
                        viewMode === "grid"
                            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                            : "flex flex-col space-y-4"
                    )}>
                        {/* Skeletons */}
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={cn(
                                "bg-slate-200 animate-pulse rounded-xl",
                                viewMode === "grid" ? "h-64" : "h-32"
                            )} />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className={cn(
                        "gap-4 px-4 md:px-0",
                        viewMode === "grid"
                            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                            : "flex flex-col space-y-4"
                    )}>
                        {products.map((product) => (
                            viewMode === "grid" ? (
                                <ProductCard key={product.id} product={product} />
                            ) : (
                                // List View Card
                                <div key={product.id} className="flex gap-4 p-4 bg-white rounded-xl border shadow-sm items-center">
                                    <div className="h-20 w-20 flex-shrink-0 bg-slate-100 rounded-md overflow-hidden">
                                        {product.image_url && <img src={product.image_url} className="h-full w-full object-cover" alt="" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {Array.isArray(product.category) ? product.category.join(", ") : product.category}
                                        </p>
                                        <span className="font-bold text-orange-600">${product.price}</span>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <ProductCard key={product.id} product={product} />
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg font-medium text-slate-600">No se encontraron productos</p>
                        <p className="text-sm text-slate-400">Intenta seleccionar otra categoría</p>
                    </div>
                )}
            </main>

            <footer className="py-12 bg-black text-white mt-12">
                <div className="container mx-auto px-4 text-center space-y-4">
                    <div className="space-y-1">
                        <p className="font-bold">© 2026 Comercializadora Mexicana De Autopartes</p>
                        <p className="text-sm text-slate-400">
                            <a href="https://www.autopartescoma.com" target="_blank" className="hover:text-white">www.autopartescoma.com</a>
                            <span className="mx-2">•</span>
                            <a href="mailto:hola@autopartescoma.com" className="hover:text-white">hola@autopartescoma.com</a>
                        </p>
                    </div>

                    <Link href="/login" className="mt-8 inline-block text-xs text-slate-700 hover:text-orange-500">
                        Acceso Administrativo
                    </Link>
                </div>
            </footer>
        </div>
    );
}
