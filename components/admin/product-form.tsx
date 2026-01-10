"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database } from "@/types/supabase";
import { ArrowLeft, Save } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];

const CATEGORIES = [
    "Nissan NV350",
    "Nissan Tsuru III",
    "Nissan Versa",
    "Nissan Pick Up",
    "Toyota Hiace",
];

interface ProductFormProps {
    initialData?: Product;
    isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        category: [] as string[],
        price: "",
        stock: "",
        description: "",
        image_url: "",
        is_offer: false,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                category: initialData.category,
                price: initialData.price.toString(),
                stock: initialData.stock.toString(),
                description: initialData.description || "",
                image_url: initialData.image_url || "",
                is_offer: initialData.is_offer || false,
            });
            if (initialData.image_url) setImagePreview(initialData.image_url);
        }
    }, [initialData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCategoryToggle = (cat: string) => {
        setFormData(prev => {
            const current = [...prev.category];
            const index = current.indexOf(cat);
            if (index > -1) {
                current.splice(index, 1);
            } else {
                current.push(cat);
            }
            return { ...prev, category: current };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.category.length === 0) {
            alert("Por favor selecciona al menos una categoría.");
            return;
        }

        setLoading(true);

        let finalImageUrl = formData.image_url;

        // Upload image if a new file was selected
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, imageFile);

            if (uploadError) {
                alert("Error al subir imagen: " + uploadError.message);
                setLoading(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            finalImageUrl = publicUrl;
        }

        const payload = {
            name: formData.name,
            category: formData.category,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            description: formData.description,
            image_url: finalImageUrl,
            is_offer: formData.is_offer,
        };

        let error;

        if (isEditing && initialData) {
            const { error: updateError } = await supabase
                .from("products")
                .update(payload)
                .eq("id", initialData.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("products")
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            alert("Error saving product: " + error.message);
        } else {
            router.push("/admin/dashboard");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-xl shadow border">
            <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-xl font-bold">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>
                <Button variant="ghost" type="button" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cancelar
                </Button>
            </div>

            <div className="grid gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Producto</label>
                    <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej. Amortiguador Delantero"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium">Categorías (Puedes elegir varias)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border">
                        {CATEGORIES.map((cat) => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-orange-600">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    checked={formData.category.includes(cat)}
                                    onChange={() => handleCategoryToggle(cat)}
                                />
                                <span className="text-sm">{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Precio ($)</label>
                        <Input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Stock Disponible</label>
                        <Input
                            required
                            type="number"
                            min="0"
                            step="1"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            checked={formData.is_offer}
                            onChange={(e) => setFormData({ ...formData, is_offer: e.target.checked })}
                        />
                        <span className="text-sm font-bold text-orange-900">¿Es Oferta del Mes?</span>
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Imagen del Producto</label>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="w-full md:w-32 h-32 bg-slate-100 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-[10px] text-slate-400 text-center px-2">Sin imagen</span>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                            />
                            <p className="text-xs text-slate-500">Puedes subir una foto desde tu galería.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción Técnica / Compatibilidades</label>
                    <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ej: Compatible con Nissan Versa 2012-2019, Nissan NV350 2014+, etc."
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Guardando..." : "Guardar Producto"}
                </Button>
            </div>
        </form>
    );
}
