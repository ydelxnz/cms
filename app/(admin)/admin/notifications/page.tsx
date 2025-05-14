"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, Trash2, Check, Search, CheckCheck, Send, Filter, RefreshCw, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notificationService } from "@/lib/services";
import { Notification } from "@/lib/db";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotificationWithTimeAgo extends Notification {
  timeAgo: string;
  userName?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  system: number;
  booking: number;
  photo: number;
  order: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationWithTimeAgo[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    system: 0,
    booking: 0,
    photo: 0,
    order: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationWithTimeAgo | null>(null);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [notificationDetailOpen, setNotificationDetailOpen] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [detailNotification, setDetailNotification] = useState<NotificationWithTimeAgo | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // 加载通知数据
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // 使用管理员API获取所有通知
      const result = await notificationService.getAllNotifications({
        type: filterType || undefined,
        status: filterStatus || undefined,
        sortOrder: sortOrder,
      });
      
      setNotifications(result.notifications);
      setStats(result.stats);
    } catch (error) {
      console.error("获取通知失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterType, filterStatus, sortOrder]);

  // 刷新通知数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setIsRefreshing(false);
  };

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
        // 更新统计数据
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
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
        // 更新统计数据
        setStats(prev => ({
          ...prev,
          unread: 0
        }));
      }
    } catch (error) {
      console.error("标记所有通知已读失败:", error);
    }
  };

  // 删除通知
  const handleDeleteNotification = async () => {
    if (!selectedNotification) return;

    try {
      const success = await notificationService.bulkDeleteNotifications({
        notificationIds: [selectedNotification.id]
      });
      
      if (success) {
        setNotifications(prev =>
          prev.filter(n => n.id !== selectedNotification.id)
        );
        
        // 更新统计数据
        const type = selectedNotification.type;
        const isRead = selectedNotification.isRead;
        
        setStats(prev => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          unread: isRead ? prev.unread : Math.max(0, prev.unread - 1),
          [type]: Math.max(0, prev[type as keyof typeof prev] - 1)
        }));
      }
    } catch (error) {
      console.error("删除通知失败:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  // 批量删除选中的通知
  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      setIsBulkDeleting(true);
      const success = await notificationService.bulkDeleteNotifications({
        notificationIds: selectedNotifications
      });
      
      if (success) {
        // 重新获取通知数据
        await fetchNotifications();
        // 清空选中状态
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error("批量删除通知失败:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // 删除所有通知
  const handleDeleteAllNotifications = async () => {
    try {
      // 使用过滤条件删除
      const success = await notificationService.bulkDeleteNotifications({
        filters: {
          // 空的filters意味着删除所有通知
        }
      });
      
      if (success) {
        setNotifications([]);
        setStats({
          total: 0,
          unread: 0,
          system: 0,
          booking: 0,
          photo: 0,
          order: 0,
        });
      }
    } catch (error) {
      console.error("删除所有通知失败:", error);
    } finally {
      setIsDeleteAllDialogOpen(false);
    }
  };

  // 查看通知详情
  const handleViewDetail = (notification: NotificationWithTimeAgo) => {
    setDetailNotification(notification);
    setNotificationDetailOpen(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification);
    }
  };

  // 切换选中状态
  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  // 过滤通知
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => 
      // 搜索文本筛选
      (notification.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [notifications, searchQuery]);

  // 重置所有筛选器
  const resetFilters = () => {
    setSearchQuery("");
    setFilterType(null);
    setFilterStatus(null);
    setSortOrder("desc");
  };

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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            全部标记为已读
          </Button>
          
          {selectedNotifications.length > 0 ? (
            <Button 
              variant="outline" 
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除选中({selectedNotifications.length})
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteAllDialogOpen(true)}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              清空通知
            </Button>
          )}
          
          <Button 
            variant="default" 
            onClick={() => router.push("/admin/notifications/send")}
          >
            <Send className="mr-2 h-4 w-4" />
            发送通知
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* 统计卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总通知数</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unread} 条未读 ({Math.round((stats.unread / (stats.total || 1)) * 100)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统通知</CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.system}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.system / (stats.total || 1)) * 100)}% 的通知
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">预约通知</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.booking}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.booking / (stats.total || 1)) * 100)}% 的通知
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">照片通知</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.photo}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.photo / (stats.total || 1)) * 100)}% 的通知
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索通知..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                筛选
                {(filterType || filterStatus) && 
                  <Badge variant="secondary" className="ml-2 px-1">
                    {(filterType ? 1 : 0) + (filterStatus ? 1 : 0)}
                  </Badge>
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>通知筛选</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <div className="mb-2">
                  <span className="text-sm font-medium">通知类型</span>
                  <Select value={filterType || ""} onValueChange={(value) => setFilterType(value || null)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="所有类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">所有类型</SelectItem>
                      <SelectItem value="system">系统</SelectItem>
                      <SelectItem value="booking">预约</SelectItem>
                      <SelectItem value="photo">照片</SelectItem>
                      <SelectItem value="order">订单</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-2">
                  <span className="text-sm font-medium">已读状态</span>
                  <Select value={filterStatus || ""} onValueChange={(value) => setFilterStatus(value || null)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="所有状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">所有状态</SelectItem>
                      <SelectItem value="read">已读</SelectItem>
                      <SelectItem value="unread">未读</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-2">
                  <span className="text-sm font-medium">时间排序</span>
                  <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">最新优先</SelectItem>
                      <SelectItem value="asc">最早优先</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={resetFilters}>
                重置所有筛选器
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>通知列表</CardTitle>
          <CardDescription>
            系统中的所有通知记录({filteredNotifications.length}条)
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
                    <TableHead className="w-[40px]">
                      <input 
                        type="checkbox" 
                        checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4"
                      />
                    </TableHead>
                    <TableHead className="w-[80px]">状态</TableHead>
                    <TableHead className="w-[80px]">类型</TableHead>
                    <TableHead className="w-[180px]">接收用户</TableHead>
                    <TableHead className="w-[250px]">标题</TableHead>
                    <TableHead>内容</TableHead>
                    <TableHead className="w-[120px]">时间</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow 
                      key={notification.id} 
                      className={notification.isRead ? "" : "bg-blue-50"}
                      onClick={() => handleViewDetail(notification)}
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(notification.id);
                      }}>
                        <input 
                          type="checkbox" 
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                      </TableCell>
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
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs truncate" title={notification.userId}>
                            {notification.userName || notification.userId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {notification.title}
                      </TableCell>
                      <TableCell>
                        <div className="truncate max-w-md" title={notification.message}>
                          {notification.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">{notification.timeAgo}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification);
                              }}
                              title="标记为已读"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotification(notification);
                              setIsDeleteDialogOpen(true);
                            }}
                            title="删除通知"
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

      {/* 通知详情侧边栏 */}
      <Sheet open={notificationDetailOpen} onOpenChange={setNotificationDetailOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>通知详情</SheetTitle>
            <SheetDescription>
              查看通知的完整信息
            </SheetDescription>
          </SheetHeader>
          {detailNotification && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                {getNotificationTypeBadge(detailNotification.type)}
                <Badge variant={detailNotification.isRead ? "outline" : "default"}>
                  {detailNotification.isRead ? "已读" : "未读"}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">{detailNotification.title}</h3>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  {new Date(detailNotification.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">接收用户</h4>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{detailNotification.userId}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">通知内容</h4>
                <p className="whitespace-pre-wrap text-sm">
                  {detailNotification.message}
                </p>
              </div>
            </div>
          )}
          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button type="button" variant="secondary">关闭</Button>
            </SheetClose>
            {detailNotification && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setSelectedNotification(detailNotification);
                  setIsDeleteDialogOpen(true);
                  setNotificationDetailOpen(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除通知
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

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

      {/* 删除所有通知确认对话框 */}
      <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空所有通知</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除所有通知吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllNotifications}>
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 