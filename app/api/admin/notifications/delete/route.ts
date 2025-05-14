import { NextRequest, NextResponse } from "next/server";
import { getNotifications, deleteNotification, writeData } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import path from "path";

const NOTIFICATIONS_FILE = path.join(process.cwd(), "data", "notifications.json");

// 管理员批量删除通知
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
    const { notificationIds, filters } = body;
    
    // 获取所有通知
    let notifications = await getNotifications();
    
    // 方式1: 通过ID列表删除特定通知
    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      const idsSet = new Set(notificationIds);
      notifications = notifications.filter(n => !idsSet.has(n.id));
    }
    // 方式2: 通过过滤条件批量删除
    else if (filters) {
      const { userId, type, status } = filters;
      
      if (userId) {
        notifications = notifications.filter(n => n.userId !== userId);
      }
      
      if (type) {
        notifications = notifications.filter(n => n.type !== type);
      }
      
      if (status === "read") {
        notifications = notifications.filter(n => !n.isRead);
      } else if (status === "unread") {
        notifications = notifications.filter(n => n.isRead);
      }
    } else {
      return NextResponse.json(
        { error: "缺少必要参数: notificationIds 或 filters" },
        { status: 400 }
      );
    }
    
    // 写入更新后的通知列表
    await writeData(NOTIFICATIONS_FILE, notifications);
    
    return NextResponse.json({
      message: "通知删除成功",
      count: notifications.length
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "删除通知失败" },
      { status: 500 }
    );
  }
} 