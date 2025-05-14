"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Camera, Clock, Image, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { bookingService, photoService, orderService } from "@/lib/services";
import { Booking, PhotoSession, PrintOrder } from "@/lib/types";

export default function ClientDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<PhotoSession[]>([]);
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 并行请求数据
        const [bookingsRes, photosRes, ordersRes] = await Promise.all([
          bookingService.getClientBookings({ upcoming: true }),
          photoService.getClientPhotoSessions('current'), // 'current' 表示当前登录用户
          orderService.getClientOrders('current') // 'current' 表示当前登录用户
        ]);
        
        setUpcomingBookings(bookingsRes);
        setRecentPhotos(photosRes);
        setOrders(ordersRes);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        setError('获取数据失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // 计算照片总数
  const totalPhotos = recentPhotos.reduce((total, session) => total + (session.photos?.length || 0), 0);

  // 计算已完成拍摄数量
  const completedSessions = recentPhotos.filter(session => session.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">欢迎回来</h2>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/client/photographers">预约摄影师</Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">即将到来的预约</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                upcomingBookings.length > 0
                  ? `下一个预约: ${format(new Date(upcomingBookings[0].date), "MM月dd日")}`
                  : "暂无预约"
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">照片总数</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : totalPhotos}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                recentPhotos.length > 0
                  ? `最近更新: ${format(new Date(recentPhotos[0].updatedAt), "MM月dd日")}`
                  : "暂无照片"
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">打印订单</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                orders.length > 0
                  ? `最近订单: ${format(new Date(orders[0].createdAt), "MM月dd日")}`
                  : "暂无订单"
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成拍摄</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                completedSessions > 0 ? "查看全部拍摄记录" : "暂无拍摄记录"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Upcoming bookings */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>即将到来的预约</CardTitle>
            <CardDescription>查看您的预约安排</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">加载中...</div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{booking.photographerId.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{booking.photographerId}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>
                            {format(new Date(booking.date), "yyyy年MM月dd日")}，
                            {booking.startTime}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{booking.endTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                暂无即将到来的预约
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/client/photographers">预约摄影师</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent photos */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>最近照片</CardTitle>
            <CardDescription>查看您最近的照片</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">加载中...</div>
            ) : recentPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                {recentPhotos.slice(0, 6).map((session) => (
                  <Link
                    key={session.id}
                    href={`/client/photos?session=${session.id}`}
                    className="overflow-hidden rounded-md"
                  >
                    <div className="group relative aspect-square w-full overflow-hidden rounded-md bg-gray-100">
                      {session.photos && session.photos.length > 0 ? (
                        <img
                          src={session.photos[0].thumbnailUrl}
                          alt={session.photos[0].title || "照片"}
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Image className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-20" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white">
                        <p className="text-xs">{format(new Date(session.date), "yyyy-MM-dd")}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                暂无照片
              </div>
            )}
            {recentPhotos.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/client/photos">查看全部照片</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
