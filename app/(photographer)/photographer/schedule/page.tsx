"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { bookingService } from "@/lib/services";
import { Booking } from "@/lib/types";

export default function PhotographerSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<Booking[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    clientName: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    type: "婚纱照",
    notes: "",
  });
  const [viewMode, setViewMode] = useState("month"); // month or list
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取日程数据
  useEffect(() => {
    fetchScheduleData();
  }, [currentDate]);

  const fetchScheduleData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 获取当前月份的开始和结束日期
      const firstDay = startOfMonth(currentDate);
      const lastDay = endOfMonth(currentDate);
      
      // 构建查询参数
      const params = {
        startDate: format(firstDay, "yyyy-MM-dd"),
        endDate: format(lastDay, "yyyy-MM-dd")
      };
      
      // 获取摄影师预约数据
      const bookings = await bookingService.getPhotographerBookings(params);
      setScheduleData(bookings);
    } catch (error) {
      console.error('获取日程数据失败:', error);
      setError('获取日程数据失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Generate days for the current month view
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

  // Handle adding a new event
  const handleAddEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 准备预约数据
      const bookingData = {
        title: newEvent.title,
        clientName: newEvent.clientName,
        date: newEvent.date,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        location: newEvent.location,
        type: newEvent.type,
        notes: newEvent.notes,
        status: "confirmed" // 默认状态为已确认
      };
      
      // 创建新预约
      await bookingService.createBooking(bookingData);
      
      // 重新获取日程数据
      await fetchScheduleData();
      
      // 关闭对话框并重置表单
      setIsAddEventOpen(false);
      setNewEvent({
        title: "",
        clientName: "",
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        type: "婚纱照",
        notes: "",
      });
    } catch (error) {
      console.error('创建预约失败:', error);
      setError('创建预约失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const formattedDay = format(day, "yyyy-MM-dd");
    return scheduleData.filter((event) => event.date === formattedDay);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">日程安排</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "month" ? "list" : "month")}>
            {viewMode === "month" ? "列表视图" : "月历视图"}
          </Button>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                添加日程
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>添加新日程</DialogTitle>
                <DialogDescription>填写以下信息添加新的拍摄日程</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="拍摄标题"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientName">客户姓名</Label>
                  <Input
                    id="clientName"
                    value={newEvent.clientName}
                    onChange={(e) => setNewEvent({ ...newEvent, clientName: e.target.value })}
                    placeholder="客户姓名"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">日期</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">拍摄类型</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    >
                      <option value="婚纱照">婚纱照</option>
                      <option value="全家福">全家福</option>
                      <option value="艺术人像">艺术人像</option>
                      <option value="证件照">证件照</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">开始时间</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">结束时间</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">地点</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="拍摄地点"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">备注</Label>
                  <Input
                    id="notes"
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    placeholder="其他备注信息"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>取消</Button>
                <Button onClick={handleAddEvent} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      添加中...
                    </>
                  ) : "添加"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {isLoading && viewMode === "month" ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex h-[600px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === "month" ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {format(currentDate, "yyyy年MM月", { locale: zhCN })}
              </h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={goToCurrentMonth}>
                  今天
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar header - weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                <div key={day} className="py-2 text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Add empty cells for days before the start of the month */}
              {Array.from({ length: firstDayOfMonth.getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="h-24 p-1" />
              ))}

              {/* Actual days of the month */}
              {daysInMonth.map((day) => {
                const events = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    className={`h-24 overflow-hidden rounded-md border p-1 ${
                      isCurrentMonth ? "" : "opacity-50"
                    } ${isCurrentDay ? "bg-primary/10 border-primary" : ""}`}
                  >
                    <div className="text-right text-sm">
                      {format(day, "d")}
                    </div>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-20px)]">
                      {events.map((event) => (
                        <Popover key={event.id}>
                          <PopoverTrigger asChild>
                            <div
                              className="cursor-pointer rounded-sm bg-primary/20 px-1 py-0.5 text-xs text-primary-foreground truncate"
                              title={event.title}
                            >
                              {event.startTime} {event.title}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold">{event.title || `${event.clientName}的预约`}</h4>
                              <div className="text-sm">
                                <p><span className="font-medium">客户:</span> {event.clientName}</p>
                                <p><span className="font-medium">日期:</span> {event.date}</p>
                                <p><span className="font-medium">时间:</span> {event.startTime} - {event.endTime}</p>
                                <p><span className="font-medium">地点:</span> {event.location || "未指定地点"}</p>
                                <p><span className="font-medium">类型:</span> {event.type}</p>
                                {event.notes && <p><span className="font-medium">备注:</span> {event.notes}</p>}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Add empty cells for days after the end of the month */}
              {Array.from({ length: 6 - lastDayOfMonth.getDay() }).map((_, index) => (
                <div key={`empty-end-${index}`} className="h-24 p-1" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>即将到来的预约</CardTitle>
              <CardDescription>查看您的预约日程安排</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleData.length > 0 ? (
                <div className="space-y-4">
                  {scheduleData
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{event.title || `${event.clientName}的预约`}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {format(new Date(event.date), "yyyy年MM月dd日", {
                              locale: zhCN,
                            })}
                            <span className="mx-1">·</span>
                            <Clock className="mr-1 h-3 w-3" />
                            {event.startTime} - {event.endTime}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {event.location || "未指定地点"}
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/photographer/bookings/${event.id}`}>
                            查看详情
                          </Link>
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                  <CalendarIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">暂无预约</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsAddEventOpen(true)}>
                    添加日程
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
