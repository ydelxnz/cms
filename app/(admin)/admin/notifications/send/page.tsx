"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { notificationService } from "@/lib/services";

// 系统通知发送表单模式
const systemNotificationSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  message: z.string().min(1, "通知内容不能为空"),
  targetRole: z.enum(["all", "client", "photographer", "admin"]),
});

// 个人通知发送表单模式
const userNotificationSchema = z.object({
  userId: z.string().min(1, "用户ID不能为空"),
  title: z.string().min(1, "标题不能为空"),
  message: z.string().min(1, "通知内容不能为空"),
  type: z.enum(["system", "booking", "photo", "order"]),
});

// 发送通知页面
export default function SendNotificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("system");

  // 系统通知表单
  const systemForm = useForm<z.infer<typeof systemNotificationSchema>>({
    resolver: zodResolver(systemNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
      targetRole: "client",
    },
  });

  // 个人通知表单
  const userForm = useForm<z.infer<typeof userNotificationSchema>>({
    resolver: zodResolver(userNotificationSchema),
    defaultValues: {
      userId: "",
      title: "",
      message: "",
      type: "system",
    },
  });

  // 发送系统通知
  const handleSendSystemNotification = async (
    values: z.infer<typeof systemNotificationSchema>
  ) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/notifications/system", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "发送通知失败");
      }
      
      toast({
        title: "通知发送成功",
        description: data.message,
      });
      
      // 重置表单
      systemForm.reset();
    } catch (error) {
      console.error("发送系统通知失败:", error);
      toast({
        title: "通知发送失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 发送个人通知
  const handleSendUserNotification = async (
    values: z.infer<typeof userNotificationSchema>
  ) => {
    try {
      setIsLoading(true);
      
      const success = await notificationService.sendNotification({
        userId: values.userId,
        title: values.title,
        message: values.message,
        type: values.type,
      });
      
      if (!success) {
        throw new Error("发送通知失败");
      }
      
      toast({
        title: "通知发送成功",
        description: "已成功向指定用户发送通知",
      });
      
      // 重置表单
      userForm.reset();
    } catch (error) {
      console.error("发送用户通知失败:", error);
      toast({
        title: "通知发送失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">发送通知</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="system">系统通知</TabsTrigger>
          <TabsTrigger value="user">用户通知</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>发送系统通知</CardTitle>
              <CardDescription>
                向指定角色的所有用户发送系统通知。此操作将向多个用户发送相同的消息，请谨慎使用。
              </CardDescription>
            </CardHeader>
            
            <Form {...systemForm}>
              <form onSubmit={systemForm.handleSubmit(handleSendSystemNotification)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={systemForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>通知标题</FormLabel>
                        <FormControl>
                          <Input placeholder="输入通知标题" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={systemForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>通知内容</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="输入通知详细内容"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={systemForm.control}
                    name="targetRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目标用户角色</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择目标用户角色" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">所有用户</SelectItem>
                            <SelectItem value="client">客户</SelectItem>
                            <SelectItem value="photographer">摄影师</SelectItem>
                            <SelectItem value="admin">管理员</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          选择要接收此通知的用户角色
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-md bg-amber-50 p-4 border border-amber-200 mt-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">注意</h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>
                            发送系统通知会通知所有选定角色的用户。请确保内容准确且必要，避免过度打扰用户。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/notifications")}
                  >
                    返回
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>发送中...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        发送通知
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>发送用户通知</CardTitle>
              <CardDescription>
                向特定用户发送个人通知。请确保用户ID正确无误。
              </CardDescription>
            </CardHeader>
            
            <Form {...userForm}>
              <form onSubmit={userForm.handleSubmit(handleSendUserNotification)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={userForm.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>用户ID</FormLabel>
                        <FormControl>
                          <Input placeholder="输入目标用户ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          用户ID格式如: user_client_1, user_photographer_2
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>通知标题</FormLabel>
                        <FormControl>
                          <Input placeholder="输入通知标题" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>通知内容</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="输入通知详细内容"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={userForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>通知类型</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择通知类型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="system">系统</SelectItem>
                            <SelectItem value="booking">预约</SelectItem>
                            <SelectItem value="photo">照片</SelectItem>
                            <SelectItem value="order">订单</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          选择通知的类型，不同类型显示不同颜色
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/notifications")}
                  >
                    返回
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>发送中...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        发送通知
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 