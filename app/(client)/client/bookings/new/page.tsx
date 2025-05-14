"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService } from "@/lib/services";
import { bookingService } from "@/lib/services";
import { toast } from "@/components/ui/use-toast";
import { CalendarIcon, Clock, MapPin } from "lucide-react";

const photoshootTypes = [
  { id: "portrait", name: "个人写真" },
  { id: "wedding", name: "婚纱照" },
  { id: "family", name: "全家福" },
  { id: "event", name: "活动纪实" },
  { id: "commercial", name: "商业摄影" },
];

const timeSlots = [
  { id: "morning1", start: "09:00", end: "10:30" },
  { id: "morning2", start: "11:00", end: "12:30" },
  { id: "afternoon1", start: "13:30", end: "15:00" },
  { id: "afternoon2", start: "15:30", end: "17:00" },
  { id: "evening", start: "17:30", end: "19:00" },
];

const locations = [
  { id: "studio", name: "影楼内景" },
  { id: "park", name: "城市公园" },
  { id: "beach", name: "海滩" },
  { id: "mountain", name: "山景" },
  { id: "custom", name: "其他地点(请在备注中说明)" },
];

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const photographerId = searchParams.get("photographerId");

  const [photographer, setPhotographer] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (photographerId) {
      fetchPhotographer(photographerId);
    }
  }, [photographerId]);

  const fetchPhotographer = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await userService.getPhotographerById(id);
      setPhotographer(data);
    } catch (error) {
      console.error("获取摄影师数据失败:", error);
      toast({
        title: "错误",
        description: "获取摄影师数据失败，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !timeSlot || !type || !location || !photographerId) {
      toast({
        title: "请完成表单",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 获取选中的时间段
      const selectedTimeSlot = timeSlots.find(slot => slot.id === timeSlot);
      if (!selectedTimeSlot) {
        throw new Error("无效的时间段");
      }
      
      // 创建预约数据
      const bookingData = {
        photographerId,
        date: date.toISOString().split('T')[0], // 格式化为 YYYY-MM-DD
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        type,
        location,
        notes,
        status: "pending" as "pending" // 明确指定类型
      };
      
      // 提交预约
      await bookingService.createBooking(bookingData);
      
      toast({
        title: "预约成功",
        description: "您的拍摄预约已提交，请等待摄影师确认",
      });
      
      // 跳转到预约列表页面
      router.push("/client/bookings");
    } catch (error) {
      console.error("创建预约失败:", error);
      toast({
        title: "预约失败",
        description: "创建预约时发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold">创建新预约</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* 摄影师信息 */}
          <div className="md:col-span-1">
            {photographer ? (
              <Card>
                <CardHeader>
                  <CardTitle>摄影师信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={photographer.avatar} alt={`${photographer.name}的头像`} />
                      <AvatarFallback>{photographer.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold">{photographer.name}</h3>
                      <p className="text-sm text-muted-foreground">{photographer.specialties?.join(', ')}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">{photographer.bio}</p>
                  </div>
                </CardContent>
              </Card>
            ) : photographerId ? (
              <Card>
                <CardHeader>
                  <CardTitle>摄影师信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">摄影师信息加载失败</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>选择摄影师</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    请返回摄影师列表选择一位摄影师
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button onClick={() => router.push("/client/photographers")}>
                      浏览摄影师
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 预约表单 */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>预约信息</CardTitle>
                <CardDescription>填写预约详情安排拍摄</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* 拍摄类型 */}
                  <div className="space-y-2">
                    <Label htmlFor="type">拍摄类型</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择拍摄类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {photoshootTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 拍摄日期 */}
                  <div className="space-y-2">
                    <Label>选择日期</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'yyyy年MM月dd日') : <span>选择日期</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => {
                            // 禁用过去的日期和今天
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 时间段 */}
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">时间段</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择时间段" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.start} - {slot.end}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 拍摄地点 */}
                  <div className="space-y-2">
                    <Label htmlFor="location">拍摄地点</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择拍摄地点" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 备注 */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">备注信息（选填）</Label>
                    <Textarea
                      id="notes"
                      placeholder="请输入任何额外需求或具体要求..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "提交中..." : "提交预约"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 