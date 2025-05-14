"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Archive, 
  Filter, 
  List, 
  Search, 
  Trash2, 
  AlertCircle, 
  ShieldAlert, 
  User, 
  Settings,
  CalendarIcon,
  DownloadCloud,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { logService, LogRecord, LogStats } from "@/lib/services/logService";

// 获取日志类型的标签和颜色
const getLogTypeInfo = (type: string) => {
  switch (type?.toLowerCase()) {
    case "system":
      return { 
        label: "系统", 
        color: "bg-blue-100 text-blue-800", 
        icon: <Settings className="h-4 w-4" /> 
      };
    case "security":
      return { 
        label: "安全", 
        color: "bg-yellow-100 text-yellow-800", 
        icon: <ShieldAlert className="h-4 w-4" /> 
      };
    case "user":
      return { 
        label: "用户", 
        color: "bg-green-100 text-green-800", 
        icon: <User className="h-4 w-4" /> 
      };
    case "error":
      return { 
        label: "错误", 
        color: "bg-red-100 text-red-800", 
        icon: <AlertCircle className="h-4 w-4" /> 
      };
    default:
      return { 
        label: "未知", 
        color: "bg-gray-100 text-gray-800", 
        icon: <List className="h-4 w-4" /> 
      };
  }
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [stats, setStats] = useState<LogStats>({
    total: 0,
    system: 0,
    security: 0,
    user: 0,
    error: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  
  // 加载日志数据
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters: any = {
        limit: 1000 // 最多获取1000条日志
      };
      
      if (selectedType !== "all") {
        filters.type = selectedType;
      }
      
      if (selectedModule !== "all") {
        filters.module = selectedModule;
      }
      
      if (startDate) {
        filters.startDate = startDate.toISOString();
      }
      
      if (endDate) {
        filters.endDate = endDate.toISOString();
      }
      
      const result = await logService.getLogs(filters);
      setLogs(result.logs);
      setStats(result.stats);
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "获取日志数据失败");
      setIsLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    fetchLogs();
  }, []);
  
  // 当筛选条件变化时重新加载
  useEffect(() => {
    fetchLogs();
  }, [selectedType, selectedModule, startDate, endDate]);
  
  // 清除所有筛选条件
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedModule("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  // 删除单条日志
  const handleDeleteLog = async (id: string) => {
    try {
      await logService.deleteLog(id);
      setLogs(logs.filter(log => log.id !== id));
      setStats({
        ...stats,
        total: stats.total - 1
      });
      setIsDeleteDialogOpen(false);
      setSelectedLog(null);
    } catch (err: any) {
      setError(err.message || "删除日志失败");
    }
  };
  
  // 清除所有日志
  const handleClearAllLogs = async () => {
    try {
      await logService.clearLogs();
      setLogs([]);
      setStats({
        total: 0,
        system: 0,
        security: 0,
        user: 0,
        error: 0
      });
      setIsClearDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "清除日志失败");
    }
  };
  
  // 生成唯一模块列表
  const modules = Array.from(new Set(logs.map(log => log.module))).sort();
  
  // 本地筛选日志
  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.description.toLowerCase().includes(searchLower) ||
        log.module.toLowerCase().includes(searchLower) ||
        log.userName.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">系统日志</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={fetchLogs}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              // 导出日志功能（简单实现为JSON下载）
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", `system_logs_${new Date().toISOString()}.json`);
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
          >
            <DownloadCloud className="mr-2 h-4 w-4" />
            导出
          </Button>
          <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清空日志
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认清空所有日志？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将永久删除所有日志记录，且无法恢复。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAllLogs}
                  className="bg-red-600 hover:bg-red-700"
                >
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}
      
      {/* 日志统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              总日志数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              系统日志
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.system}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              用户操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.user}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              错误/安全
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.error + stats.security}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* 筛选工具栏 */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索日志..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue>
                {selectedType === "all" ? "所有类型" : getLogTypeInfo(selectedType).label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有类型</SelectItem>
              <SelectItem value="system">系统日志</SelectItem>
              <SelectItem value="security">安全日志</SelectItem>
              <SelectItem value="user">用户操作</SelectItem>
              <SelectItem value="error">错误日志</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-[160px]">
              <SelectValue>
                {selectedModule === "all" ? "所有模块" : selectedModule}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有模块</SelectItem>
              {modules.map(module => (
                <SelectItem key={module} value={module}>
                  {module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate && endDate ? (
                    <>
                      {format(startDate, "yyyy-MM-dd")} - {format(endDate, "yyyy-MM-dd")}
                    </>
                  ) : (
                    <span>选择日期范围</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="flex flex-col space-y-2 p-2">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">开始日期</Label>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">结束日期</Label>
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </div>
                  {(startDate || endDate) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setStartDate(undefined);
                        setEndDate(undefined);
                      }}
                    >
                      清除日期
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            variant="ghost"
            onClick={clearFilters}
          >
            <Filter className="mr-2 h-4 w-4" />
            清除筛选
          </Button>
        </div>
      </div>
      
      {/* 日志表格 */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">时间</TableHead>
                <TableHead className="w-[120px]">类型</TableHead>
                <TableHead className="w-[120px]">模块</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="w-[150px]">用户</TableHead>
                <TableHead className="w-[100px]">IP地址</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const typeInfo = getLogTypeInfo(log.type);
                
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant="outline" className={cn("flex items-center gap-1", typeInfo.color)}>
                          {typeInfo.icon}
                          <span>{typeInfo.label}</span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{log.module}</TableCell>
                    <TableCell className="max-w-md truncate">
                      <span className="cursor-pointer hover:underline" onClick={() => setSelectedLog(log)}>
                        {log.description}
                      </span>
                    </TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={isDeleteDialogOpen && selectedLog?.id === log.id} onOpenChange={setIsDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除日志？</AlertDialogTitle>
                              <AlertDialogDescription>
                                此操作将永久删除该日志记录，且无法恢复。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => selectedLog && handleDeleteLog(selectedLog.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed">
          <Archive className="mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-xl font-medium">暂无日志</p>
          <p className="text-sm text-muted-foreground">
            {searchTerm || selectedType !== "all" || selectedModule !== "all" || startDate || endDate
              ? "没有找到符合当前筛选条件的日志"
              : "系统尚未记录任何日志"}
          </p>
          {(searchTerm || selectedType !== "all" || selectedModule !== "all" || startDate || endDate) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearFilters}
            >
              清除筛选条件
            </Button>
          )}
        </div>
      )}
      
      {/* 日志详情对话框 */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>日志详情</DialogTitle>
            <DialogDescription>
              日志ID: {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>时间</Label>
                  <div className="pt-1 font-mono text-sm">
                    {format(new Date(selectedLog.timestamp), "yyyy-MM-dd HH:mm:ss")}
                  </div>
                </div>
                <div>
                  <Label>类型</Label>
                  <div className="pt-1">
                    <Badge variant="outline" className={cn("flex w-fit items-center gap-1", getLogTypeInfo(selectedLog.type).color)}>
                      {getLogTypeInfo(selectedLog.type).icon}
                      <span>{getLogTypeInfo(selectedLog.type).label}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>模块</Label>
                  <div className="pt-1">{selectedLog.module}</div>
                </div>
                <div>
                  <Label>用户</Label>
                  <div className="pt-1 flex items-center">
                    <User className="mr-1 h-4 w-4" />
                    {selectedLog.userName} ({selectedLog.userId})
                  </div>
                </div>
                <div>
                  <Label>IP地址</Label>
                  <div className="pt-1 font-mono text-sm">{selectedLog.ip}</div>
                </div>
                <div>
                  <Label>创建时间</Label>
                  <div className="pt-1 font-mono text-sm">
                    {format(new Date(selectedLog.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>描述</Label>
                <div className="pt-1 text-sm rounded-md bg-muted p-3">
                  {selectedLog.description}
                </div>
              </div>
              
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <Label>详细信息</Label>
                  <pre className="mt-1 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              关闭
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除日志？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将永久删除该日志记录，且无法恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => selectedLog && handleDeleteLog(selectedLog.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
