"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CameraIcon,
  HomeIcon,
  ImageIcon,
  MenuIcon,
  Bell,
  X,
} from "lucide-react";

const navItems = [
  {
    name: "仪表盘",
    href: "/client/dashboard",
    icon: HomeIcon,
  },
  {
    name: "摄影师",
    href: "/client/photographers",
    icon: CameraIcon,
  },
  {
    name: "预约",
    href: "/client/bookings",
    icon: CalendarIcon,
  },
  {
    name: "我的照片",
    href: "/client/photos",
    icon: ImageIcon,
  },
  {
    name: "通知中心",
    href: "/client/notifications",
    icon: Bell,
  },
];

export default function ClientSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed left-4 top-4 z-50 block md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 transform bg-white transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto bg-white py-4 shadow-lg">
          <div className="flex items-center justify-between px-4">
            <Link href="/client/dashboard" className="flex items-center space-x-2">
              <CameraIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">摄影影楼</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="mt-8 space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    pathname === item.href
                      ? "text-primary-foreground"
                      : "text-gray-500 group-hover:text-gray-600"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden w-64 flex-shrink-0 bg-white shadow-sm md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b px-4">
            <Link href="/client/dashboard" className="flex items-center space-x-2">
              <CameraIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">摄影影楼</span>
            </Link>
          </div>

          <nav className="mt-8 flex-1 space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    pathname === item.href
                      ? "text-primary-foreground"
                      : "text-gray-500 group-hover:text-gray-600"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">客户账户</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
