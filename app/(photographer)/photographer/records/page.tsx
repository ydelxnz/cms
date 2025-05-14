"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Camera, 
  User, 
  FileText, 
  Search,
  Filter,
  Plus,
  Image
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Link from "next/link";
import { Booking } from "@/lib/types";
import { photographerService, bookingService } from "@/lib/services";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

// 扩展Booking类型以包含可能在UI中使用的额外字段
interface ExtendedBooking extends Omit<Booking, 'type' | 'location'> {
  clientName?: string;
  location?: string;
  type?: string;
}

// Status options
const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "待处理" },
  { value: "confirmed", label: "已确认" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
];

// Type options
const typeOptions = [
  { value: "all", label: "全部类型" },
  { value: "婚纱照", label: "婚纱照" },
  { value: "全家福", label: "全家福" },
  { value: "艺术人像", label: "艺术人像" },
  { value: "证件照", label: "证件照" },
  { value: "儿童摄影", label: "儿童摄影" },
  { value: "商业摄影", label: "商业摄影" },
  { value: "其他", label: "其他" },
];

export default function PhotographerRecordsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [records, setRecords] = useState<ExtendedBooking[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ExtendedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isRecordDetailOpen, setIsRecordDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExtendedBooking | null>(null);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [loadingConfirmedBookings, setLoadingConfirmedBookings] = useState(false);
  const [newRecord, setNewRecord] = useState({
    clientId: "",
    clientName: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    location: "",
    type: "婚纱照",
    notes: "",
    status: "pending",
  });

  // 获取摄影师拍摄记录
  useEffect(() => {
    const fetchRecords = async () => {
      if (!session?.user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await photographerService.getPhotographerSessions(session.user.id);
        setRecords(data);
        setFilteredRecords(data);
      } catch (err) {
        console.error("获取拍摄记录失败:", err);
        setError("获取拍摄记录失败，请稍后重试");
        toast({
          title: "错误",
          description: "获取拍摄记录失败，请稍后重试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [session?.user?.id]);

  // Filter records when filter state changes
  useEffect(() => {
    let filtered = records;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          (record.clientName || "").toLowerCase().includes(query) ||
          (record.location || "").toLowerCase().includes(query) ||
          (record.notes || "").toLowerCase().includes(query) ||
          (record.type || "").toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((record) => record.type === typeFilter);
    }

    setFilteredRecords(filtered);
  }, [searchQuery, statusFilter, typeFilter, records]);

  // 获取已确认的预约
  const fetchConfirmedBookings = async () => {
    if (!session?.user?.id) return;
    
    setLoadingConfirmedBookings(true);
    
    try {
      // 获取已确认状态的预约
      const bookings = await bookingService.getPhotographerBookings({ 
        photographerId: session.user.id,
        status: 'confirmed'
      });
      
      setConfirmedBookings(bookings);
    } catch (err) {
      console.error("获取已确认预约失败:", err);
      toast({
        title: "错误",
        description: "获取客户列表失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoadingConfirmedBookings(false);
    }
  };

  // 在打开添加记录对话框时加载已确认的预约
  useEffect(() => {
    if (isAddRecordOpen) {
      fetchConfirmedBookings();
    }
  }, [isAddRecordOpen, session?.user?.id]);

  // 当选择客户时，填充相关信息
  const handleClientChange = (clientId: string) => {
    const selectedBooking = confirmedBookings.find(booking => booking.id === clientId);
    if (selectedBooking) {
      setNewRecord({
        ...newRecord,
        clientId: selectedBooking.id,
        clientName: selectedBooking.clientName || "",
        location: selectedBooking.location || "",
        type: selectedBooking.type || "婚纱照",
      });
    }
  };

  // Handle adding a new record
  const handleAddRecord = async () => {
    if (!session?.user?.id || !newRecord.clientId) {
      toast({
        title: "错误",
        description: "请选择客户",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const recordToAdd = {
        clientId: newRecord.clientId,
        photographerId: session.user.id,
        date: newRecord.date,
        startTime: newRecord.startTime,
        endTime: newRecord.endTime,
        location: newRecord.location,
        type: newRecord.type,
        status: newRecord.status as "pending" | "confirmed" | "completed" | "cancelled",
        notes: newRecord.notes,
      };

      const createdRecord = await photographerService.createSession(recordToAdd);
      
      setRecords([...records, createdRecord]);
      setIsAddRecordOpen(false);
      toast({
        title: "成功",
        description: "拍摄记录已添加",
      });
      
      setNewRecord({
        clientId: "",
        clientName: "",
        date: format(new Date(), "yyyy-MM-dd"),
        startTime: "09:00",
        endTime: "10:00",
        location: "",
        type: "婚纱照",
        notes: "",
        status: "pending",
      });
    } catch (err) {
      console.error("添加拍摄记录失败:", err);
      toast({
        title: "错误",
        description: "添加拍摄记录失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  // Handle viewing record details
  const handleViewRecord = (record: ExtendedBooking) => {
    setSelectedRecord(record);
    setIsRecordDetailOpen(true);
  };

  // Handle updating record status
  const handleUpdateStatus = async (id: string, newStatus: "pending" | "confirmed" | "completed" | "cancelled") => {
    try {
      const updatedRecord = await photographerService.updateSession(id, { status: newStatus });
      
      setRecords(records.map(record => 
        record.id === id ? updatedRecord : record
      ));
      
      toast({
        title: "成功",
        description: "拍摄记录状态已更新",
      });
    } catch (err) {
      console.error("更新拍摄记录状态失败:", err);
      toast({
        title: "错误",
        description: "更新拍摄记录状态失败，请稍后重试",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">待处理</Badge>;
      case "confirmed":
        return <Badge variant="secondary">已确认</Badge>;
      case "completed":
        return <Badge variant="default">已完成</Badge>;
      case "cancelled":
        return <Badge variant="destructive">已取消</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "yyyy年MM月dd日", { locale: zhCN });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">拍摄记录</h2>
        <Button onClick={() => setIsAddRecordOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加记录
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索客户名、地点或备注..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 记录列表 */}
      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-red-500">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              重试
            </Button>
          </div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-muted-foreground">暂无拍摄记录</p>
            <Button variant="outline" onClick={() => setIsAddRecordOpen(true)}>
              添加记录
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{record.clientName || "未命名客户"}</CardTitle>
                  {getStatusBadge(record.status)}
                </div>
                <CardDescription>{record.type || "未分类"}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(record.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {record.startTime} - {record.endTime}
                    </span>
                  </div>
                  {record.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{record.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewRecord(record)}
                >
                  查看详情
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* 添加记录对话框 */}
      <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加拍摄记录</DialogTitle>
            <DialogDescription>
              填写拍摄记录的详细信息，从已确认的预约中选择客户。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="clientId">选择客户</Label>
              {loadingConfirmedBookings ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">加载中...</span>
                </div>
              ) : confirmedBookings.length === 0 ? (
                <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
                  没有已确认的预约。请先确认预约后再添加拍摄记录。
                </div>
              ) : (
                <Select
                  value={newRecord.clientId}
                  onValueChange={handleClientChange}
                >
                  <SelectTrigger id="clientId">
                    <SelectValue placeholder="选择客户" />
                  </SelectTrigger>
                  <SelectContent>
                    {confirmedBookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.clientName || "未命名客户"} - {format(new Date(booking.date), "yyyy-MM-dd")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">日期</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRecord.date}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">类型</Label>
                <Select
                  value={newRecord.type}
                  onValueChange={(value) =>
                    setNewRecord({ ...newRecord, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(
                      (option) =>
                        option.value !== "all" && (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">开始时间</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newRecord.startTime}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, startTime: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">结束时间</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newRecord.endTime}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">地点</Label>
              <Input
                id="location"
                value={newRecord.location}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, location: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                rows={3}
                value={newRecord.notes}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, notes: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">状态</Label>
              <Select
                value={newRecord.status}
                onValueChange={(value) =>
                  setNewRecord({ ...newRecord, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(
                    (option) =>
                      option.value !== "all" && (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRecordOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddRecord} disabled={!newRecord.clientId || loadingConfirmedBookings}>
              添加记录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 记录详情对话框 */}
      <Dialog open={isRecordDetailOpen} onOpenChange={setIsRecordDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>拍摄记录详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium">{selectedRecord.clientName || "未命名客户"}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRecord.type || "未分类"}</p>
                </div>
                <div>{getStatusBadge(selectedRecord.status)}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">日期</p>
                  <p>{formatDate(selectedRecord.date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">时间</p>
                  <p>{selectedRecord.startTime} - {selectedRecord.endTime}</p>
                </div>
              </div>
              
              {selectedRecord.location && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">地点</p>
                  <p>{selectedRecord.location}</p>
                </div>
              )}
              
              {selectedRecord.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">备注</p>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
              
              <Tabs defaultValue="status" value="status" onValueChange={() => {}}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="status">状态更新</TabsTrigger>
                  <TabsTrigger value="photos">相关照片</TabsTrigger>
                </TabsList>
                <TabsContent value="status" className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">更新拍摄状态</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedRecord.status === "pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedRecord.id, "pending")}
                      >
                        待处理
                      </Button>
                      <Button
                        variant={selectedRecord.status === "confirmed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedRecord.id, "confirmed")}
                      >
                        已确认
                      </Button>
                      <Button
                        variant={selectedRecord.status === "completed" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedRecord.id, "completed")}
                      >
                        已完成
                      </Button>
                      <Button
                        variant={selectedRecord.status === "cancelled" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedRecord.id, "cancelled")}
                      >
                        已取消
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="photos">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">相关照片</p>
                      <Link href={`/photographer/upload?bookingId=${selectedRecord.id}`} passHref>
                        <Button size="sm" variant="outline">
                          <Image className="mr-2 h-4 w-4" />
                          上传照片
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {/* 这里可以展示相关照片，需要额外获取 */}
                      <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                        <p className="text-xs text-muted-foreground">暂无照片</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
