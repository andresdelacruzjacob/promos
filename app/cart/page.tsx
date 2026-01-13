"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils";

// Shipping cost outside Puebla
const SHIPPING_COST = 250;

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();
    const [city, setCity] = useState("Puebla");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    const shipping = city === "Puebla" ? 0 : SHIPPING_COST;
    const grandTotal = total + shipping;

    const handleCheckout = () => {
        setLoading(true);

        // Construct WhatsApp Message
        let message = `*Nuevo Pedido - AutoPartesPro*\n\n`;
        message += `*Cliente:* ${name}\n`;
        message += `*Dirección:* ${address}, ${city}\n\n`;
        message += `*Pedido:*\n`;

        items.forEach((item) => {
            message += `- ${item.quantity}x ${item.name} ($${item.price})\n`;
        });

        message += `\n*Subtotal:* $${total.toFixed(2)}`;
        message += `\n*Envío:* $${shipping.toFixed(2)} (${city})`;
        message += `\n*TOTAL:* $${grandTotal.toFixed(2)}`;

        const encodedMessage = encodeURIComponent(message);
        // Use a placeholder phone number or let the user fill it. 
        // Usually the client wants to send TO the business. 
        // I will stick to a generic number or ask the user later. For now, I'll use a placeholder.
        // Ideally this comes from config.
        const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "522226966779";

        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");

        // Ideally we should clear the cart here or after they confirm.
        // For specific requirement "que se cobre $250... y el cliente pueda realizar pedido", 
        // sending the message is the "realizar pedido".
        // clearCart(); // Optional: Clear after redirect
        setLoading(false);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">Tu carrito está vacío</h1>
                <Link href="/">
                    <Button>Regresar a Promociones</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="sticky top-0 z-50 flex items-center h-16 bg-white border-b px-4 gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <span className="font-bold text-lg">Tu Pedido</span>
            </div>

            <main className="container max-w-2xl mx-auto py-6 space-y-8 px-4 md:px-0">
                {/* Cart Items */}
                <div className="space-y-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border"
                        >
                            <div className="h-20 w-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image_url && (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-medium text-slate-900 line-clamp-1">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-slate-500">${item.price}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checkout Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                    <h2 className="font-bold text-xl">Datos de Envío</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nombre Completo</label>
                        <Input
                            placeholder="Juan Pérez"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Dirección de Entrega</label>
                        <Input
                            placeholder="Calle, Número, Colonia"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ciudad / Municipio</label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={city === "Puebla" ? "default" : "outline"}
                                onClick={() => setCity("Puebla")}
                                className="flex-1"
                            >
                                Puebla
                            </Button>
                            <Button
                                type="button"
                                variant={city !== "Puebla" ? "default" : "outline"}
                                onClick={() => setCity("Otro")}
                                className="flex-1"
                            >
                                Fuera de Puebla
                            </Button>
                        </div>
                        {city !== "Puebla" && (
                            <p className="text-sm text-orange-600 font-medium">
                                Se aplicará un cargo de envío de ${SHIPPING_COST}
                            </p>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h2 className="font-bold text-xl">Resumen</h2>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Envío</span>
                        <span>{shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between items-center">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-2xl text-orange-600">${grandTotal.toFixed(2)}</span>
                    </div>

                    <Button
                        onClick={handleCheckout}
                        disabled={!name || !address || items.length === 0}
                        className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                    >
                        Finalizar pedido en WhatsApp
                    </Button>
                    <p className="text-xs text-center text-slate-400">
                        Serás redirigido a WhatsApp para enviar tu pedido.
                    </p>
                </div>
            </main>
        </div>
    );
}
