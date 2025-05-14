"use client";

import { useState, useEffect } from "react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, getDay, getDate, isToday, isSameMonth } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  MapPin,
  Users,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// 视图类型定义
type CalendarView = "day" | "week" | "month";

// 预约状态类型
type AppointmentStatus = "confirmed" | "pending" | "completed" | "cancelled";

// 预约接口定义
interface Appointment {
  id: string;
  title: string;
  photographer: string;
  photographerId: string;
  client: string;
  clientId: string;
  date: Date;
  startTime: string; // 格式：HH:mm
  endTime: string; // 格式：HH:mm
  location: string;
  status: AppointmentStatus;
  type: string; // 例如：婚纱照、儿童写真等
  notes?: string;
}

// 休假接口定义
interface Vacation {
  id: string;
  photographerId: string;
  photographer: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}

// 摄影师接口定义
interface Photographer {
  id: string;
  name: string;
  specialties: string[];
  availability: "available" | "unavailable";
  color: string; // 用于日历中显示的颜色
}

// 模拟摄影师数据
const mockPhotographers: Photographer[] = [
  {
    id: "p1",
    name: "张伟",
    specialties: ["婚纱照", "艺术人像"],
    availability: "available",
    color: "#4f46e5", // Indigo
  },
  {
    id: "p2",
    name: "李娜",
    specialties: ["全家福", "儿童摄影"],
    availability: "available",
    color: "#0891b2", // Cyan
  },
  {
    id: "p3",
    name: "王刚",
    specialties: ["户外写真", "风景摄影"],
    availability: "available",
    color: "#16a34a", // Green
  },
  {
    id: "p4",
    name: "赵敏",
    specialties: ["时尚写真", "商业摄影"],
    availability: "unavailable",
    color: "#db2777", // Pink
  },
  {
    id: "p5",
    name: "陈静",
    specialties: ["婚礼跟拍", "纪实摄影"],
    availability: "available",
    color: "#f59e0b", // Amber
  },
];

// 模拟预约数据
const today = new Date();
const mockAppointments: Appointment[] = [
  {
    id: "a1",
    title: "婚纱照拍摄",
    photographer: "张伟",
    photographerId: "p1",
    client: "王小明与李小红",
    clientId: "c1",
    date: today,
    startTime: "09:00",
    endTime: "12:00",
    location: "市中心影棚",
    status: "confirmed",
    type: "婚纱照",
  },
  {
    id: "a2",
    title: "儿童写真",
    photographer: "李娜",
    photographerId: "p2",
    client: "张小华",
    clientId: "c3",
    date: addDays(today, 1),
    startTime: "14:00",
    endTime: "16:00",
    location: "花园影棚",
    status: "confirmed",
    type: "儿童写真",
  },
  {
    id: "a3",
    title: "全家福拍摄",
    photographer: "李娜",
    photographerId: "p2",
    client: "赵小刚",
    clientId: "c4",
    date: today,
    startTime: "13:00",
    endTime: "15:00",
    location: "花园影棚",
    status: "pending",
    type: "全家福",
  },
  {
    id: "a4",
    title: "产品摄影",
    photographer: "赵敏",
    photographerId: "p4",
    client: "科技有限公司",
    clientId: "c5",
    date: addDays(today, -1),
    startTime: "10:00",
    endTime: "12:00",
    location: "商业影棚",
    status: "completed",
    type: "商业摄影",
  },
  {
    id: "a5",
    title: "户外风景写真",
    photographer: "王刚",
    photographerId: "p3",
    client: "刘小军",
    clientId: "c5",
    date: addDays(today, 2),
    startTime: "08:00",
    endTime: "11:00",
    location: "城市公园",
    status: "confirmed",
    type: "户外写真",
  },
  {
    id: "a6",
    title: "婚礼跟拍",
    photographer: "陈静",
    photographerId: "p5",
    client: "陈小芳",
    clientId: "c6",
    date: addDays(today, 3),
    startTime: "10:00",
    endTime: "16:00",
    location: "喜悦酒店",
    status: "confirmed",
    type: "婚礼跟拍",
  },
];

