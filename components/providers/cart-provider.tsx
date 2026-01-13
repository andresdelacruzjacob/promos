"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, quantity: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        // Triple-layer safety net: check session flag, URL param, or direct storage
        const isSuccessfulCheckout =
            (typeof window !== "undefined" && window.location.search.includes("cleared=true")) ||
            (typeof sessionStorage !== "undefined" && sessionStorage.getItem("checkout_complete") === "true");

        if (isSuccessfulCheckout) {
            localStorage.removeItem("cart");
            if (typeof sessionStorage !== "undefined") {
                sessionStorage.removeItem("checkout_complete");
            }
            setItems([]);

            // Clean up URL without reload if needed
            if (typeof window !== "undefined" && window.location.search.includes("cleared=true")) {
                const newUrl = window.location.pathname;
                window.history.replaceState({}, "", newUrl);
            }
            return;
        }

        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));
    }, [items]);

    const addItem = (product: Product, quantity: number) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                // Check stock limit
                const newQuantity = Math.min(existing.quantity + quantity, product.stock);
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: newQuantity } : item
                );
            }
            // Check stock limit for new item
            const initialQuantity = Math.min(quantity, product.stock);
            return [...prev, { ...product, quantity: initialQuantity }];
        });
    };

    const removeItem = (productId: string) => {
        setItems((prev) => prev.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === productId) {
                    // We can't easily check stock here without passing the product object again, 
                    // but we assume the UI handles the max limit based on the product data it has.
                    // Or we could store stock in the CartItem (which we do).
                    const validQuantity = Math.min(Math.max(1, quantity), item.stock);
                    return { ...item, quantity: validQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem("cart");
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
