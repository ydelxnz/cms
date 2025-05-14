"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, Upload, Check, AlertCircle } from "lucide-react";

export default function TestPhotoUploadPage() {
  const [bookingId, setBookingId] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const handleUpload = async () => {
    if (!bookingId) {
      setError("请输入预约ID");
      return;
    }
    
    if (files.length === 0) {
      setError("请选择至少一张照片");
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      setResponse(null);
      setUploadProgress(0);
      
      // 创建FormData对象
      const formData = new FormData();
      
      // 添加预约ID
      formData.append("bookingId", bookingId);
      
      // 添加文件元数据
      const metadata = files.map((file, index) => ({
        id: `file_${index}`,
        name: file.name.replace(/\.[^/.]+$/, ""), // 移除扩展名
        category: "未分类"
      }));
      
      formData.append("metadata", JSON.stringify(metadata));
      
      // 添加文件
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      // 上传文件
      const xhr = new XMLHttpRequest();
      
      // 监听上传进度
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });
      
      // 处理响应
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          const responseData = JSON.parse(xhr.responseText);
          setResponse(responseData);
        } else {
          let errorMsg = "上传失败";
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMsg = errorData.error || errorMsg;
          } catch {
            // 解析错误，使用默认错误消息
          }
          setError(errorMsg);
        }
        setIsUploading(false);
      };
      
      // 处理错误
      xhr.onerror = function() {
        setError("网络错误，请检查连接");
        setIsUploading(false);
      };
      
      // 发送请求
      xhr.open("POST", "/api/photos/upload");
      xhr.send(formData);
      
    } catch (error: any) {
      console.error("上传错误:", error);
      setError(error.message || "上传照片时发生错误");
      setIsUploading(false);
    }
  };
  
  const handleClearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">照片上传 API 测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>上传表单</CardTitle>
            <CardDescription>测试照片上传API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingId">预约ID</Label>
              <Input
                id="bookingId"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="输入预约ID"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="photos">选择照片</Label>
              <Input
                id="photos"
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {files.length > 0 && (
                <div className="mt-2">
                  <p>已选择 {files.length} 个文件</p>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {files.slice(0, 5).map((file, index) => (
                      <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                    ))}
                    {files.length > 5 && <li>... 还有 {files.length - 5} 个文件</li>}
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearFiles}
                    className="mt-2"
                  >
                    清空选择
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0 || !bookingId}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上传中 ({uploadProgress}%)
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  开始上传
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>上传结果</CardTitle>
            <CardDescription>API 响应数据</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">错误: </span>
                  <span className="ml-1">{error}</span>
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-muted-foreground">
                  上传进度: {uploadProgress}%
                </p>
              </div>
            )}
            
            {response && (
              <div className="space-y-4">
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">上传成功</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{response.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {response.photos && response.photos.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">上传的照片:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {response.photos.slice(0, 4).map((photo: any, index: number) => (
                        <div key={index} className="border rounded p-2">
                          <p className="truncate text-sm">{photo.title}</p>
                          <p className="text-xs text-muted-foreground">ID: {photo.id}</p>
                        </div>
                      ))}
                    </div>
                    {response.photos.length > 4 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        还有 {response.photos.length - 4} 张照片未显示
                      </p>
                    )}
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    查看完整响应
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            
            {!error && !isUploading && !response && (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                请完成表单并点击上传按钮
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 