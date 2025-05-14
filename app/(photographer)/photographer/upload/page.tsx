"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Upload, 
  X, 
  Image, 
  Check, 
  AlertCircle, 
  Loader2, 
  ChevronLeft, 
  Camera, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { Booking, Photo } from "@/lib/types";
import { photoService, photographerService } from "@/lib/services";

// 照片分类选项
const photoCategories = [
  "婚纱照",
  "艺术人像",
  "全家福",
  "儿童摄影",
  "商业摄影",
  "证件照",
  "其他",
];

export default function PhotographerUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [sessions, setSessions] = useState<Booking[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedSessionData, setSelectedSessionData] = useState<Booking | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string>("");
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);

  // 加载摄影师的拍摄记录
  useEffect(() => {
    const fetchSessions = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // 获取摄影师的拍摄记录
        const response = await photographerService.getPhotographerSessions(session.user.id);
        
        // 过滤出已完成或已确认的会话，这些会话可以上传照片
        const availableSessions = response.filter(session => 
          session.status === 'completed' || session.status === 'confirmed'
        );
        
        setSessions(availableSessions);
        
        // 检查URL参数中是否有bookingId
        const bookingId = searchParams.get('bookingId');
        if (bookingId && availableSessions.some(s => s.id === bookingId)) {
          setSelectedSession(bookingId);
          const sessionData = availableSessions.find(s => s.id === bookingId);
          if (sessionData) {
            setSelectedSessionData(sessionData);
            if (sessionData.notes) {
              setSessionNotes(sessionData.notes);
            }
          }
        } else if (availableSessions.length > 0) {
          setSelectedSession(availableSessions[0].id);
          setSelectedSessionData(availableSessions[0]);
          if (availableSessions[0].notes) {
            setSessionNotes(availableSessions[0].notes);
          }
        }
      } catch (error) {
        console.error('获取拍摄记录失败:', error);
        setError('获取拍摄记录失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [session?.user?.id, searchParams]);

  // 当选择的会话更改时，更新会话数据
  useEffect(() => {
    if (selectedSession) {
      const session = sessions.find((s) => s.id === selectedSession);
      if (session) {
        setSelectedSessionData(session);
        if (session.notes) {
          setSessionNotes(session.notes);
        }
      }
    }
  }, [selectedSession, sessions]);

  // 当组件卸载时清理预览URL
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [previews]);

  // 文件拖放处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 添加新文件并过滤重复文件
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles = acceptedFiles.filter(file => !existingNames.has(file.name));
      return [...prev, ...newFiles];
    });
    
    // 为每个新文件生成预览
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  // 移除文件
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 应用默认分类到所有照片
  const applyDefaultCategoryToAll = () => {
    if (!defaultCategory) return;
    
    // 创建一个FormData对象用于添加分类信息
    const formData = new FormData();
    formData.append('category', defaultCategory);
    
    // 将分类信息添加到所有文件
    setFiles(files.map(file => {
      const newFile = new File([file], file.name, { type: file.type });
      return newFile;
    }));
  };

  // 上传照片
  const handleUpload = async () => {
    if (!selectedSession || files.length === 0) {
      toast({
        title: "请选择拍摄记录和照片",
        description: "请选择一个拍摄记录并至少上传一张照片",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      
      // 添加预约ID
      formData.append("bookingId", selectedSession);
      
      // 准备照片元数据
      const metadata = files.map((file, index) => ({
        id: `photo_${index}`,
        name: file.name,
        category: defaultCategory || "普通"
      }));
      
      // 添加照片元数据
      formData.append("metadata", JSON.stringify(metadata));
      
      // 添加文件到FormData
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      console.log(`准备上传 ${files.length} 张照片到会话: ${selectedSession}`);
      
      // 调用上传API
      const photos = await photoService.uploadPhotos(
        selectedSession, 
        formData, 
        (progress) => {
          // 更新上传进度
          setUploadProgress(progress);
        }
      );
      
      console.log(`上传成功，收到 ${photos.length} 张照片数据`);
      setUploadedPhotos(photos);
      setUploadComplete(true);
      setShowConfirmDialog(true);
      
      toast({
        title: "上传成功",
        description: `已成功上传 ${photos.length} 张照片`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('上传照片失败:', error);
      
      // 提取更具体的错误信息
      let errorMessage = error.message || '上传照片失败，请稍后再试';
      setError(errorMessage);
      
      toast({
        title: "上传失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 确认上传完成后的处理
  const handleConfirmUpload = () => {
    // 关闭对话框
    setShowConfirmDialog(false);
    // 清空文件列表
    setFiles([]);
    setPreviews([]);
    // 重置上传状态
    setUploadComplete(false);
    // 导航到照片列表页面
    router.push('/photographer/dashboard');
  };

  // 返回前一页
  const goBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">上传照片</h2>
        <Button variant="outline" onClick={goBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin rounded-full text-primary" />
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-red-500">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              重试
            </Button>
          </div>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground">暂无可用的拍摄记录</p>
            <Button variant="outline" onClick={() => router.push("/photographer/bookings")}>
              查看预约记录
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>选择拍摄记录</CardTitle>
              <CardDescription>
                选择要上传照片的拍摄记录，系统会自动将照片与客户关联
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="session">拍摄记录</Label>
                <Select
                  value={selectedSession}
                  onValueChange={setSelectedSession}
                >
                  <SelectTrigger id="session">
                    <SelectValue placeholder="选择拍摄记录" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.clientName || "未命名客户"} - {session.type || "未分类"} ({format(new Date(session.date), "yyyy-MM-dd")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSessionData && (
                <div className="rounded-md bg-muted p-4">
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          客户
                        </p>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p>{selectedSessionData.clientName || "未命名客户"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          日期
                        </p>
                        <p>
                          {format(
                            new Date(selectedSessionData.date),
                            "yyyy年MM月dd日",
                            { locale: zhCN }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          类型
                        </p>
                        <p>{selectedSessionData.type || "未分类"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          地点
                        </p>
                        <p>{selectedSessionData.location || "未指定"}</p>
                      </div>
                    </div>
                    {sessionNotes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          备注
                        </p>
                        <p className="whitespace-pre-line">{sessionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>上传照片</CardTitle>
              <CardDescription>
                拖放照片或点击选择文件上传，照片将自动与客户关联
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">默认分类</Label>
                  <Select
                    value={defaultCategory}
                    onValueChange={setDefaultCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="选择默认分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {photoCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {defaultCategory && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applyDefaultCategoryToAll}
                      className="mt-2 w-auto"
                      disabled={isUploading || files.length === 0}
                    >
                      应用分类到所有照片
                    </Button>
                  )}
                </div>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <h3 className="font-medium">拖放照片到此处</h3>
                  <p className="text-sm text-muted-foreground">
                    或者点击选择文件上传（最大10MB每张）
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      已选择 {files.length} 张照片
                    </h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setFiles([]);
                        setPreviews([]);
                      }}
                      disabled={isUploading}
                    >
                      清空
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {previews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative overflow-hidden rounded-lg border"
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={preview}
                            alt={files[index]?.name || "预览图"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="mb-1 text-sm font-medium truncate">
                            {files[index]?.name || "未命名文件"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((files[index]?.size || 0) / 1024)} KB
                          </p>
                        </div>
                        {!isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isUploading && (
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">上传进度</span>
                    <span className="text-sm font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={
                  isUploading || files.length === 0 || !selectedSession
                }
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    上传中...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    开始上传
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传成功</DialogTitle>
            <DialogDescription>
              所有照片已成功上传并与客户 {selectedSessionData?.clientName} 关联。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <Check className="h-16 w-16 text-green-500" />
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmUpload}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 