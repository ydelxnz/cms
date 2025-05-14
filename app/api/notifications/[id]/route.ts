import { NextRequest, NextResponse } from "next/server";
import { markNotificationAsRead, deleteNotification, getNotifications } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 标记单个通知为已读
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败，请先登录" },
        { status: 401 }
      );
    }

    const notificationId = params.id;
    
    // 验证通知是否存在
    const notifications = await getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { error: "通知不存在" },
        { status: 404 }
      );
    }
    
    // 验证通知是否属于当前用户
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "无权访问此通知" },
        { status: 403 }
      );
    }
    
    // 标记通知为已读
    const updatedNotification = await markNotificationAsRead(notificationId);
    
    if (!updatedNotification) {
      return NextResponse.json(
        { error: "标记通知失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "通知已标记为已读",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "标记通知失败" },
      { status: 500 }
    );
  }
}

// 删除单个通知
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败，请先登录" },
        { status: 401 }
      );
    }

    const notificationId = params.id;
    
    // 验证通知是否存在
    const notifications = await getNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { error: "通知不存在" },
        { status: 404 }
      );
    }
    
    // 验证通知是否属于当前用户
    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { error: "无权访问此通知" },
        { status: 403 }
      );
    }
    
    // 删除通知
    const success = await deleteNotification(notificationId);
    
    if (!success) {
      return NextResponse.json(
        { error: "删除通知失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: "通知已删除" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "删除通知失败" },
      { status: 500 }
    );
  }
} 