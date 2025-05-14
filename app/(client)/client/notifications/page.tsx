"use client";

import { useState, useEffect } from "react";
import { Bell, Trash2, Check, Search, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { notificationService } from "@/lib/services";
import { Notification } from "@/lib/db";

interface NotificationWithTimeAgo extends Notification {
  timeAgo: string;
}

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationWithTimeAgo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationWithTimeAgo | null>(null);

  // 加载通知数据
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("获取通知失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 标记通知为已读
  const handleMarkAsRead = async (notification: NotificationWithTimeAgo) => {
    if (notification.isRead) return;

    try {
      const success = await notificationService.markAsRead(notification.id);
      if (success) {
        setNotifications(prev =>
          prev.map(n => 
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (error) {
      console.error("标记通知已读失败:", error);
    }
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead();
      if (success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
      }
    } catch (error) {
      console.error("标记所有通知已读失败:", error);
    }
  };

  // 删除通知
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      const success = await notificationService.removeNotification(selectedNotification.id);
      if (success) {
        setNotifications(prev =>
          prev.filter(n => n.id !== selectedNotification.id)
        );
      }
    } catch (error) {
      console.error("删除通知失败:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  // 筛选通知
  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 获取通知类型对应的标签
  const getNotificationTypeBadge = (type: string) => {
    switch (type) {
      case "booking":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">预约</Badge>;
      case "photo":
        return <Badge variant="outline" className="bg-green-50 text-green-700">照片</Badge>;
      case "order":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">订单</Badge>;
      case "system":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">系统</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">通知中心</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            全部标记为已读
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索通知..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>所有通知</CardTitle>
          <CardDescription>
            查看您的系统通知
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">加载通知数据...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center">
              <Bell className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">暂无通知</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">状态</TableHead>
                    <TableHead className="w-[100px]">类型</TableHead>
                    <TableHead className="w-[250px]">标题</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead className="w-[120px]">时间</TableHead>
                    <TableHead className="w-[120px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow 
                      key={notification.id} 
                      className={notification.isRead ? "" : "bg-blue-50"}
                    >
                      <TableCell>
                        {notification.isRead ? (
                          <Badge variant="outline" className="bg-gray-100">已读</Badge>
                        ) : (
                          <Badge variant="default">未读</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getNotificationTypeBadge(notification.type)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {notification.title}
                      </TableCell>
                      <TableCell>{notification.message}</TableCell>
                      <TableCell>{notification.timeAgo}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleMarkAsRead(notification)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedNotification(notification);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除通知确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除通知</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这条通知吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNotification}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 