"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { Info, X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem, items } = useCart();
    const cartItem = items.find((item) => item.id === product.id);
    const quantityInCart = cartItem?.quantity || 0;
    const isOutOfStock = product.stock <= 0;
    const isLimitReached = quantityInCart >= product.stock;

    const [showZoom, setShowZoom] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const handleAddToCart = () => {
        addItem(product, 1);
    };

    return (
        <>
            <div className="group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                            Sin imagen
                        </div>
                    )}

                    {/* Hover Overlay for Zoom */}
                    <div
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100"
                        onClick={() => setShowZoom(true)}
                    >
                        <div className="bg-white/90 p-2 rounded-full shadow-lg">
                            <ZoomIn className="h-5 w-5 text-slate-700" />
                        </div>
                    </div>

                    {product.is_offer && (
                        <div className="absolute top-2 left-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm z-10">
                            Oferta
                        </div>
                    )}

                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                            <span className="rounded-md bg-white px-3 py-1 text-xs font-bold text-red-600 shadow-lg uppercase tracking-tight">
                                Agotado
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                            {Array.isArray(product.category) ? product.category.join(", ") : product.category}
                        </p>
                        <h3 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                            {product.name}
                        </h3>
                    </div>

                    <div className="mt-auto space-y-3">
                        {product.description && (
                            <button
                                onClick={() => setShowInfo(true)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-tighter"
                            >
                                <Info className="h-3 w-3" />
                                ver compatibilidad / detalles
                            </button>
                        )}

                        <div className="flex flex-col gap-1 border-t pt-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xl font-black text-slate-900">${product.price}</span>
                                <div className={cn(
                                    "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter",
                                    product.stock > 6
                                        ? "text-green-700 bg-green-50"
                                        : "text-red-700 bg-red-50"
                                )}>
                                    Disponibles: {product.stock}
                                </div>
                            </div>
                            {product.stock > 0 && product.stock <= 6 && (
                                <p className="text-[9px] font-black text-red-600 uppercase animate-pulse">
                                    ¡Aprovecha, quedan pocas piezas!
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || isLimitReached}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 shadow-sm"
                            size="sm"
                        >
                            {isOutOfStock ? "Agotado" : isLimitReached ? "Límite" : "Agregar al Carrito"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal: Image Zoom */}
            {showZoom && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300 backdrop-blur-sm"
                    onClick={() => setShowZoom(false)}
                >
                    <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 truncate pr-8">{product.name}</h3>
                            <button onClick={() => setShowZoom(false)} className="text-slate-500 hover:text-slate-800">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-2 bg-slate-50 flex items-center justify-center min-h-[50vh]">
                            <img
                                src={product.image_url || ""}
                                alt={product.name}
                                className="max-h-[75vh] w-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: More Info */}
            {showInfo && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200 backdrop-blur-sm"
                    onClick={() => setShowInfo(false)}
                >
                    <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-orange-600 p-6 text-white">
                            <div className="flex justify-between items-start mb-2">
                                <Info className="h-8 w-8 opacity-50" />
                                <button onClick={() => setShowInfo(false)} className="bg-white/20 hover:bg-white/30 p-1 rounded-full transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
                            <p className="text-xs opacity-90 mt-1">Detalles Técnicos y Compatibilidad</p>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                                {product.description}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t flex justify-end">
                            <Button onClick={() => setShowInfo(false)} className="bg-slate-900 text-white font-bold">
                                Entendido
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
