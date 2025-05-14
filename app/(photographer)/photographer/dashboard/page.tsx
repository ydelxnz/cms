"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, addDays, startOfDay } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon, Camera, Clock, Image, Users, Star, Upload, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { bookingService, photoService, reviewService } from "@/lib/services";

interface PhotographerStats {
  totalSessions: number;
  totalPhotos: number;
  totalClients: number;
  averageRating: number;
}

export default function PhotographerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<PhotographerStats>({
    totalSessions: 0,
    totalPhotos: 0,
    totalClients: 0,
    averageRating: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 并行请求数据
        const [bookingsRes, sessionsRes, reviewsRes] = await Promise.all([
          bookingService.getPhotographerBookings({ upcoming: true, limit: 5 }),
          photoService.getPhotographerPhotoSessions('current'),
          reviewService.getPhotographerReviews('current')
        ]);
        
        setUpcomingBookings(bookingsRes);
        
        // 获取最近的会话（按日期排序并取最近的5个）
        const sortedSessions = sessionsRes
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentSessions(sortedSessions);
        
        // 获取最近的评价（按日期排序并取最近的5个）
        const sortedReviews = reviewsRes
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        setReviews(sortedReviews);
        
        // 计算统计数据
        const totalSessions = sessionsRes.length;
        const totalPhotos = sessionsRes.reduce((sum, session) => sum + (session.photos?.length || 0), 0);
        
        // 获取不重复的客户ID数量
        const uniqueClientIds = new Set(sessionsRes.map(session => session.clientId));
        const totalClients = uniqueClientIds.size;
        
        // 计算平均评分
        const averageRating = reviewsRes.length > 0
          ? reviewsRes.reduce((sum, review) => sum + review.rating, 0) / reviewsRes.length
          : 0;
        
        setStats({
          totalSessions,
          totalPhotos,
          totalClients,
          averageRating,
        });
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
        setError('获取数据失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">摄影师工作台</h2>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/photographer/upload">
              <Upload className="mr-2 h-4 w-4" />
              上传照片
            </Link>
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
            <CardTitle className="text-sm font-medium">拍摄总数</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                recentSessions.length > 0
                  ? `最近拍摄: ${format(new Date(recentSessions[0].date), "MM月dd日")}`
                  : "暂无拍摄记录"
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
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalPhotos}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                stats.totalSessions > 0
                  ? `平均每次拍摄 ${Math.round(stats.totalPhotos / stats.totalSessions)} 张照片`
                  : "暂无数据"
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">客户数量</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                upcomingBookings.length > 0
                  ? `即将到来的预约: ${upcomingBookings.length}`
                  : "暂无预约"
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均评分</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "暂无"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                reviews.length > 0
                  ? `基于 ${reviews.length} 条评价`
                  : "暂无评价"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming bookings */}
        <Card>
          <CardHeader>
            <CardTitle>即将到来的预约</CardTitle>
            <CardDescription>查看您的预约安排</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>加载中...</span>
              </div>
            ) : upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{booking.clientName?.slice(0, 2) || "客户"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{booking.clientName}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          <span>
                            {format(new Date(booking.date), "yyyy年MM月dd日")}，
                            {booking.startTime}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{booking.duration} 分钟 - {booking.type}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/photographer/bookings/${booking.id}`}>详情</Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/photographer/schedule">查看全部预约</Link>
                </Button>
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                <CalendarIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">暂无即将到来的预约</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/photographer/schedule">查看日程安排</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <CardTitle>最近的拍摄</CardTitle>
            <CardDescription>查看您最近的拍摄记录</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>加载中...</span>
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{session.clientName || "客户"}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          <span>{format(new Date(session.date), "yyyy年MM月dd日")}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Image className="mr-1 h-3 w-3" />
                          <span>{session.photos?.length || 0} 张照片</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/photographer/photos?session=${session.id}`}>查看照片</Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/photographer/photos">查看全部照片</Link>
                </Button>
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                <Image className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">暂无拍摄记录</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/photographer/schedule">查看日程安排</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent reviews */}
      <Card>
        <CardHeader>
          <CardTitle>最近评价</CardTitle>
          <CardDescription>查看客户对您的评价</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>加载中...</span>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarFallback>{review.clientName?.slice(0, 2) || "客户"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt), "yyyy年MM月dd日")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{review.comment}</p>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/photographer/reviews">查看全部评价</Link>
              </Button>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
              <Star className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">暂无评价</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
