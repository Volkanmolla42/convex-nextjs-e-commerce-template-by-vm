"use client";

import { ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileBottomSummaryProps = {
  summary: ReactNode;
  totalValue: string;
  totalLabel?: string;
  action: ReactNode;
  className?: string;
};

export function MobileBottomSummary({
  summary,
  totalValue,
  totalLabel = "Toplam",
  action,
  className,
}: MobileBottomSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed inset-x-0 bottom-0 z-40 border-t border-navy/15 bg-paper/95 backdrop-blur-sm lg:hidden", className)}>
      <div
        className={cn(
          "overflow-hidden border-b border-navy/10 transition-all duration-300 ease-out",
          isOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="max-h-72 overflow-y-auto px-3 py-2">{summary}</div>
      </div>

      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center justify-between border border-navy/20 px-2 py-1.5 text-left transition-colors hover:border-denim/60"
        >
          <div className="min-w-0">
            <span className="block text-xs tracking-widest uppercase text-navy/60">{totalLabel}</span>
            <span className="block truncate text-base font-heading text-denim">{totalValue}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="ml-2 size-4 shrink-0 text-navy/70" />
          ) : (
            <ChevronUp className="ml-2 size-4 shrink-0 text-navy/70" />
          )}
        </button>

        {action}
      </div>
    </div>
  );
}

