"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TestBookingStatusApi() {
  const [bookingId, setBookingId] = useState("");
  const [status, setStatus] = useState<"pending" | "confirmed" | "completed" | "cancelled">("confirmed");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 测试更新预约状态
  const handleUpdateStatus = async () => {
    if (!bookingId) {
      setError("请输入预约ID");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log("发送请求:", {
        status,
        notes
      });
      
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          notes
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "更新状态失败");
      }
      
      setResponse(data);
      console.log("API响应:", data);
      
    } catch (err: any) {
      console.error("更新状态失败:", err);
      setError(err.message || "更新预约状态失败");
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const responseSummary = response ? (
    <div className="space-y-2">
      <p><span className="font-medium">消息:</span> {response.message}</p>
      {response.booking && (
        <>
          <p><span className="font-medium">预约ID:</span> {response.booking.id}</p>
          <p><span className="font-medium">状态:</span> {response.booking.status}</p>
          <p><span className="font-medium">备注:</span> {response.booking.notes || "无备注"}</p>
          <p><span className="font-medium">更新时间:</span> {response.booking.updatedAt}</p>
        </>
      )}
    </div>
  ) : null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">预约状态更新 API 测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>测试表单</CardTitle>
            <CardDescription>用于测试预约状态更新API</CardDescription>
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
              <Label htmlFor="status">状态</Label>
              <Select 
                value={status} 
                onValueChange={(value) => setStatus(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择预约状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待确认</SelectItem>
                  <SelectItem value="confirmed">已确认</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                  <SelectItem value="cancelled">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">备注信息</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="添加备注信息"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpdateStatus}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  测试中...
                </>
              ) : "测试更新状态"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API 响应</CardTitle>
            <CardDescription>接口返回的数据</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-medium">错误:</p>
                <p>{error}</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : response ? (
              <>
                <h3 className="font-medium mb-2">响应摘要:</h3>
                {responseSummary}
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">完整响应:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-[300px]">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                点击"测试更新状态"按钮查看API响应
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 