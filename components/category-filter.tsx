"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const categories = [
    "Todas",
    "Nissan NV350",
    "Nissan Tsuru III",
    "Nissan Versa",
    "Nissan Pick Up",
    "Toyota Hiace",
];

interface CategoryFilterProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export function CategoryFilter({
    selectedCategory,
    onSelectCategory,
}: CategoryFilterProps) {
    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-2 min-w-max px-4">
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant={selectedCategory === category ? "premium" : "outline"}
                        className={cn(
                            "rounded-full transition-all text-sm h-9",
                            selectedCategory === category
                                ? "font-bold shadow-md shadow-orange-500/25 border-transparent"
                                : "border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200"
                        )}
                        onClick={() => onSelectCategory(category)}
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>
    );
}
