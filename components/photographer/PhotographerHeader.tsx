"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, Settings, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PhotographerHeaderProps {
  user: {
    name: string;
    phone: string;
  };
}

export default function PhotographerHeader({ user }: PhotographerHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<number>(2); // Example notification count

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center">
        <h1 className="hidden text-xl font-semibold md:block">摄影师工作台</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick actions */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/photographer/upload">
            上传照片
          </Link>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href="/photographer/schedule">
            <Calendar className="mr-2 h-4 w-4" />
            查看日程
          </Link>
        </Button>
        
        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar>
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-xs font-normal text-gray-500">{user.phone}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleSignOut} className="flex cursor-pointer items-center text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
