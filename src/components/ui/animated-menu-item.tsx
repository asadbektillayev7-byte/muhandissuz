"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedMenuItemProps {
  href: string;
  label: string;
  className?: string;
}

export function AnimatedMenuItem({ href, label, className }: AnimatedMenuItemProps) {
  return (
    <Link href={href} className={cn("group/menu flex items-center gap-2 w-max", className)}>
      <ArrowRight
        className="size-4 -translate-x-full text-foreground opacity-0 transition-all duration-300 ease-out group-hover/menu:translate-x-0 group-hover/menu:text-primary group-hover/menu:opacity-100"
      />
      <span
        className="-translate-x-4 cursor-pointer text-sm text-muted-foreground transition-all duration-300 ease-out group-hover/menu:translate-x-0 group-hover/menu:text-primary"
      >
        {label}
      </span>
    </Link>
  );
}
