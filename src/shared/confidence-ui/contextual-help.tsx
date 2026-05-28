"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ContextualHelpProps = {
  title: string;
  description: string;
  tips?: string[];
  side?: "top" | "bottom" | "left" | "right";
};

export function ContextualHelp({ title, description, tips, side = "top" }: ContextualHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent side={side} className="w-72 p-3 text-sm" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          {tips && tips.length > 0 && (
            <div className="pt-1 space-y-1">
              <span className="text-[10px] font-medium text-muted-foreground">Tips:</span>
              <ul className="space-y-0.5">
                {tips.map((tip) => (
                  <li key={tip} className="text-[11px] text-muted-foreground flex items-start gap-1">
                    <span className="text-primary mt-0.5">&bull;</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
