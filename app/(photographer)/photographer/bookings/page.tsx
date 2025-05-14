"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, isAfter, isBefore, isToday, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Filter, 
  Search, 
  ArrowDownAZ, 
  ArrowUpAZ,
  Plus,
  Loader2,
  ArrowRight,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { bookingService } from "@/lib/services";
import { Booking } from "@/lib/types";

export default function PhotographerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // 获取预约数据
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await bookingService.getPhotographerBookings();
        setBookings(response);
        
      } catch (error) {
        console.error('获取预约数据失败:', error);
        setError('获取预约数据失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  // 根据筛选条件过滤预约
  useEffect(() => {
    let filtered = [...bookings];
    
    // 按搜索词筛选（客户名称、地点、类型）
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        (booking.clientName?.toLowerCase().includes(term)) ||
        (booking.location?.toLowerCase().includes(term)) ||
        (booking.type?.toLowerCase().includes(term))
      );
    }
    
    // 按状态筛选
    if (statusFilter.length > 0) {
      filtered = filtered.filter(booking => statusFilter.includes(booking.status));
    }
    
    // 按标签页筛选
    if (activeTab === "upcoming") {
      filtered = filtered.filter(booking => 
        (booking.status === "pending" || booking.status === "confirmed") &&
        (isToday(parseISO(booking.date)) || isAfter(parseISO(booking.date), new Date()))
      );
    } else if (activeTab === "past") {
      filtered = filtered.filter(booking => 
        isBefore(parseISO(booking.date), new Date()) && !isToday(parseISO(booking.date))
      );
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter(booking => booking.status === "cancelled");
    }
    
    // 按日期排序
    filtered.sort((a, b) => {
      const dateA = new Date(a.date + "T" + a.startTime);
      const dateB = new Date(b.date + "T" + b.startTime);
      return sortOrder === "asc" 
        ? dateA.getTime() - dateB.getTime() 
        : dateB.getTime() - dateA.getTime();
    });
    
    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, activeTab, sortOrder]);

  // 生成状态标签
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">待确认</span>;
      case "confirmed":
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">已确认</span>;
      case "completed":
        return <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">已完成</span>;
      case "cancelled":
        return <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">已取消</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">预约管理</h2>
        <div className="flex space-x-2">
          <Link href="/photographer/schedule">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              查看日历
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="搜索客户、地点或类型..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 px-2" aria-label="筛选">
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="space-y-2">
                <h4 className="font-medium">筛选条件</h4>
                <div className="space-y-1">
                  <label className="text-sm font-medium">预约状态</label>
                  <div className="flex flex-wrap gap-1">
                    {["pending", "confirmed", "completed", "cancelled"].map((status) => (
                      <Button
                        key={status}
                        variant={statusFilter.includes(status) ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setStatusFilter((prev) =>
                            prev.includes(status)
                              ? prev.filter((s) => s !== status)
                              : [...prev, status]
                          );
                        }}
                      >
                        {status === "pending" && "待确认"}
                        {status === "confirmed" && "已确认"}
                        {status === "completed" && "已完成"}
                        {status === "cancelled" && "已取消"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            className="h-9 px-2"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            aria-label="排序"
          >
            {sortOrder === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">即将到来</TabsTrigger>
          <TabsTrigger value="past">历史预约</TabsTrigger>
          <TabsTrigger value="cancelled">已取消</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>加载中...</span>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((booking) => (
                <Link key={booking.id} href={`/photographer/bookings/${booking.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{booking.clientName}</div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <CardDescription>
                        {format(new Date(booking.date), "yyyy年MM月dd日", { locale: zhCN })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{booking.location || "未指定地点"}</span>
                        </div>
                        <div className="mt-2 font-medium">{booking.type}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" size="sm" className="ml-auto">
                        查看详情
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10">
              <CalendarIcon className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">暂无预约</p>
              <Link href="/photographer/schedule">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  查看日历
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>加载中...</span>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((booking) => (
                <Link key={booking.id} href={`/photographer/bookings/${booking.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{booking.clientName}</div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <CardDescription>
                        {format(new Date(booking.date), "yyyy年MM月dd日", { locale: zhCN })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{booking.location || "未指定地点"}</span>
                        </div>
                        <div className="mt-2 font-medium">{booking.type}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" size="sm" className="ml-auto">
                        查看详情
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10">
              <CalendarIcon className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">暂无历史预约</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>加载中...</span>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((booking) => (
                <Link key={booking.id} href={`/photographer/bookings/${booking.id}`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{booking.clientName}</div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <CardDescription>
                        {format(new Date(booking.date), "yyyy年MM月dd日", { locale: zhCN })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          <span>{booking.location || "未指定地点"}</span>
                        </div>
                        <div className="mt-2 font-medium">{booking.type}</div>
                        {booking.notes && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            取消原因: {booking.notes}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" size="sm" className="ml-auto">
                        查看详情
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10">
              <CalendarIcon className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">暂无已取消的预约</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 