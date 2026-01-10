"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert("Error: " + error.message);
        } else {
            router.push("/admin/dashboard");
        }
        setLoading(false);
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-100 p-4">
            <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow-md">
                <form onSubmit={handleLogin} className="space-y-4">
                    <h1 className="text-2xl font-bold text-center">Acceso Administrativo</h1>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Correo Electrónico</label>
                        <Input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contraseña</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700" type="submit" disabled={loading}>
                        {loading ? "Iniciando sesión..." : "Entrar al Panel"}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t text-center">
                    <Link href="/" className="text-sm text-slate-500 hover:text-orange-600 transition-colors">
                        ← Volver a Promociones
                    </Link>
                </div>
            </div>
        </div>
    );
}
