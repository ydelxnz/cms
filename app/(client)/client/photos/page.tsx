"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Download, Filter, Grid, Image, List, Search, Tag, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { PhotoSession, Photo } from "@/lib/types";
import { photoService } from "@/lib/services";

export default function ClientPhotosPage() {
  const [photoSessions, setPhotoSessions] = useState<PhotoSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotoSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 获取客户的照片会话
        const sessions = await photoService.getClientPhotoSessions('current');
        setPhotoSessions(sessions);
        
        if (sessions.length > 0) {
          setCurrentSession(sessions[0].id);
          // 立即加载第一个会话的照片
          loadSessionPhotos(sessions[0].id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('获取照片会话失败:', error);
        setError('获取照片数据失败，请稍后再试');
        setIsLoading(false);
      }
    };
    
    fetchPhotoSessions();
  }, []);

  // Get all photos from the current session
  const currentSessionPhotos = photoSessions.find(
    (session) => session.id === currentSession
  )?.photos || [];

  // Get all unique categories from all photos
  const allCategories = Array.from(
    new Set(
      photoSessions.flatMap((session) =>
        session.photos?.map((photo) => photo.category) || []
      )
    )
  ).filter(Boolean) as string[];

  // Filter photos based on search term and category
  const filteredPhotos = currentSessionPhotos.filter((photo) => {
    const matchesSearch =
      !searchTerm ||
      photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || photo.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Toggle photo selection
  const togglePhotoSelection = (photoId: string) => {
    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(selectedPhotos.filter((id) => id !== photoId));
    } else {
      setSelectedPhotos([...selectedPhotos, photoId]);
    }
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedPhotos([]);
  };

  // Select all visible photos
  const selectAllVisible = () => {
    setSelectedPhotos(filteredPhotos.map((photo) => photo.id));
  };

  // Download selected photos
  const downloadSelectedPhotos = async () => {
    try {
      // 在实际应用中，这里应该调用API下载照片
      // 例如：await photoService.downloadPhotos(selectedPhotos);
      
      alert(`已选择 ${selectedPhotos.length} 张照片，开始下载...`);
      
      // 下载完成后清除选择
      setSelectedPhotos([]);
    } catch (error) {
      console.error('下载照片失败:', error);
      alert('下载照片失败，请稍后再试');
    }
  };

  // 加载特定会话的照片
  const loadSessionPhotos = async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentSession(sessionId);
      
      console.log(`加载会话照片, 会话ID: ${sessionId}`);
      
      // 获取会话的照片
      const photos = await photoService.getPhotosBySessionId(sessionId);
      
      console.log(`获取到照片数量: ${photos.length}`);
      
      // 更新会话中的照片数据
      setPhotoSessions(prevSessions => 
        prevSessions.map(s => 
          s.id === sessionId ? { ...s, photos } : s
        )
      );
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('获取会话照片失败:', error);
      
      let errorMessage = '获取照片数据失败，请稍后再试';
      if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // 当选择会话改变时加载照片
  const handleSessionChange = (sessionId: string) => {
    if (sessionId !== currentSession) {
      loadSessionPhotos(sessionId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">我的照片</h2>
        <div className="flex space-x-2">
          {selectedPhotos.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelections}
              >
                清除选择
              </Button>
              <Button
                size="sm"
                onClick={downloadSelectedPhotos}
              >
                <Download className="mr-2 h-4 w-4" />
                下载 ({selectedPhotos.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Session selector */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      ) : photoSessions.length > 0 ? (
        <>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex-1 md:max-w-sm">
              <Select
                value={currentSession || ""}
                onValueChange={handleSessionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择照片集" />
                </SelectTrigger>
                <SelectContent>
                  {photoSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {format(new Date(session.date), "yyyy-MM-dd")} - {session.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === "grid" ? "bg-accent" : ""}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === "list" ? "bg-accent" : ""}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索照片..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      {categoryFilter === "all" ? "所有分类" : categoryFilter}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Photos display */}
          {filteredPhotos.length > 0 ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "space-y-4"}>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`group relative ${
                    viewMode === "grid" ? "" : "flex items-center space-x-4 rounded-lg border p-3"
                  }`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {viewMode === "grid" ? (
                    <>
                      <div
                        className={`aspect-square overflow-hidden rounded-md ${
                          selectedPhotos.includes(photo.id)
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        }`}
                      >
                        <img
                          src={photo.thumbnailUrl}
                          alt={photo.title || "照片"}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            console.error(`图片加载失败: ${photo.thumbnailUrl}`, e);
                            // 设置为默认图片
                            e.currentTarget.src = "/images/placeholder.png"; 
                            // 如果没有默认图片，可以使用内联样式显示错误状态
                            e.currentTarget.style.background = "#f0f0f0";
                            e.currentTarget.style.display = "flex";
                            e.currentTarget.style.alignItems = "center";
                            e.currentTarget.style.justifyContent = "center";
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-10" />
                      </div>
                      <button
                        className={`absolute right-2 top-2 rounded-full p-1 ${
                          selectedPhotos.includes(photo.id)
                            ? "bg-primary text-white"
                            : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoSelection(photo.id);
                        }}
                      >
                        {selectedPhotos.includes(photo.id) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </button>
                      <div className="mt-2">
                        <p className="font-medium line-clamp-1">{photo.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {photo.category}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md ${
                          selectedPhotos.includes(photo.id)
                            ? "ring-2 ring-primary ring-offset-2"
                            : ""
                        }`}
                      >
                        <img
                          src={photo.thumbnailUrl}
                          alt={photo.title || "照片"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{photo.title}</p>
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Tag className="mr-1 h-3 w-3" />
                            {photo.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(photo.createdAt), "yyyy-MM-dd")}
                          </span>
                        </div>
                      </div>
                      <button
                        className={`rounded-full p-1 ${
                          selectedPhotos.includes(photo.id)
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoSelection(photo.id);
                        }}
                      >
                        {selectedPhotos.includes(photo.id) ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
              <Image className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {searchTerm || categoryFilter !== "all"
                  ? "没有找到匹配的照片"
                  : "该会话中没有照片"}
              </p>
              {(searchTerm || categoryFilter !== "all") && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                  }}
                >
                  清除筛选条件
                </Button>
              )}
            </div>
          )}

          {/* Batch actions */}
          {filteredPhotos.length > 0 && selectedPhotos.length === 0 && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={selectAllVisible}>
                选择全部可见照片
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed">
          <Image className="mb-2 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">暂无照片</p>
          <p className="text-sm text-muted-foreground">
            您还没有任何照片集
          </p>
        </div>
      )}

      {/* Photo detail dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title}</DialogTitle>
            <DialogDescription>
              {selectedPhoto?.category} · {selectedPhoto?.createdAt && format(new Date(selectedPhoto.createdAt), "yyyy-MM-dd")}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg">
            <img
              src={selectedPhoto?.url}
              alt={selectedPhoto?.title || "照片"}
              className="h-full w-full object-contain"
              onError={(e) => {
                console.error(`大图加载失败: ${selectedPhoto?.url}`, e);
                // 设置为默认图片或显示错误信息
                e.currentTarget.style.background = "#f0f0f0";
                e.currentTarget.style.display = "flex";
                e.currentTarget.style.alignItems = "center";
                e.currentTarget.style.justifyContent = "center";
                e.currentTarget.style.height = "300px";
                e.currentTarget.style.width = "100%";
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPhoto(null)}>
              关闭
            </Button>
            <Button onClick={() => {
              if (selectedPhoto) {
                // 在实际应用中，这里应该调用API下载单张照片
                alert(`开始下载照片: ${selectedPhoto.title}`);
              }
            }}>
              <Download className="mr-2 h-4 w-4" />
              下载
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
