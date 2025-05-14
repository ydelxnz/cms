"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
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
  SelectItem,
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
import { notificationService } from "@/lib/services";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// 定义表单验证模式
const formSchema = z.object({
  userId: z.string({
    required_error: "请选择接收者",
  }),
  title: z.string().min(1, "标题不能为空").max(100, "标题不能超过100个字符"),
  message: z.string().min(1, "内容不能为空").max(500, "内容不能超过500个字符"),
  type: z.enum(["booking", "photo", "order", "system"], {
    required_error: "请选择通知类型",
  }),
});

export default function SendNotificationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string; role: string }[]>([]);

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      title: "",
      message: "",
      type: "system",
    },
  });

  // 加载用户数据
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("获取用户数据失败");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("获取用户失败:", error);
        toast({
          title: "错误",
          description: "获取用户列表失败，请稍后再试",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, []);

  // 提交表单
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const success = await notificationService.sendNotification(values);
      if (success) {
        toast({
          title: "成功",
          description: "通知已发送",
        });
        router.push("/admin/notifications");
      } else {
        throw new Error("发送通知失败");
      }
    } catch (error) {
      console.error("发送通知失败:", error);
      toast({
        title: "错误",
        description: "发送通知失败，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">发送通知</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新通知</CardTitle>
          <CardDescription>创建并发送一条新通知</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>接收者</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择接收者" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role === "admin" ? "管理员" : user.role === "photographer" ? "摄影师" : "客户"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>选择要接收此通知的用户</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>通知类型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择通知类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="booking">预约通知</SelectItem>
                        <SelectItem value="photo">照片通知</SelectItem>
                        <SelectItem value="order">订单通知</SelectItem>
                        <SelectItem value="system">系统通知</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>选择通知的类型</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>通知标题</FormLabel>
                    <FormControl>
                      <Input placeholder="输入通知标题" {...field} />
                    </FormControl>
                    <FormDescription>简短的通知标题</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>通知内容</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入通知内容"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>详细的通知内容</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "发送中..." : (
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
    </div>
  );
} 