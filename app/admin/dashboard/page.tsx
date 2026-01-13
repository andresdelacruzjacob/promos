"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit, LogOut, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function AdminDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check auth
        async function checkAuth() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            fetchProducts();
        }
        checkAuth();
    }, [router]);

    async function fetchProducts() {
        setLoading(true);
        const { data: products, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) {
            setProducts(products || []);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (confirm("¿Estás seguro de eliminar este producto?")) {
            await supabase.from("products").delete().eq("id", id);
            fetchProducts();
        }
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
    }

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <div className="flex gap-4">
                        <Link href="/admin/generator">
                            <Button className="bg-orange-600 hover:bg-orange-700">
                                <FileText className="h-4 w-4 mr-2" />
                                Generar Nota/Cotización
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="ghost">Ver Promociones</Button>
                        </Link>
                        <Button variant="outline" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50">
                            <LogOut className="h-4 w-4 mr-2" />
                            Salir
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Mis Productos</h2>
                        <p className="text-slate-500">Gestiona tus promociones del mes</p>
                    </div>
                    <Link href="/admin/products/new">
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Producto
                        </Button>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 font-medium text-slate-500">Producto</th>
                                    <th className="p-4 font-medium text-slate-500">Categoría</th>
                                    <th className="p-4 font-medium text-slate-500">Precio</th>
                                    <th className="p-4 font-medium text-slate-500">Stock</th>
                                    <th className="p-4 font-medium text-slate-500">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                                    {product.image_url && (
                                                        <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{product.name}</p>
                                                    {product.is_offer && (
                                                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">OFERTA</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {Array.isArray(product.category) ? product.category.join(", ") : product.category}
                                        </td>
                                        <td className="p-4 font-medium">${product.price}</td>
                                        <td className="p-4">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-black",
                                                product.stock > 6 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Link href={`/admin/products/edit/${product.id}`}>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            No hay productos registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
