"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Download, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Item {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

export default function GeneratorPage() {
    const [docType, setDocType] = useState<"Nota de Venta" | "Presupuesto">("Nota de Venta");
    const [clientName, setClientName] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [items, setItems] = useState<Item[]>([
        { id: "1", description: "", quantity: 1, price: 0 }
    ]);
    const [shipping, setShipping] = useState(0);
    const [includeIva, setIncludeIva] = useState(false);

    const addItem = () => {
        setItems([...items, { id: Math.random().toString(), description: "", quantity: 1, price: 0 }]);
    };

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const updateItem = (id: string, field: keyof Item, value: string | number) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const iva = includeIva ? subtotal * 0.16 : 0;
    const total = subtotal + iva + shipping;

    const generatePDF = async (action: "download" | "share" = "download") => {
        const doc = new jsPDF();

        // Configuration
        const brandColor = [232, 93, 34]; // Orange #e85d22 approx

        // Header - Business Info (Left)
        doc.setFontSize(20);
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        doc.setFont("helvetica", "bold");
        doc.text(docType.toUpperCase(), 20, 30);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 37);

        // Logo & Business Info (Right)
        try {
            // We use the logo.png from public folder. In browser it's just /logo.png
            doc.addImage("/logo.png", "PNG", 140, 15, 50, 20);
        } catch (e) {
            console.error("Logo not found", e);
        }

        doc.setFontSize(9);
        doc.setTextColor(0);
        doc.text("Puebla, México", 190, 40, { align: "right" });
        doc.text("Whatsapp: 2226966779", 190, 45, { align: "right" });
        doc.text("Email: hola@autopartescoma.com", 190, 50, { align: "right" });

        // Client Info
        doc.setDrawColor(200);
        doc.line(20, 60, 190, 60);

        doc.setFont("helvetica", "bold");
        doc.text("CLIENTE:", 20, 70);
        doc.setFont("helvetica", "normal");
        doc.text(clientName || "___________________________", 20, 75);
        doc.text(clientAddress || "___________________________", 20, 80);
        if (clientPhone) doc.text(`Tel: ${clientPhone}`, 20, 85);

        // Table
        autoTable(doc, {
            startY: 95,
            head: [['Descripción', 'Cant.', 'Precio Unit.', 'Total']],
            body: items.map(item => [
                item.description || "Sin descripción",
                item.quantity,
                `$${item.price.toFixed(2)}`,
                `$${(item.quantity * item.price).toFixed(2)}`
            ]),
            headStyles: { fillColor: brandColor as [number, number, number] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
        });

        // Summary
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        doc.setFont("helvetica", "bold");
        doc.text("Subtotal:", 140, finalY);
        doc.setFont("helvetica", "normal");
        doc.text(`$${subtotal.toFixed(2)}`, 190, finalY, { align: "right" });

        if (includeIva) {
            doc.setFont("helvetica", "bold");
            doc.text("IVA (16%):", 140, finalY + 7);
            doc.setFont("helvetica", "normal");
            doc.text(`$${iva.toFixed(2)}`, 190, finalY + 7, { align: "right" });
        }

        if (shipping > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Envío:", 140, finalY + (includeIva ? 14 : 7));
            doc.setFont("helvetica", "normal");
            doc.text(`$${shipping.toFixed(2)}`, 190, finalY + (includeIva ? 14 : 7), { align: "right" });
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
        const totalY = finalY + (includeIva ? 14 : 7) + (shipping > 0 ? 10 : 10);
        doc.text("TOTAL:", 140, totalY);
        doc.text(`$${total.toFixed(2)}`, 190, totalY, { align: "right" });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Gracias por su preferencia.", 105, 280, { align: "center" });

        const fileName = `${docType.replace(" ", "_")}_${clientName || "cliente"}.pdf`;

        if (action === "share" && navigator.share) {
            const blob = doc.output("blob");
            const file = new File([blob], fileName, { type: "application/pdf" });

            try {
                await navigator.share({
                    files: [file],
                    title: docType,
                    text: `Hola ${clientName}, adjunto envío su ${docType.toLowerCase()}.`,
                });
            } catch (error) {
                console.error("Error sharing", error);
                doc.save(fileName); // Fallback to download
            }
        } else {
            doc.save(fileName);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header Toolbar */}
            <div className="sticky top-0 z-50 flex items-center h-16 bg-white border-b px-4 gap-2 justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/admin/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <span className="font-bold text-lg hidden sm:block">Generador</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => generatePDF("share")}
                        variant="outline"
                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                        <Plus className="h-4 w-4 sm:mr-2 rotate-45" />
                        <span className="hidden sm:inline">Compartir</span>
                        <span className="sm:hidden text-xs">Enviar</span>
                    </Button>
                    <Button onClick={() => generatePDF("download")} className="bg-orange-600 hover:bg-orange-700">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Descargar PDF</span>
                        <span className="sm:hidden text-xs">PDF</span>
                    </Button>
                </div>
            </div>


            <main className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Client & Config */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="font-bold flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-orange-600" />
                                    Tipo de Documento
                                </Label>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={docType === "Nota de Venta" ? "default" : "outline"}
                                    onClick={() => setDocType("Nota de Venta")}
                                    className={docType === "Nota de Venta" ? "bg-orange-600" : ""}
                                    size="sm"
                                >
                                    Nota
                                </Button>
                                <Button
                                    variant={docType === "Presupuesto" ? "default" : "outline"}
                                    onClick={() => setDocType("Presupuesto")}
                                    className={docType === "Presupuesto" ? "bg-orange-600" : ""}
                                    size="sm"
                                >
                                    Presupuesto
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-4 space-y-4">
                            <Label className="font-bold">Datos del Cliente</Label>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-slate-500">Nombre</Label>
                                    <Input
                                        placeholder="Nombre del cliente"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">Dirección</Label>
                                    <Input
                                        placeholder="Calle, Ciudad..."
                                        value={clientAddress}
                                        onChange={(e) => setClientAddress(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">Teléfono</Label>
                                    <Input
                                        placeholder="222..."
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 space-y-4">
                            <Label className="font-bold flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-orange-600" />
                                Ajustes Finales
                            </Label>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Incluir IVA (16%)</Label>
                                    <Switch
                                        checked={includeIva}
                                        onCheckedChange={setIncludeIva}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">Costo de Envío</Label>
                                    <Input
                                        type="number"
                                        value={shipping}
                                        onChange={(e) => setShipping(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Items */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <Label className="font-bold text-xl">Productos / Servicios</Label>
                                <Button onClick={addItem} variant="outline" size="sm" className="text-orange-600 border-orange-600">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Agregar
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex gap-3 items-end p-4 bg-slate-50 rounded-lg border group">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-xs text-slate-500">Descripción</Label>
                                            <Input
                                                placeholder="Ej. Amortiguador delantero"
                                                value={item.description}
                                                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                            />
                                        </div>
                                        <div className="w-20 space-y-1">
                                            <Label className="text-xs text-slate-500">Cant.</Label>
                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="w-28 space-y-1">
                                            <Label className="text-xs text-slate-500">Precio</Label>
                                            <Input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            {/* Live Subtotal */}
                            <div className="mt-8 pt-6 border-t space-y-2">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {includeIva && (
                                    <div className="flex justify-between text-slate-500">
                                        <span>IVA (16%)</span>
                                        <span>${iva.toFixed(2)}</span>
                                    </div>
                                )}
                                {shipping > 0 && (
                                    <div className="flex justify-between text-slate-500">
                                        <span>Envío</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-2xl font-bold text-orange-600">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
