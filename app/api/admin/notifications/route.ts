import { NextRequest, NextResponse } from "next/server";
import { getNotifications, getUsers } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取所有通知列表（仅管理员可用）
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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const userIdFilter = searchParams.get("userId");
    const typeFilter = searchParams.get("type");
    const statusFilter = searchParams.get("status");
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    // 获取所有通知
    let notifications = await getNotifications();
    
    // 应用过滤器
    if (userIdFilter) {
      notifications = notifications.filter(n => n.userId === userIdFilter);
    }
    
    if (typeFilter) {
      notifications = notifications.filter(n => n.type === typeFilter);
    }
    
    if (statusFilter === "read") {
      notifications = notifications.filter(n => n.isRead);
    } else if (statusFilter === "unread") {
      notifications = notifications.filter(n => !n.isRead);
    }
    
    // 排序
    notifications.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    
    // 获取所有用户信息，以便将用户名附加到通知
    const users = await getUsers();
    const userMap = users.reduce((map, user) => {
      map[user.id] = user.name;
      return map;
    }, {} as Record<string, string>);
    
    // 为每个通知添加用户名
    const notificationsWithUsernames = notifications.map(notification => ({
      ...notification,
      userName: userMap[notification.userId] || "未知用户"
    }));
    
    return NextResponse.json({
      notifications: notificationsWithUsernames,
      stats: {
        total: notifications.length,
        unread: notifications.filter(n => !n.isRead).length,
        system: notifications.filter(n => n.type === "system").length,
        booking: notifications.filter(n => n.type === "booking").length,
        photo: notifications.filter(n => n.type === "photo").length,
        order: notifications.filter(n => n.type === "order").length,
      }
    });
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    return NextResponse.json(
      { error: "获取通知数据失败" },
      { status: 500 }
    );
  }
} 