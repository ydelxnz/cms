"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email({
    message: "请输入有效的电子邮件地址",
  }),
  password: z.string().min(6, {
    message: "密码至少需要6个字符",
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const registered = searchParams.get("registered");
  
  const { login, loading, error: authError, user, isAuthenticated } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 登录表单
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 如果用户已经登录，跳转到回调地址
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "client") {
        router.push("/client/dashboard");
      } else if (user.role === "photographer") {
        router.push("/photographer/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push(callbackUrl);
      }
    }
  }, [isAuthenticated, user, router, callbackUrl]);

  // 如果有注册成功的参数，显示成功消息
  useEffect(() => {
    if (registered === "true") {
      setSuccess("注册成功！请使用您的邮箱和密码登录。");
    }
  }, [registered]);

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setFormError(null);

    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        // 登录组件中的useEffect会自动处理重定向
      }
    } catch (error) {
      setFormError("登录时发生错误，请稍后再试");
      console.error(error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Image
            src="/images/logo.svg"
            alt="摄影影楼 Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            欢迎回来
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            登录您的账户以访问摄影影楼系统
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">账户登录</CardTitle>
          </CardHeader>
          
          <CardContent>
            {success && (
              <Alert className="mb-4 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}
            
            {(formError || authError) && (
              <Alert className="mb-4 bg-red-50">
                <AlertDescription className="text-red-700">{formError || authError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入邮箱" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="请输入密码" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "登录中..." : "登录"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t p-4">
            <div className="text-center text-sm">
              还没有账户？{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                立即注册
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
