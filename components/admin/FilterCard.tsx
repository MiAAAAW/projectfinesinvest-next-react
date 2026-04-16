"use client";

import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ═══════════════════════════════════════════════════════════════════════════════
// FILTER CARD
// Reemplaza el card de filtros copy-pasteado en las 9 list pages
// ═══════════════════════════════════════════════════════════════════════════════

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  placeholder: string;
  options: FilterOption[];
}

interface FilterCardProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  filters?: FilterField[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

export function FilterCard({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  filterValues,
  onFilterChange,
}: FilterCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Dynamic Filters */}
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key] || "all"}
              onValueChange={(value) => onFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
