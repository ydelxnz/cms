"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Camera, 
  User, 
  Search, 
  Filter, 
  ChevronDown, 
  Edit, 
  X, 
  Check, 
  AlertTriangle,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { bookingService } from "@/lib/services";
import { Booking } from "@/lib/types";
import { Label } from "@/components/ui/label";

export default function BookingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [activeTab, statusFilter, currentPage]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 构建查询参数
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (activeTab === "upcoming") {
        params.upcoming = true;
      } else if (activeTab === "past") {
        params.past = true;
      }
      
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      
      // 获取客户预约
      const response = await bookingService.getClientBookings(params);
      
      // 假设API返回的是包含数据和分页信息的对象
      if (response.data && Array.isArray(response.data)) {
        setBookings(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        // 如果API直接返回数组
        setBookings(response);
        setTotalPages(Math.ceil(response.length / 10));
      }
    } catch (error) {
      console.error('获取预约数据失败:', error);
      setError('获取预约数据失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setIsCancelling(true);
      setError(null);
      
      // 调用取消预约API
      await bookingService.cancelBooking(selectedBooking.id, cancelReason);
      
      // 更新本地状态
      setBookings(prev => 
        prev.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, status: "cancelled", cancelledAt: new Date().toISOString(), notes: cancelReason } 
            : booking
        )
      );
      
      // 关闭对话框
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('取消预约失败:', error);
      setError('取消预约失败，请稍后再试');
    } finally {
      setIsCancelling(false);
      setSelectedBooking(null);
      setCancelReason("");
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.photographerName?.toLowerCase().includes(query) ||
        booking.type?.toLowerCase().includes(query) ||
        booking.location?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "已确认";
      case "pending":
        return "待确认";
      case "cancelled":
        return "已取消";
      case "completed":
        return "已完成";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">我的预约</h2>
        <Button asChild>
          <Link href="/client/photographers">预约摄影师</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>预约管理</CardTitle>
          <CardDescription>查看和管理您的摄影预约</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">即将到来</TabsTrigger>
              <TabsTrigger value="past">历史预约</TabsTrigger>
              <TabsTrigger value="all">全部预约</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="confirmed">已确认</SelectItem>
                  <SelectItem value="pending">待确认</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">暂无预约记录</p>
              <Button className="mt-4" asChild>
                <Link href="/client/photographers">预约摄影师</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>摄影师</TableHead>
                      <TableHead>日期</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{booking.photographerName?.slice(0, 2) || "摄影师"}</AvatarFallback>
                            </Avatar>
                            <span>{booking.photographerName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(booking.date), "yyyy-MM-dd")}</TableCell>
                        <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                        <TableCell>{booking.type}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>取消预约</DialogTitle>
            <DialogDescription>
              您确定要取消此预约吗？取消后可能需要支付取消费用。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">
                  请注意：预约取消后无法恢复
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cancelReason">取消原因</Label>
              <Textarea
                id="cancelReason"
                placeholder="请简要说明取消原因..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              返回
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认取消"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
