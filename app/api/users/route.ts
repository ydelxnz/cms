import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// 获取用户列表（需要管理员权限）
export async function GET(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "认证失败，没有权限访问此资源" },
        { status: 403 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    
    const users = await getUsers();
    
    // 过滤用户数据，移除密码字段
    const safeUsers = users.map(({ password, ...user }) => user);
    
    // 如果指定了角色，过滤结果
    const filteredUsers = role 
      ? safeUsers.filter(user => user.role === role)
      : safeUsers;
      
    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "获取用户数据失败" },
      { status: 500 }
    );
  }
}

// 创建新用户（注册，不需要权限）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = "client" } = body;
    
    // 验证必填字段
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 验证角色
    if (role !== "client" && role !== "photographer" && role !== "admin") {
      return NextResponse.json(
        { error: "无效的用户角色" },
        { status: 400 }
      );
    }
    
    // 管理员创建需要验证权限
    if (role === "admin") {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "admin") {
        return NextResponse.json(
          { error: "只有管理员可以创建管理员账户" },
          { status: 403 }
        );
      }
    }
    
    // 摄影师注册需要验证权限（或者改为待审核状态）
    if (role === "photographer") {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "admin") {
        return NextResponse.json(
          { error: "摄影师账户需要管理员创建或审核" },
          { status: 403 }
        );
      }
    }
    
    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 创建用户
    const newUser = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
    });
    
    // 返回用户数据（不包含密码）
    const { password: _, ...safeUser } = newUser;
    
    return NextResponse.json(
      { message: "用户创建成功", user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    
    // 处理特定错误
    if (error instanceof Error && error.message === "Email already exists") {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "创建用户失败" },
      { status: 500 }
    );
  }
} 