// 模拟休假数据
const mockVacations: Vacation[] = [
  {
    id: "v1",
    photographerId: "p4",
    photographer: "赵敏",
    startDate: addDays(today, -2),
    endDate: addDays(today, 5),
    reason: "年假",
  },
  {
    id: "v2",
    photographerId: "p1",
    photographer: "张伟",
    startDate: addDays(today, 5),
    endDate: addDays(today, 7),
    reason: "培训",
  },
];

// 获取预约状态样式
const getAppointmentStatusStyle = (status: AppointmentStatus) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

// 获取日程项目样式
const getScheduleItemStyle = (photographer: Photographer) => {
  return {
    backgroundColor: `${photographer.color}15`, // 15 为透明度
    borderColor: photographer.color,
    borderLeftWidth: "3px",
  };
};

// 获取状态文本
const getStatusText = (status: AppointmentStatus) => {
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
      return "未知";
  }
};

export default function PhotographerSchedulePage() {
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPhotographer, setSelectedPhotographer] = useState<string>("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载预约和休假数据
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppointments(mockAppointments);
      setVacations(mockVacations);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 筛选摄影师的预约
  const filteredAppointments = appointments.filter(appointment => 
    selectedPhotographer === "all" || appointment.photographerId === selectedPhotographer
  );

  // 筛选摄影师的休假
  const filteredVacations = vacations.filter(vacation => 
    selectedPhotographer === "all" || vacation.photographerId === selectedPhotographer
  );

  // 获取当前视图的日期范围
  const getDateRange = () => {
    switch (view) {
      case "day":
        return [currentDate];
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // 从周一开始
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case "month":
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return eachDayOfInterval({ start: monthStart, end: monthEnd });
      default:
        return [currentDate];
    }
  };

  // 日期导航
  const navigatePrevious = () => {
    switch (view) {
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        const prevMonth = new Date(currentDate);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentDate(prevMonth);
        break;
    }
  };

  const navigateNext = () => {
    switch (view) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentDate(nextMonth);
        break;
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // 根据日期获取当天的预约
  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(appointment => 
      isSameDay(appointment.date, date)
    );
  };

  // 检查日期是否在休假范围内
  const isDateInVacation = (date: Date, photographerId: string) => {
    return filteredVacations.some(vacation => 
      vacation.photographerId === photographerId &&
      date >= vacation.startDate &&
      date <= vacation.endDate
    );
  };

  // 获取摄影师的颜色
  const getPhotographerColor = (photographerId: string) => {
    const photographer = mockPhotographers.find(p => p.id === photographerId);
    return photographer ? photographer.color : "#6b7280"; // Default gray color
  };

  // 渲染日视图
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="mt-4">
        <div className="rounded-md border bg-white overflow-hidden">
          <div className="grid grid-cols-[80px_1fr] divide-x">
            <div className="font-medium py-2 px-3 bg-gray-50 text-center">
              时间
            </div>
            <div className="font-medium py-2 px-3 bg-gray-50 text-center">
              {format(currentDate, "yyyy年MM月dd日 EEEE", { locale: zhCN })}
            </div>
          </div>
          <div className="divide-y">
            {hours.map(hour => {
              const timeString = `${hour.toString().padStart(2, "0")}:00`;
              const hoursAppointments = dayAppointments.filter(
                appointment => appointment.startTime.startsWith(hour.toString().padStart(2, "0"))
              );

              return (
                <div key={hour} className="grid grid-cols-[80px_1fr] divide-x">
                  <div className="py-4 px-2 text-sm text-center text-gray-500">
                    {timeString}
                  </div>
                  <div className="p-2 min-h-[80px] bg-gray-50 relative">
                    {hoursAppointments.map(appointment => {
                      const photographer = mockPhotographers.find(
                        p => p.id === appointment.photographerId
                      );
                      return (
                        <div
                          key={appointment.id}
                          className="p-2 mb-1 rounded-md border text-sm"
                          style={photographer ? getScheduleItemStyle(photographer) : {}}
                        >
                          <div className="font-medium">{appointment.title}</div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{appointment.startTime} - {appointment.endTime}</span>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <User className="mr-1 h-3 w-3" />
                            <span>{appointment.photographer}</span>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>{appointment.location}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-1 text-xs"
                          >
                            {getStatusText(appointment.status)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 渲染周视图
  const renderWeekView = () => {
    const dateRange = getDateRange();
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

    return (
      <div className="mt-4">
        <div className="rounded-md border bg-white overflow-hidden">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] divide-x">
            <div className="font-medium py-2 px-3 bg-gray-50 text-center">
              时间
            </div>
            {dateRange.map(date => (
              <div
                key={date.toISOString()}
                className={`font-medium py-2 px-3 text-center ${isToday(date) ? "bg-blue-50" : "bg-gray-50"}`}
              >
                <div>{format(date, "EEE", { locale: zhCN })}</div>
                <div className={`text-sm ${isToday(date) ? "text-blue-600 font-bold" : "text-gray-500"}`}>
                  {format(date, "MM/dd")}
                </div>
              </div>
            ))}
          </div>
          <div className="divide-y">
            {hours.map(hour => {
              const timeString = `${hour.toString().padStart(2, "0")}:00`;
              
              return (
                <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] divide-x">
                  <div className="py-4 px-2 text-sm text-center text-gray-500">
                    {timeString}
                  </div>
                  {dateRange.map(date => {
                    const hoursAppointments = getAppointmentsForDate(date).filter(
                      appointment => appointment.startTime.startsWith(hour.toString().padStart(2, "0"))
                    );

                    // 获取当天在休假的摄影师
                    const vacationPhotographers = selectedPhotographer === "all"
                      ? mockPhotographers.filter(p => isDateInVacation(date, p.id))
                      : mockPhotographers.filter(p => p.id === selectedPhotographer && isDateInVacation(date, p.id));

                    return (
                      <div
                        key={date.toISOString()}
                        className={`p-1 min-h-[80px] ${isToday(date) ? "bg-blue-50/30" : "bg-gray-50"} relative`}
                      >
                        {/* 显示预约 */}
                        {hoursAppointments.map(appointment => {
                          const photographer = mockPhotographers.find(
                            p => p.id === appointment.photographerId
                          );
                          return (
                            <div
                              key={appointment.id}
                              className="p-1 mb-1 rounded-md border text-xs"
                              style={photographer ? getScheduleItemStyle(photographer) : {}}
                            >
                              <div className="font-medium truncate">{appointment.title}</div>
                              <div className="flex items-center mt-0.5 text-xs text-gray-500">
                                <Clock className="mr-0.5 h-2.5 w-2.5" />
                                <span className="truncate">{appointment.startTime} - {appointment.endTime}</span>
                              </div>
                            </div>
                          );
                        })}

                        {/* 显示休假信息 */}
                        {hour === 8 && vacationPhotographers.length > 0 && (
                          <div className="p-1 mb-1 rounded-md border bg-gray-100 text-xs">
                            <div className="font-medium text-red-500">休假:</div>
                            {vacationPhotographers.map(photographer => (
                              <div key={photographer.id} className="truncate">
                                {photographer.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 渲染月视图
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    for (let i = 0; i < dateRange.length; i += 7) {
      weeks.push(dateRange.slice(i, i + 7));
    }

    const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

    return (
      <div className="mt-4">
        <div className="rounded-md border bg-white overflow-hidden">
          <div className="grid grid-cols-7 divide-x">
            {weekDays.map(day => (
              <div key={day} className="font-medium py-2 px-3 bg-gray-50 text-center">
                {day}
              </div>
            ))}
          </div>
          <div className="divide-y">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 divide-x">
                {week.map(date => {
                  const dayAppointments = getAppointmentsForDate(date);
                  const isCurrentMonth = isSameMonth(date, currentDate);
                  
                  // 获取当天在休假的摄影师
                  const vacationPhotographers = selectedPhotographer === "all"
                    ? mockPhotographers.filter(p => isDateInVacation(date, p.id))
                    : mockPhotographers.filter(p => p.id === selectedPhotographer && isDateInVacation(date, p.id));
                  
                  return (
                    <div
                      key={date.toISOString()}
                      className={`p-1 min-h-[120px] ${!isCurrentMonth ? "bg-gray-100" : isToday(date) ? "bg-blue-50/30" : ""} relative`}
                    >
                      <div
                        className={`text-center p-1 text-sm ${isToday(date) ? "bg-blue-500 text-white rounded-full w-6 h-6 mx-auto" : !isCurrentMonth ? "text-gray-400" : ""}`}
                      >
                        {getDate(date)}
                      </div>
                      
                      {/* 显示预约数量摘要 */}
                      {dayAppointments.length > 0 && (
                        <div className="mt-1">
                          {dayAppointments.length <= 3 ? (
                            dayAppointments.map(appointment => {
                              const color = getPhotographerColor(appointment.photographerId);
                              return (
                                <div
                                  key={appointment.id}
                                  className="p-1 mb-1 rounded-md border text-xs truncate"
                                  style={{ borderLeftColor: color, borderLeftWidth: "2px" }}
                                >
                                  {appointment.title}
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-1 rounded-md bg-gray-100 text-xs font-medium text-center">
                              {dayAppointments.length} 个预约
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* 显示休假信息 */}
                      {vacationPhotographers.length > 0 && (
                        <div className="mt-1">
                          <div className="p-1 rounded-md bg-red-50 text-xs font-medium text-center text-red-500 border border-red-200">
                            {vacationPhotographers.length} 人休假
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染当前视图
  const renderCurrentView = () => {
    switch (view) {
      case "day":
        return renderDayView();
      case "week":
        return renderWeekView();
      case "month":
        return renderMonthView();
      default:
        return renderWeekView();
    }
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">摄影师日程安排</h2>
          <p className="text-muted-foreground">
            查看和管理摄影师的工作日程、预约和休假安排。
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={navigateToday}>
                今天
              </Button>
              <Button variant="outline" size="sm" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {view === "day" && format(currentDate, "yyyy年MM月dd日", { locale: zhCN })}
                {view === "week" && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy年MM月dd日", { locale: zhCN })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MM月dd日", { locale: zhCN })}`}
                {view === "month" && format(currentDate, "yyyy年MM月", { locale: zhCN })}
              </h3>
            </div>
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              <Select
                value={selectedPhotographer}
                onValueChange={setSelectedPhotographer}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="选择摄影师" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有摄影师</SelectItem>
                  {mockPhotographers.map(photographer => (
                    <SelectItem key={photographer.id} value={photographer.id}>
                      {photographer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tabs value={view} onValueChange={(value) => setView(value as CalendarView)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="day">日</TabsTrigger>
                  <TabsTrigger value="week">周</TabsTrigger>
                  <TabsTrigger value="month">月</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <p className="text-muted-foreground">加载日程数据...</p>
            </div>
          ) : (
            renderCurrentView()
          )}
        </CardContent>
      </Card>

      {/* 图例 */}
      <Card>
        <CardHeader>
          <CardTitle>图例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {mockPhotographers.map(photographer => (
              <div key={photographer.id} className="flex items-center">
                <div
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: photographer.color }}
                />
                <span>{photographer.name}</span>
              </div>
            ))}
            <div className="flex items-center">
              <div className="w-4 h-4 rounded mr-2 bg-red-100 border border-red-300" />
              <span>休假</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
