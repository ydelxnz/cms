import { NextRequest, NextResponse } from "next/server";
import { 
  getNotificationsByUser, 
  getUnreadNotificationsByUser, 
  createNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  deleteAllNotifications
} from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取通知列表
export async function GET(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败，请先登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    
    const notifications = unreadOnly 
      ? await getUnreadNotificationsByUser(userId)
      : await getNotificationsByUser(userId);
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "获取通知数据失败" },
      { status: 500 }
    );
  }
}

// 创建通知（仅管理员可用）
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
    const { userId, title, message, type } = body;
    
    // 验证必填字段
    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 验证类型
    if (!["booking", "photo", "order", "system"].includes(type)) {
      return NextResponse.json(
        { error: "无效的通知类型" },
        { status: 400 }
      );
    }
    
    // 创建通知
    const newNotification = await createNotification({
      userId,
      title,
      message,
      type,
    });
    
    return NextResponse.json(
      { message: "通知已创建", notification: newNotification },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "创建通知失败" },
      { status: 500 }
    );
  }
}

// 标记所有通知为已读
export async function PATCH(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败，请先登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const success = await markAllNotificationsAsRead(userId);
    
    if (!success) {
      return NextResponse.json(
        { message: "没有未读通知需要标记" }
      );
    }
    
    return NextResponse.json({
      message: "所有通知已标记为已读",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "标记通知失败" },
      { status: 500 }
    );
  }
}

// 删除所有通知
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败，请先登录" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const success = await deleteAllNotifications(userId);
    
    if (!success) {
      return NextResponse.json(
        { message: "没有通知需要删除" }
      );
    }
    
    return NextResponse.json({ message: "所有通知已删除" });
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    return NextResponse.json(
      { error: "删除通知失败" },
      { status: 500 }
    );
  }
} 