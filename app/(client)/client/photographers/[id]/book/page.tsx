"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, addDays, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon, ArrowLeft, Clock, Info } from "lucide-react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Photographer } from "@/lib/types";

// Mock data for demonstration
const mockPhotographers: Record<string, Photographer> = {
  "1": {
    id: "1",
    name: "张伟",
    phone: "13800138001",
    email: "zhang@example.com",
    role: "photographer",
    bio: "专注于婚纱摄影和艺术人像，有10年拍摄经验。",
    specialties: ["婚纱摄影", "艺术人像", "户外写真"],
    portfolio: [],
    availability: [
      {
        id: "a1",
        photographerId: "1",
        date: "2025-05-01",
        startTime: "09:00",
        endTime: "12:00",
        isBooked: false,
      },
      {
        id: "a2",
        photographerId: "1",
        date: "2025-05-01",
        startTime: "14:00",
        endTime: "17:00",
        isBooked: false,
      },
      {
        id: "a3",
        photographerId: "1",
        date: "2025-05-02",
        startTime: "09:00",
        endTime: "12:00",
        isBooked: true,
      },
      {
        id: "a4",
        photographerId: "1",
        date: "2025-05-02",
        startTime: "14:00",
        endTime: "17:00",
        isBooked: false,
      },
      {
        id: "a5",
        photographerId: "1",
        date: "2025-05-03",
        startTime: "09:00",
        endTime: "12:00",
        isBooked: false,
      },
      {
        id: "a6",
        photographerId: "1",
        date: "2025-05-03",
        startTime: "14:00",
        endTime: "17:00",
        isBooked: false,
      },
      {
        id: "a7",
        photographerId: "1",
        date: "2025-05-04",
        startTime: "09:00",
        endTime: "12:00",
        isBooked: false,
      },
      {
        id: "a8",
        photographerId: "1",
        date: "2025-05-04",
        startTime: "14:00",
        endTime: "17:00",
        isBooked: true,
      },
      {
        id: "a9",
        photographerId: "1",
        date: "2025-05-05",
        startTime: "09:00",
        endTime: "12:00",
        isBooked: false,
      },
    ],
    rating: 4.8,
    reviews: [],
    createdAt: "2023-01-15",
    updatedAt: "2024-04-15",
  },
};

// Shoot types
const shootTypes = [
  {
    id: "wedding",
    name: "婚纱摄影",
    description: "婚纱照拍摄，包括室内影棚和户外取景",
    duration: 180, // minutes
    price: 2999,
  },
  {
    id: "portrait",
    name: "艺术人像",
    description: "个人艺术写真，展现个性与魅力",
    duration: 120, // minutes
    price: 1999,
  },
  {
    id: "family",
    name: "全家福",
    description: "家庭合影，记录美好家庭时光",
    duration: 90, // minutes
    price: 1599,
  },
  {
    id: "outdoor",
    name: "户外写真",
    description: "自然风光中的人像摄影",
    duration: 150, // minutes
    price: 2499,
  },
];

