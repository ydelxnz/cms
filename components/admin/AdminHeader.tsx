"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, LogOut, Settings, User, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notificationService } from "@/lib/services";
import { Notification } from "@/lib/db";

interface NotificationWithTimeAgo extends Notification {
  timeAgo: string;
}

interface AdminHeaderProps {
  user: {
    name: string;
    phone: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationWithTimeAgo[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 加载通知数据
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // 获取未读通知
        const data = await notificationService.getNotifications(true);
        setNotifications(data.slice(0, 5)); // 只显示最近5条
        setUnreadCount(data.length);
      } catch (error) {
        console.error("获取通知失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
    
    // 每分钟刷新一次通知
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  // 标记通知为已读
  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const success = await notificationService.markAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("标记通知已读失败:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // 获取通知类型对应的显示文本
  const getNotificationTypeText = (type: string): string => {
    switch (type) {
      case "booking":
        return "预约通知";
      case "photo":
        return "照片通知";
      case "order":
        return "订单通知";
      case "system":
        return "系统通知";
      default:
        return "通知";
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center">
        <h1 className="hidden text-xl font-semibold md:block">管理员控制台</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick actions */}
        <Link href="/admin/notifications/new" className="cursor-pointer">
          发送通知
        </Link>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>系统通知</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">加载通知中...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">暂无未读通知</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-start"
                    asChild
                  >
                    <Link href={`/admin/notifications?id=${notification.id}`}>
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{getNotificationTypeText(notification.type)}</p>
                          <p className="text-xs text-gray-400">{notification.timeAgo}</p>
                        </div>
                        <p className="text-sm text-gray-500">{notification.title}</p>
                        <p className="mt-1 text-xs line-clamp-2 text-gray-500">
                          {notification.message}
                        </p>
                        <div className="mt-1 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                          >
                            标记为已读
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/notifications" className="w-full text-center text-sm font-medium text-primary">
                查看全部通知
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
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
