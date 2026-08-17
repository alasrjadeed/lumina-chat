"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function LuminaLogo({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      alt="Lumina Chat"
      className={cn("rounded-md object-contain", className)}
      draggable={false}
      height={size}
      priority
      src="/logo/lumina-logo.png"
      width={size}
    />
  );
}