// Locations
const locations = [
  {
    id: "studio1",
    name: "市中心影棚",
    address: "市中心商业区A座5楼",
    description: "专业摄影棚，多种场景布置",
  },
  {
    id: "studio2",
    name: "花园影棚",
    address: "郊区花园路88号",
    description: "自然光线充足，花园环境优美",
  },
  {
    id: "outdoor1",
    name: "海滨公园",
    address: "海滨大道东段",
    description: "海景拍摄，日落美景",
  },
  {
    id: "outdoor2",
    name: "古镇老街",
    address: "老城区文化街",
    description: "古典建筑，文艺氛围浓厚",
  },
];

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedShootType, setSelectedShootType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setPhotographer(mockPhotographers[id as string] || null);
      setIsLoading(false);
    }, 1000);

    // In a real app, you would fetch photographer data from your API
    // const fetchPhotographer = async () => {
    //   try {
    //     const response = await fetch(`/api/photographers/${id}`);
    //     const data = await response.json();
    //     setPhotographer(data);
    //   } catch (error) {
    //     console.error('Error fetching photographer:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    //
    // fetchPhotographer();

    return () => clearTimeout(timer);
  }, [id]);

  // Get available dates from photographer's availability
  const availableDates = photographer
    ? Array.from(
        new Set(photographer.availability.map((slot) => slot.date))
      ).map((dateStr) => new Date(dateStr))
    : [];

  // Get time slots for selected date
  const timeSlots = photographer && selectedDate
    ? photographer.availability.filter(
        (slot) => 
          slot.date === format(selectedDate, "yyyy-MM-dd") && 
          !slot.isBooked
      )
    : [];

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };

  // Handle booking submission
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedShootType || !selectedLocation) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would submit the booking to your API
      // const response = await fetch('/api/bookings', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     photographerId: id,
      //     date: format(selectedDate, 'yyyy-MM-dd'),
      //     timeSlotId: selectedTimeSlot,
      //     shootTypeId: selectedShootType,
      //     locationId: selectedLocation,
      //     notes,
      //   }),
      // });
      //
      // const data = await response.json();
      //
      // if (!response.ok) {
      //   throw new Error(data.message || '预约失败');
      // }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to booking confirmation page
      router.push(`/client/bookings/confirmation?id=new-booking-id`);
    } catch (error) {
      console.error('Error submitting booking:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected shoot type details
  const selectedShootTypeDetails = shootTypes.find(
    (type) => type.id === selectedShootType
  );

  // Get selected location details
  const selectedLocationDetails = locations.find(
    (location) => location.id === selectedLocation
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-[60vh] w-full animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">未找到摄影师</h2>
        <p className="text-muted-foreground">该摄影师不存在或已被删除</p>
        <Button className="mt-4" asChild>
          <Link href="/client/photographers">返回摄影师列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/client/photographers/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">预约摄影师</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Booking form */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>预约信息</CardTitle>
              <CardDescription>
                请选择拍摄日期、时间和类型
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-6">
                  {/* Date selection */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">选择日期</h3>
                    <div className="rounded-md border">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        locale={zhCN}
                        disabled={(date) => {
                          // Disable dates that are not in the available dates
                          return !availableDates.some((availableDate) =>
                            isSameDay(date, availableDate)
                          );
                        }}
                        modifiers={{
                          available: availableDates,
                        }}
                        modifiersClassNames={{
                          available: "bg-primary/10 text-primary font-medium",
                        }}
                        fromDate={new Date()}
                        toDate={addDays(new Date(), 60)}
                      />
                    </div>
                  </div>

                  {/* Time slot selection */}
                  {selectedDate && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">选择时间段</h3>
                      {timeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedTimeSlot === slot.id ? "default" : "outline"}
                              className="justify-start"
                              onClick={() => setSelectedTimeSlot(slot.id)}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {slot.startTime} - {slot.endTime}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-20 flex-col items-center justify-center rounded-md border border-dashed">
                          <p className="text-sm text-muted-foreground">
                            所选日期没有可用的时间段
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={!selectedDate || !selectedTimeSlot}
                    onClick={() => setStep(2)}
                  >
                    下一步：选择拍摄类型
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  {/* Shoot type selection */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">选择拍摄类型</h3>
                    <div className="grid gap-2">
                      {shootTypes.map((type) => (
                        <div
                          key={type.id}
                          className={cn(
                            "flex cursor-pointer items-start justify-between rounded-lg border p-4 transition-colors",
                            selectedShootType === type.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedShootType(type.id)}
                        >
                          <div>
                            <h4 className="font-medium">{type.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                            <div className="mt-1 flex items-center text-sm">
                              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {Math.floor(type.duration / 60)}小时
                                {type.duration % 60 > 0
                                  ? ` ${type.duration % 60}分钟`
                                  : ""}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold">
                              ¥{type.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="w-1/2"
                      onClick={() => setStep(1)}
                    >
                      上一步
                    </Button>
                    <Button
                      className="w-1/2"
                      disabled={!selectedShootType}
                      onClick={() => setStep(3)}
                    >
                      下一步：选择拍摄地点
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  {/* Location selection */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">选择拍摄地点</h3>
                    <div className="grid gap-2">
                      {locations.map((location) => (
                        <div
                          key={location.id}
                          className={cn(
                            "flex cursor-pointer items-start justify-between rounded-lg border p-4 transition-colors",
                            selectedLocation === location.id
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedLocation(location.id)}
                        >
                          <div>
                            <h4 className="font-medium">{location.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {location.description}
                            </p>
                            <div className="mt-1 flex items-center text-sm">
                              <Info className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {location.address}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional notes */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">备注信息（可选）</h3>
                    <Textarea
                      placeholder="请输入您的特殊要求或其他需要摄影师了解的信息..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="w-1/2"
                      onClick={() => setStep(2)}
                    >
                      上一步
                    </Button>
                    <Button
                      className="w-1/2"
                      disabled={!selectedLocation || isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? "提交中..." : "确认预约"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking summary */}
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>预约摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{photographer.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{photographer.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {photographer.specialties.join(", ")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedDate && (
                  <div className="flex items-start space-x-2">
                    <CalendarIcon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">日期</p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedDate, "yyyy年MM月dd日 EEEE", {
                          locale: zhCN,
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {selectedTimeSlot && (
                  <div className="flex items-start space-x-2">
                    <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">时间</p>
                      <p className="text-sm text-muted-foreground">
                        {timeSlots.find((slot) => slot.id === selectedTimeSlot)?.startTime} - 
                        {timeSlots.find((slot) => slot.id === selectedTimeSlot)?.endTime}
                      </p>
                    </div>
                  </div>
                )}

                {selectedShootTypeDetails && (
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5 h-4 w-4 text-muted-foreground">📷</div>
                    <div>
                      <p className="font-medium">拍摄类型</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedShootTypeDetails.name} - 
                        {Math.floor(selectedShootTypeDetails.duration / 60)}小时
                        {selectedShootTypeDetails.duration % 60 > 0
                          ? ` ${selectedShootTypeDetails.duration % 60}分钟`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}

                {selectedLocationDetails && (
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5 h-4 w-4 text-muted-foreground">📍</div>
                    <div>
                      <p className="font-medium">拍摄地点</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedLocationDetails.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedLocationDetails.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedShootTypeDetails && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">总价</span>
                    <span className="text-xl font-bold">
                      ¥{selectedShootTypeDetails.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    预约成功后，您需要支付30%的定金（¥
                    {(selectedShootTypeDetails.price * 0.3).toFixed(2)}）
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
