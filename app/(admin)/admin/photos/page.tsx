"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Image as ImageIcon,
  Search, 
  Filter, 
  Upload, 
  Download, 
  Trash2, 
  Edit,
  Tag,
  Calendar,
  User,
  RefreshCw,
  Check,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

// 导入照片服务
import { 
  getAdminPhotos, 
  bulkUpdatePhotoStatus, 
  bulkDeletePhotos,
  Photo,
  PhotoStats,
  PhotoFilterOptions
} from "@/lib/services/photoService";

// 视图类型
type ViewMode = "grid" | "list";

// 照片状态类型
type PhotoStatus = "all" | "pending" | "approved" | "archived";

export default function PhotosPage() {
  // 基本状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [stats, setStats] = useState<PhotoStats>({
    total: 0,
    pending: 0,
    approved: 0,
    archived: 0,
    photographers: 0,
    clients: 0
  });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentStatus, setCurrentStatus] = useState<PhotoStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  // 对话框状态
  const [isPhotoDetailOpen, setIsPhotoDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  
  // 批量操作状态
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 排序和筛选状态
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<PhotoFilterOptions>({});
  
  // 加载照片数据
  const fetchPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 构建筛选参数
      const filterOptions: PhotoFilterOptions = {
        ...filters,
        sortField,
        sortOrder
      };
      
      // 添加状态筛选
      if (currentStatus !== "all") {
        filterOptions.status = currentStatus;
      }
      
      const result = await getAdminPhotos(filterOptions);
      setPhotos(result.photos);
      setStats(result.stats);
      
      // 重置选择状态
      setSelectedPhotoIds(new Set());
      setSelectAll(false);
      
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "获取照片失败",
        description: "加载照片数据时出现错误，请重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortField, sortOrder, currentStatus]);

  // 初始加载
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // 筛选照片（本地搜索）
  const filteredPhotos = photos.filter((photo) => {
    // 搜索筛选
    return searchQuery === "" ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.photographerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
  });

  // 分页处理
  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);
  const paginatedPhotos = filteredPhotos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // 选择照片处理
  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };
  
  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPhotoIds(new Set());
    } else {
      const allIds = new Set(filteredPhotos.map(photo => photo.id));
      setSelectedPhotoIds(allIds);
    }
    setSelectAll(!selectAll);
  };
  
  // 批量更新照片状态
  const handleBulkUpdateStatus = async (status: "pending" | "approved" | "archived") => {
    if (selectedPhotoIds.size === 0) return;
    
    try {
      setIsLoading(true);
      
      const result = await bulkUpdatePhotoStatus({
        photoIds: Array.from(selectedPhotoIds),
        status
      });
      
      toast({
        title: "批量操作成功",
        description: `已更新 ${result.updatedCount} 张照片的状态`,
      });
      
      // 重新加载照片
      fetchPhotos();
      
    } catch (error) {
      console.error('Error updating photos status:', error);
      toast({
        title: "批量操作失败",
        description: "更新照片状态时出现错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 批量删除照片
  const handleBulkDelete = async () => {
    if (selectedPhotoIds.size === 0) return;
    
    try {
      setIsLoading(true);
      setIsBulkDeleteDialogOpen(false);
      
      const result = await bulkDeletePhotos({
        photoIds: Array.from(selectedPhotoIds)
      });
      
      toast({
        title: "批量删除成功",
        description: `已删除 ${result.deletedCount} 张照片`,
      });
      
      // 重新加载照片
      fetchPhotos();
      
    } catch (error) {
      console.error('Error deleting photos:', error);
      toast({
        title: "批量删除失败",
        description: "删除照片时出现错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 打开照片详情
  const handleOpenPhotoDetail = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsPhotoDetailOpen(true);
  };

  // 确认删除照片
  const handleDeletePhoto = async () => {
    if (selectedPhoto) {
      try {
        setIsLoading(true);
        setIsDeleteDialogOpen(false);
        
        const result = await bulkDeletePhotos({
          photoIds: [selectedPhoto.id]
        });

        toast({
          title: "删除成功",
          description: "照片已成功删除",
        });
        
        // 关闭详情对话框并清除选择
        setIsPhotoDetailOpen(false);
        setSelectedPhoto(null);
        
        // 重新加载照片
        fetchPhotos();
      } catch (error) {
        console.error('Error deleting photo:', error);
        toast({
          title: "删除失败",
          description: "删除照片时出现错误",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 获取状态徽章变体
  const getStatusBadgeVariant = (status: Photo["status"]) => {
    switch (status) {
      case "pending":
        return "outline";
      case "approved":
        return "default";
      case "archived":
        return "secondary";
      default:
        return "default";
    }
  };

  // 获取状态徽章文本
  const getStatusBadgeText = (status: Photo["status"]) => {
    switch (status) {
      case "pending":
        return "待审核";
      case "approved":
        return "已审核";
      case "archived":
        return "已归档";
      default:
        return "未知";
    }
  };

  // 更新排序
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      // 切换排序顺序
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 设置新的排序字段，默认降序
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4 p-8">
      {/* 顶部标题和统计卡片 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">照片管理</h2>
            <p className="text-muted-foreground">
              管理、审核和组织照片库中的所有照片
            </p>
          </div>
          <Button onClick={fetchPhotos} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">总照片数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.photographers} 位摄影师, {stats.clients} 位客户
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">待审核照片</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                占总数的 {stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">已审核照片</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                占总数的 {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">已归档照片</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.archived}</div>
              <p className="text-xs text-muted-foreground">
                占总数的 {stats.total ? Math.round((stats.archived / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 搜索和筛选工具栏 */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="md:w-1/2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索照片标题、摄影师、客户或标签..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 md:w-1/2">
          <Select
            value={currentStatus}
            onValueChange={(value) => {
              setCurrentStatus(value as PhotoStatus);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有照片</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="approved">已审核</SelectItem>
              <SelectItem value="archived">已归档</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortField}
            onValueChange={(value) => {
              setSortField(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">上传日期</SelectItem>
              <SelectItem value="title">标题</SelectItem>
              <SelectItem value="photographerName">摄影师</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortOrder}
            onValueChange={(value) => {
              setSortOrder(value as "asc" | "desc");
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">降序</SelectItem>
              <SelectItem value="asc">升序</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 批量操作工具栏 */}
      {selectedPhotoIds.size > 0 && (
        <div className="bg-muted p-2 rounded-md flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectAll}
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              已选择 {selectedPhotoIds.size} 张照片
            </label>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkUpdateStatus("approved")}
            >
              <Check className="mr-2 h-4 w-4" />
              批量审核
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleBulkUpdateStatus("archived")}
            >
              <Archive className="mr-2 h-4 w-4" />
              批量归档
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              批量删除
            </Button>
          </div>
        </div>
      )}

      {/* 照片查看模式选择 */}
      <Tabs 
        value={viewMode} 
        onValueChange={(value) => setViewMode(value as ViewMode)} 
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="grid">网格视图</TabsTrigger>
          <TabsTrigger value="list">列表视图</TabsTrigger>
        </TabsList>

        {/* 网格视图内容 */}
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {isLoading ? (
              // 加载状态
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-md bg-muted"
                ></div>
              ))
            ) : paginatedPhotos.length === 0 ? (
              // 空状态
              <div className="col-span-full h-48 flex items-center justify-center">
                <p className="text-muted-foreground">没有找到匹配的照片</p>
              </div>
            ) : (
              // 照片网格
              paginatedPhotos.map((photo) => (
                <Card
                  key={photo.id}
                  className="overflow-hidden hover:shadow-md transition-shadow relative"
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedPhotoIds.has(photo.id)}
                      onCheckedChange={() => toggleSelectPhoto(photo.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-background/80"
                    />
                  </div>
                  <div 
                    className="relative h-48 cursor-pointer"
                    onClick={() => handleOpenPhotoDetail(photo)}
                  >
                    <img
                      src={photo.thumbnailPath}
                      alt={photo.title}
                      className="h-full w-full object-cover"
                    />
                    <Badge
                      variant={getStatusBadgeVariant(photo.status)}
                      className="absolute right-2 top-2"
                    >
                      {getStatusBadgeText(photo.status)}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="line-clamp-1 font-medium">{photo.title}</h3>
                    <div className="mt-1 flex items-center text-xs text-muted-foreground">
                      <User className="mr-1 h-3 w-3" />
                      <span className="line-clamp-1">{photo.photographerName}</span>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>
                        {new Date(photo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 列表视图内容 */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-2 py-3">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-3 px-4 text-left font-medium">照片</th>
                      <th 
                        className="py-3 px-4 text-left font-medium cursor-pointer"
                        onClick={() => handleSortChange('title')}
                      >
                        标题 
                        {sortField === 'title' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium cursor-pointer"
                        onClick={() => handleSortChange('photographerName')}
                      >
                        摄影师
                        {sortField === 'photographerName' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="py-3 px-4 text-left font-medium">客户</th>
                      <th 
                        className="py-3 px-4 text-left font-medium cursor-pointer"
                        onClick={() => handleSortChange('createdAt')}
                      >
                        上传日期
                        {sortField === 'createdAt' && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </th>
                      <th className="py-3 px-4 text-left font-medium">状态</th>
                      <th className="py-3 px-4 text-center font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-2 py-3">
                            <Skeleton className="h-4 w-4" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-12 w-12 rounded-md" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="py-3 px-4">
                            <Skeleton className="h-8 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : paginatedPhotos.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="h-24 text-center">
                          没有找到匹配的照片
                        </td>
                      </tr>
                    ) : (
                      paginatedPhotos.map((photo) => (
                        <tr
                          key={photo.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="px-2 py-3">
                            <Checkbox
                              checked={selectedPhotoIds.has(photo.id)}
                              onCheckedChange={() => toggleSelectPhoto(photo.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div 
                              className="h-12 w-12 overflow-hidden rounded-md cursor-pointer"
                              onClick={() => handleOpenPhotoDetail(photo)}
                            >
                              <img
                                src={photo.thumbnailPath}
                                alt={photo.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>
                          <td 
                            className="py-3 px-4 max-w-[200px] cursor-pointer"
                            onClick={() => handleOpenPhotoDetail(photo)}
                          >
                            <div className="line-clamp-1 font-medium">
                              {photo.title}
                            </div>
                          </td>
                          <td className="py-3 px-4">{photo.photographerName}</td>
                          <td className="py-3 px-4">{photo.clientName || '—'}</td>
                          <td className="py-3 px-4">
                            {new Date(photo.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getStatusBadgeVariant(photo.status)}>
                              {getStatusBadgeText(photo.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  操作
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenPhotoDetail(photo)}>
                                  查看详情
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedPhoto(photo);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  删除照片
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 分页控件 */}
      {filteredPhotos.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(1);
                  }}
                  className="hidden sm:inline-flex"
                  size="default"
                >
                  首页
                </PaginationLink>
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={page === currentPage}
                    size="default"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(totalPages);
                  }}
                  className="hidden sm:inline-flex"
                  size="default"
                >
                  末页
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* 照片详情对话框 */}
      <Dialog open={isPhotoDetailOpen} onOpenChange={setIsPhotoDetailOpen}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPhoto.title}</DialogTitle>
                <DialogDescription>
                  上传于 {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="md:col-span-3">
                  <div className="w-full rounded-md overflow-hidden">
                    <img
                      src={selectedPhoto.filePath}
                      alt={selectedPhoto.title}
                      className="max-h-80 w-full object-contain bg-gray-100"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium">状态</h4>
                    <Badge variant={getStatusBadgeVariant(selectedPhoto.status)}>
                      {getStatusBadgeText(selectedPhoto.status)}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">摄影师</h4>
                    <p className="text-sm">{selectedPhoto.photographerName || '未知摄影师'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">客户</h4>
                    <p className="text-sm">{selectedPhoto.clientName || '未知客户'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">尺寸</h4>
                    <p className="text-sm">
                      {selectedPhoto.metadata?.dimensions ? 
                        `${selectedPhoto.metadata.dimensions} (${selectedPhoto.metadata.size || '未知大小'})` : 
                        '未知尺寸'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">标签</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedPhoto.tags && selectedPhoto.tags.length > 0 ? (
                        selectedPhoto.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">无标签</span>
                      )}
                    </div>
                  </div>
                  {selectedPhoto.description && (
                    <div>
                      <h4 className="text-sm font-medium">描述</h4>
                      <p className="text-sm text-muted-foreground">{selectedPhoto.description}</p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsPhotoDetailOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkUpdateStatus("approved")}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    审核通过
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkUpdateStatus("archived")}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    归档
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除照片</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这张照片吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedPhoto && (
            <div className="py-4">
              <div className="overflow-hidden rounded-md">
                <img
                  src={selectedPhoto.thumbnailPath}
                  alt={selectedPhoto.title}
                  className="w-full object-cover"
                />
              </div>
              <h3 className="mt-2 font-medium">{selectedPhoto.title}</h3>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhoto}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量删除确认对话框 */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>批量删除照片</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除所选择的 {selectedPhotoIds.size} 张照片吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

