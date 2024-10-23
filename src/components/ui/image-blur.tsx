/* eslint-disable jsx-a11y/alt-text */
"use client";

import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ImageWithBlur({
  className,
  redirect,
  ...imageProps
}: ImageProps & {
  addParentClass?: string;
  redirect?: string;
}) {
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();
  const handleRedirect = () => {
    redirect && router.push(redirect);
  };

  return (
    <div className="group w-full h-full overflow-hidden bg-transparent">
      <Image
        className={cn(
          "duration-300 ease-in-out w-full h-full",
          isLoading
            ? "scale-110 blur-2xl grayscale"
            : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={() => setLoading(false)}
        onClick={handleRedirect}
        {...imageProps}
      />
    </div>
  );
}
