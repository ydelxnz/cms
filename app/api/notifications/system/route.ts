import { NextRequest, NextResponse } from "next/server";
import { getUsers, createNotification } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 系统通知 - 向特定角色的所有用户发送通知
export async function POST(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "认证失败，没有权限访问此资源" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, targetRole } = body;
    
    // 验证必填字段
    if (!title || !message) {
      return NextResponse.json(
        { error: "缺少必要字段：标题和消息内容" },
        { status: 400 }
      );
    }
    
    // 验证目标角色
    const validRoles = ["client", "photographer", "admin", "all"];
    if (targetRole && !validRoles.includes(targetRole)) {
      return NextResponse.json(
        { error: "无效的目标角色" },
        { status: 400 }
      );
    }
    
    // 获取所有用户
    const allUsers = await getUsers();
    
    // 筛选目标用户
    const targetUsers = targetRole === "all" 
      ? allUsers 
      : allUsers.filter(user => user.role === targetRole);
    
    if (targetUsers.length === 0) {
      return NextResponse.json(
        { message: "没有找到目标用户，未发送任何通知" },
        { status: 200 }
      );
    }
    
    // 批量创建通知
    const notificationPromises = targetUsers.map(user => 
      createNotification({
        userId: user.id,
        title,
        message,
        type: "system"
      })
    );
    
    // 等待所有通知创建完成
    await Promise.all(notificationPromises);
    
    return NextResponse.json({
      message: `成功向${targetUsers.length}位${targetRole === "all" ? "所有" : targetRole}用户发送系统通知`,
      notifiedCount: targetUsers.length
    });
  } catch (error) {
    console.error("Error sending system notifications:", error);
    return NextResponse.json(
      { error: "发送系统通知失败" },
      { status: 500 }
    );
  }
} 