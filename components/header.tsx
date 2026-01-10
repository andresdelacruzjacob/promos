"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";

export function Header() {
    const { itemCount } = useCart();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <div className="relative h-12 w-32">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="COMA Autopartes" className="object-contain h-full w-full object-left" />
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-5 w-5" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-background">
                                    {itemCount}
                                </span>
                            )}
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
