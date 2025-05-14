"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Users,
  Camera,
  Calendar,
  Image,
  Package,
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity,
  AlertCircle,
  Check,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminService, DashboardStats, ChartData, Alert } from "@/lib/services/adminService";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("bookings");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 并行请求数据
        const [statsRes, clientsRes, bookingsRes, ordersRes, alertsRes, chartDataRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentClients(),
          adminService.getRecentBookings(),
          adminService.getRecentOrders(),
          adminService.getAlerts(),
          adminService.getChartData()
        ]);
        
        setStats(statsRes);
        setRecentClients(clientsRes);
        setRecentBookings(bookingsRes);
        setRecentOrders(ordersRes);
        setAlerts(alertsRes);
        setChartData(chartDataRes);
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
        <h2 className="text-3xl font-bold tracking-tight">管理员仪表盘</h2>
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
            <CardTitle className="text-sm font-medium">客户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                `活跃客户: ${stats?.activeClients} (${Math.round((stats?.activeClients || 0) / (stats?.totalClients || 1) * 100)}%)`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">摄影师总数</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalPhotographers}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                `平均每位摄影师: ${Math.round((stats?.totalBookings || 0) / (stats?.totalPhotographers || 1))} 次预约`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">预约总数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                `已完成: ${stats?.completedSessions} (${Math.round((stats?.completedSessions || 0) / (stats?.totalBookings || 1) * 100)}%)`
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
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.totalPhotos}</div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "加载中..." : (
                `待审核: ${stats?.pendingApprovals} 张`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent activity */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>查看最近的预约和订单</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>加载中...</span>
              </div>
            ) : (
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bookings">最近预约</TabsTrigger>
                  <TabsTrigger value="orders">最近订单</TabsTrigger>
                </TabsList>
                <TabsContent value="bookings" className="space-y-4 pt-4">
                  {recentBookings.length > 0 ? (
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
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
                                <Calendar className="mr-1 h-3 w-3" />
                                <span>
                                  {format(new Date(booking.date), "yyyy年MM月dd日")}，
                                  {booking.startTime}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                摄影师: {booking.photographerName}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {booking.status === "confirmed"
                                ? "已确认"
                                : booking.status === "pending"
                                ? "待确认"
                                : booking.status === "cancelled"
                                ? "已取消"
                                : "已完成"}
                            </span>
                            <Button variant="ghost" size="sm" asChild className="ml-2">
                              <Link href={`/admin/bookings/${booking.id}`}>详情</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/bookings">查看全部预约</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      暂无预约记录
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="orders" className="space-y-4 pt-4">
                  {recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>{order.clientName?.slice(0, 2) || "客户"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{order.clientName}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Package className="mr-1 h-3 w-3" />
                                <span>{order.type}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(order.createdAt), "yyyy年MM月dd日")}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">¥{order.amount?.toFixed(2)}</span>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "shipped"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.status === "processing"
                                ? "处理中"
                                : order.status === "shipped"
                                ? "已发货"
                                : order.status === "delivered"
                                ? "已送达"
                                : "已取消"}
                            </span>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>详情</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/orders">查看全部订单</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      暂无订单记录
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>系统提醒</CardTitle>
            <CardDescription>需要您注意的事项</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>加载中...</span>
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg p-4 ${
                      alert.type === "warning"
                        ? "bg-yellow-50"
                        : alert.type === "error"
                        ? "bg-red-50"
                        : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`mr-3 rounded-full p-1 ${
                          alert.type === "warning"
                            ? "bg-yellow-100 text-yellow-600"
                            : alert.type === "error"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          alert.type === "warning"
                            ? "text-yellow-800"
                            : alert.type === "error"
                            ? "text-red-800"
                            : "text-blue-800"
                        }`}
                      >
                        {alert.message}
                      </p>
                    </div>
                    <div className="mt-2 text-right">
                      <Button
                        variant="link"
                        size="sm"
                        className={`p-0 ${
                          alert.type === "warning"
                            ? "text-yellow-600"
                            : alert.type === "error"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                        asChild
                      >
                        <Link href={alert.link}>处理</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  目前没有需要注意的事项
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent clients */}
      <Card>
        <CardHeader>
          <CardTitle>最近注册的客户</CardTitle>
          <CardDescription>查看最近加入的客户</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>加载中...</span>
            </div>
          ) : recentClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">客户</th>
                    <th className="pb-2 text-left font-medium">联系方式</th>
                    <th className="pb-2 text-left font-medium">注册时间</th>
                    <th className="pb-2 text-left font-medium">预约次数</th>
                    <th className="pb-2 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentClients.map((client) => (
                    <tr key={client.id}>
                      <td className="py-3">
                        <div className="flex items-center">
                          <Avatar className="mr-2 h-8 w-8">
                            <AvatarFallback>{client.name?.slice(0, 2) || "客户"}</AvatarFallback>
                          </Avatar>
                          <span>{client.name}</span>
                        </div>
                      </td>
                      <td className="py-3">{client.phone}</td>
                      <td className="py-3">
                        {format(new Date(client.createdAt), "yyyy-MM-dd")}
                      </td>
                      <td className="py-3">{client.bookingsCount}</td>
                      <td className="py-3 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/clients/${client.id}`}>查看</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              暂无客户记录
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
