"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Calendar,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Check,
  X,
  Clock,
  MapPin,
  User,
  Camera,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// 预约接口定义
interface Booking {
  id: string;
  clientId: string;
  clientName?: string;
  photographerId: string;
  photographerName?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  location?: string;
  locationAddress?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price?: number;
  deposit?: number;
  isPaid?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export default function BookingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    // 获取预约数据
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bookings');
        if (!response.ok) {
          throw new Error('获取预约数据失败');
        }
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const handleStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          note: statusNote 
        }),
      });

      if (!response.ok) {
        throw new Error('更新预约状态失败');
      }

      const updatedBooking = await response.json();

      // 更新本地状态
      setBookings(prev => 
        prev.map(booking => 
          booking.id === selectedBooking.id ? updatedBooking : booking
        )
      );
      
      setIsStatusDialogOpen(false);
      setSelectedBooking(null);
      setNewStatus("");
      setStatusNote("");
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Get all unique booking types for filtering
  const allBookingTypes = Array.from(
    new Set(bookings.map(booking => booking.type))
  );

  const filteredBookings = bookings.filter(booking => {
    // Filter by search query
    if (searchQuery && 
        !booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !booking.photographerName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !booking.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false;
    }
    
    // Filter by type
    if (typeFilter !== "all" && booking.type !== typeFilter) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 hover:bg-green-50";
      case "pending":
        return "bg-yellow-50 text-yellow-700 hover:bg-yellow-50";
      case "completed":
        return "bg-blue-50 text-blue-700 hover:bg-blue-50";
      case "cancelled":
        return "bg-red-50 text-red-700 hover:bg-red-50";
      default:
        return "bg-gray-50 text-gray-700 hover:bg-gray-50";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "已确认";
      case "pending":
        return "待确认";
      case "completed":
        return "已完成";
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">预约管理</h2>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">全部预约</TabsTrigger>
          <TabsTrigger value="pending">待确认</TabsTrigger>
          <TabsTrigger value="confirmed">已确认</TabsTrigger>
          <TabsTrigger value="completed">已完成</TabsTrigger>
          <TabsTrigger value="cancelled">已取消</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>预约列表</CardTitle>
              <CardDescription>
                管理所有客户的摄影预约，包括确认、取消和完成预约。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索客户、摄影师或地点..."
                    className="w-full md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="预约状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="pending">待确认</SelectItem>
                      <SelectItem value="confirmed">已确认</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="预约类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {allBookingTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : paginatedBookings.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>客户</TableHead>
                        <TableHead>摄影师</TableHead>
                        <TableHead>日期和时间</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>地点</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{booking.clientName?.charAt(0) || ''}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{booking.clientName || '未命名客户'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{booking.photographerName?.charAt(0) || ''}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{booking.photographerName || '未命名摄影师'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{booking.date}</div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                <span>{booking.startTime} - {booking.endTime}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{booking.type}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>{booking.location || '未知地点'}</div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <MapPin className="mr-1 h-3 w-3" />
                                <span>{booking.locationAddress || '未知地址'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusBadgeClass(booking.status)}
                            >
                              {getStatusText(booking.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <User className="mr-2 h-4 w-4" /> 查看客户
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Camera className="mr-2 h-4 w-4" /> 查看摄影师
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {booking.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setNewStatus("confirmed");
                                      setIsStatusDialogOpen(true);
                                    }}
                                  >
                                    <Check className="mr-2 h-4 w-4" /> 确认预约
                                  </DropdownMenuItem>
                                )}
                                {(booking.status === "pending" || booking.status === "confirmed") && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedBooking(booking);
                                        setNewStatus("completed");
                                        setIsStatusDialogOpen(true);
                                      }}
                                    >
                                      <Check className="mr-2 h-4 w-4" /> 标记为已完成
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedBooking(booking);
                                        setNewStatus("cancelled");
                                        setIsStatusDialogOpen(true);
                                      }}
                                    >
                                      <X className="mr-2 h-4 w-4" /> 取消预约
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
                  <Calendar className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">未找到匹配的预约</p>
                </div>
              )}

              {filteredBookings.length > 0 && (
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <div className="text-sm text-muted-foreground">
                    显示 {paginatedBookings.length} 条，共 {filteredBookings.length} 条
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 其他标签页内容与全部预约类似，但已预先筛选 */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>待确认预约</CardTitle>
              <CardDescription>需要确认的新预约请求。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>客户</TableHead>
                      <TableHead>摄影师</TableHead>
                      <TableHead>日期和时间</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings
                      .filter(booking => booking.status === "pending")
                      .map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.clientName || '未命名客户'}</TableCell>
                          <TableCell>{booking.photographerName || '未命名摄影师'}</TableCell>
                          <TableCell>
                            {booking.date} {booking.startTime}
                          </TableCell>
                          <TableCell>{booking.type}</TableCell>
                          <TableCell>{booking.createdAt}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setNewStatus("confirmed");
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              确认
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === "confirmed" && "确认预约"}
              {newStatus === "completed" && "完成预约"}
              {newStatus === "cancelled" && "取消预约"}
            </DialogTitle>
            <DialogDescription>
              {newStatus === "confirmed" && "确认此预约并通知客户和摄影师。"}
              {newStatus === "completed" && "将此预约标记为已完成。"}
              {newStatus === "cancelled" && "取消此预约并通知相关人员。"}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="py-4">
              <div className="mb-4 rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">客户:</p>
                    <p>{selectedBooking.clientName || '未命名客户'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">摄影师:</p>
                    <p>{selectedBooking.photographerName || '未命名摄影师'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">日期时间:</p>
                    <p>{selectedBooking.date} {selectedBooking.startTime}-{selectedBooking.endTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">类型:</p>
                    <p>{selectedBooking.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">地点:</p>
                    <p>{selectedBooking.location || '未知地点'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">价格:</p>
                    <p>¥{selectedBooking.price || '未知价格'}</p>
                  </div>
                </div>
              </div>

              {newStatus === "cancelled" && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                    <p className="text-sm font-medium">取消原因</p>
                  </div>
                  <Textarea
                    placeholder="请输入取消预约的原因..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              )}

              {newStatus === "completed" && (
                <div className="mb-4">
                  <div className="mb-2 flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium">完成备注</p>
                  </div>
                  <Textarea
                    placeholder="可以添加关于此次预约的备注..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleStatusChange}>
              {newStatus === "confirmed" && "确认预约"}
              {newStatus === "completed" && "标记为已完成"}
              {newStatus === "cancelled" && "取消预约"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
