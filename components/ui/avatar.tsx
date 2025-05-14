"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

interface AvatarImageProps extends Omit<React.ComponentProps<typeof Image>, "src"> {
  src?: string | null
}

function AvatarImage({
  className,
  alt = "",
  src,
  ...props
}: AvatarImageProps) {
  if (!src) {
    return null
  }
  
  return (
    <Image
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      fill
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
