import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取用户详细资料
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取用户数据
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：只有管理员、摄影师和当事人可以查看用户资料
    if (
      session.user.role !== "admin" && 
      session.user.id !== userId && 
      (session.user.role !== "photographer" || user.role !== "client")
    ) {
      return NextResponse.json(
        { error: "没有权限查看此用户资料" },
        { status: 403 }
      );
    }
    
    // 构建用户资料响应
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email || undefined,
      profile: user.profile || {},
    };
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error(`Error fetching user profile ${params.id}:`, error);
    return NextResponse.json(
      { error: "获取用户资料失败" },
      { status: 500 }
    );
  }
} 