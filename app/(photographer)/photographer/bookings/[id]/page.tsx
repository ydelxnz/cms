"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Tag,
  FileText, 
  CheckCircle, 
  XCircle, 
  Edit2, 
  ArrowLeft,
  Camera,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { bookingService, userService } from "@/lib/services";
import { Booking, ClientProfile } from "@/lib/types";

export default function BookingDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateNotes, setUpdateNotes] = useState("");
  const [editedBooking, setEditedBooking] = useState<Partial<Booking>>({});

  // 获取预约详情和客户信息
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 获取预约详情 - 增加重试逻辑
        let bookingData = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!bookingData && retryCount < maxRetries) {
          try {
            console.log(`尝试获取预约详情，尝试次数: ${retryCount + 1}`);
            bookingData = await bookingService.getBookingById(params.id);
            console.log('获取到的预约数据:', bookingData);
          } catch (retryError) {
            console.error(`第 ${retryCount + 1} 次获取预约失败:`, retryError);
            retryCount++;
            if (retryCount >= maxRetries) throw retryError;
            // 等待一小段时间再重试
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        setBooking(bookingData);
        
        // 只在有客户ID时获取客户资料
        if (bookingData?.clientId) {
          try {
            // 获取客户详细资料
            const clientData = await userService.getUserProfile(bookingData.clientId);
            setClientProfile(clientData);
          } catch (clientError) {
            console.error('获取客户资料失败，但不影响预约详情展示:', clientError);
            // 客户资料获取失败不阻止整个页面
          }
        }
        
        // 初始化编辑状态
        setEditedBooking({
          date: bookingData?.date,
          startTime: bookingData?.startTime,
          endTime: bookingData?.endTime,
          location: bookingData?.location,
          type: bookingData?.type,
          notes: bookingData?.notes,
        });
        
        setUpdateNotes(bookingData?.notes || "");
        
      } catch (error) {
        console.error('获取预约详情失败:', error);
        setError('获取预约详情失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookingDetails();
  }, [params.id]);

  // 更新预约状态
  const handleStatusUpdate = async (newStatus: "pending" | "confirmed" | "completed" | "cancelled") => {
    try {
      setIsStatusUpdating(true);
      setError(null);
      
      console.log(`准备更新预约状态: ${newStatus}，预约ID: ${params.id}`);
      
      let response = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!response && retryCount < maxRetries) {
        try {
          console.log(`尝试更新预约状态，尝试次数: ${retryCount + 1}`);
          
          // 构建请求数据
          const requestData = {
            status: newStatus,
            notes: updateNotes
          };
          console.log('发送的数据:', requestData);
          
          response = await bookingService.updateBookingStatus(params.id, requestData);
          console.log('状态更新成功:', response);
        } catch (retryError) {
          console.error(`第 ${retryCount + 1} 次状态更新失败:`, retryError);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            throw retryError;
          }
          
          // 等待一小段时间再重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // 成功更新后直接使用返回的数据更新本地状态
      if (response) {
        console.log('使用返回数据更新本地状态');
        setBooking(response);
      } else {
        throw new Error('未能获取更新后的预约数据');
      }
      
    } catch (error) {
      console.error('更新预约状态失败:', error);
      setError('更新预约状态失败，请稍后再试');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // 保存编辑的预约信息
  const handleSaveChanges = async () => {
    try {
      setIsStatusUpdating(true);
      setError(null);
      
      await bookingService.updateBooking(params.id, editedBooking);
      
      // 更新本地状态
      setBooking(prev => prev ? { ...prev, ...editedBooking } : null);
      setIsEditMode(false);
      
    } catch (error) {
      console.error('更新预约信息失败:', error);
      setError('更新预约信息失败，请稍后再试');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">加载预约详情...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">加载失败</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回上一页
        </Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">未找到预约</h2>
        <p className="text-muted-foreground mb-4">该预约可能已被删除或不存在</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回上一页
        </Button>
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <div className="flex space-x-2">
          {!isEditMode ? (
            <Button variant="outline" onClick={() => setIsEditMode(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              编辑预约
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                取消
              </Button>
              <Button onClick={handleSaveChanges} disabled={isStatusUpdating}>
                {isStatusUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : "保存修改"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 预约详情 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>预约详情</span>
              {getStatusBadge(booking.status)}
            </CardTitle>
            <CardDescription>
              预约编号: {booking.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditMode ? (
              // 编辑模式下的表单
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">日期</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editedBooking.date}
                    onChange={(e) => setEditedBooking({ ...editedBooking, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">开始时间</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={editedBooking.startTime}
                      onChange={(e) => setEditedBooking({ ...editedBooking, startTime: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">结束时间</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={editedBooking.endTime}
                      onChange={(e) => setEditedBooking({ ...editedBooking, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">地点</Label>
                  <Input
                    id="location"
                    value={editedBooking.location}
                    onChange={(e) => setEditedBooking({ ...editedBooking, location: e.target.value })}
                    placeholder="拍摄地点"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">拍摄类型</Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={editedBooking.type}
                    onChange={(e) => setEditedBooking({ ...editedBooking, type: e.target.value })}
                  >
                    <option value="婚纱照">婚纱照</option>
                    <option value="全家福">全家福</option>
                    <option value="艺术人像">艺术人像</option>
                    <option value="证件照">证件照</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">备注</Label>
                  <Textarea
                    id="notes"
                    value={editedBooking.notes}
                    onChange={(e) => setEditedBooking({ ...editedBooking, notes: e.target.value })}
                    placeholder="预约备注信息"
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              // 查看模式下的信息展示
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">日期:</span>
                  <span>
                    {format(new Date(booking.date), "yyyy年MM月dd日", { locale: zhCN })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">时间:</span>
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">地点:</span>
                  <span>{booking.location || "未指定地点"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">拍摄类型:</span>
                  <span>{booking.type}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <span className="font-medium mt-1">备注:</span>
                  <span className="flex-1">{booking.notes || "无备注信息"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">创建时间:</span>
                  <span>
                    {format(new Date(booking.createdAt), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                  </span>
                </div>
                {booking.updatedAt !== booking.createdAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">最后更新:</span>
                    <span>
                      {format(new Date(booking.updatedAt), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 客户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>客户信息</CardTitle>
            <CardDescription>
              预约客户的详细联系方式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">姓名:</span>
              <span>{booking.clientName || (clientProfile?.name || "未知客户")}</span>
            </div>
            {clientProfile && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">邮箱:</span>
                  <span>{clientProfile.email || "未填写"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">电话:</span>
                  <span>{clientProfile.profile?.phone || "未填写"}</span>
                </div>
                {clientProfile.profile?.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">地址:</span>
                    <span>{clientProfile.profile.address}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 操作区域：更新状态，添加备注等 */}
      {!isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle>预约管理</CardTitle>
            <CardDescription>
              更新预约状态或添加备注信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="notes">备注信息</Label>
                <Textarea
                  id="notes"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="添加额外的备注信息..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex space-x-2">
              {booking.status === "pending" && (
                <Button 
                  variant="default" 
                  onClick={() => handleStatusUpdate("confirmed")}
                  disabled={isStatusUpdating}
                >
                  {isStatusUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      确认预约
                    </>
                  )}
                </Button>
              )}
              
              {booking.status === "confirmed" && (
                <Button 
                  variant="default" 
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={isStatusUpdating}
                >
                  {isStatusUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      标记为已完成
                    </>
                  )}
                </Button>
              )}
              
              {(booking.status === "pending" || booking.status === "confirmed") && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      disabled={isStatusUpdating}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      取消预约
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认取消预约?</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将取消该预约，取消后可能会影响客户体验。确定要继续吗？
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>返回</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleStatusUpdate("cancelled")}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        确认取消
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            {/* 用户仅添加或更新备注的按钮 */}
            {booking.notes !== updateNotes && (
              <Button 
                variant="outline" 
                onClick={() => handleStatusUpdate(booking.status)}
                disabled={isStatusUpdating}
              >
                {isStatusUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : "更新备注"}
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 