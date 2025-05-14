import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBooking, deleteBooking, createNotification, getUserById } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取预约详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    const booking = await getBookingById(bookingId);
    
    if (!booking) {
      return NextResponse.json(
        { error: "预约不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：只有管理员、相关摄影师和客户可以查看预约详情
    if (
      session.user.role !== "admin" && 
      booking.photographerId !== session.user.id && 
      booking.clientId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "没有权限查看此预约" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error(`Error fetching booking ${params.id}:`, error);
    return NextResponse.json(
      { error: "获取预约数据失败" },
      { status: 500 }
    );
  }
}

// 更新预约状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const body = await request.json();
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前预约
    const booking = await getBookingById(bookingId);
    
    if (!booking) {
      return NextResponse.json(
        { error: "预约不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限
    const isAdmin = session.user.role === "admin";
    const isPhotographer = session.user.id === booking.photographerId;
    const isClient = session.user.id === booking.clientId;
    
    // 根据请求和角色决定可以更新的内容
    const { status, notes, ...otherUpdates } = body;
    let updateData: any = {};
    
    // 管理员可以更新所有字段
    if (isAdmin) {
      updateData = body;
    } 
    // 摄影师可以更新状态和备注
    else if (isPhotographer) {
      if (status) updateData.status = status;
      if (notes) updateData.notes = notes;
    } 
    // 客户只能更新部分状态（取消）和备注
    else if (isClient) {
      if (status === "cancelled") updateData.status = status;
      if (notes) updateData.notes = notes;
    } 
    // 其他人无权更新
    else {
      return NextResponse.json(
        { error: "没有权限更新此预约" },
        { status: 403 }
      );
    }
    
    // 如果没有可更新的内容
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "没有提供有效的更新内容" },
        { status: 400 }
      );
    }
    
    // 更新预约
    const updatedBooking = await updateBooking(bookingId, updateData);
    
    if (!updatedBooking) {
      return NextResponse.json(
        { error: "更新预约失败" },
        { status: 500 }
      );
    }
    
    // 状态更新时发送通知
    if (status && status !== booking.status) {
      try {
        // 获取客户和摄影师信息
        const client = await getUserById(booking.clientId);
        const photographer = await getUserById(booking.photographerId);
        
        let title = "";
        let message = "";
        
        switch(status) {
          case "confirmed":
            title = "预约已确认";
            message = `您的预约已被摄影师${photographer?.name || ''}确认。预约时间: ${booking.date} ${booking.startTime}。`;
            break;
          case "cancelled":
            title = "预约已取消";
            if (isClient) {
              message = `您已取消预约。预约时间: ${booking.date} ${booking.startTime}。`;
            } else {
              message = `您的预约已被${isPhotographer ? '摄影师' : '系统'}取消。预约时间: ${booking.date} ${booking.startTime}。`;
            }
            break;
          case "completed":
            title = "预约已完成";
            message = `您的预约已完成。感谢您的信任，摄影师将尽快上传照片。`;
            break;
          default:
            title = `预约状态已更新为${status}`;
            message = `您的预约状态已更新。预约时间: ${booking.date} ${booking.startTime}。`;
        }
        
        // 向客户发送通知
        await createNotification({
          userId: booking.clientId,
          title,
          message,
          type: "booking"
        });
        
        // 如果客户变更了预约状态，也向摄影师发送通知
        if (isClient && (status === "cancelled")) {
          await createNotification({
            userId: booking.photographerId,
            title: "客户取消了预约",
            message: `客户${client?.name || ''}取消了预约。预约时间: ${booking.date} ${booking.startTime}。`,
            type: "booking"
          });
        }
      } catch (notificationError) {
        console.error("发送通知失败:", notificationError);
        // 即使通知发送失败，预约更新成功也继续返回成功
      }
    }
    
    return NextResponse.json({
      message: "预约更新成功",
      booking: updatedBooking
    });
  } catch (error) {
    console.error(`Error updating booking ${params.id}:`, error);
    return NextResponse.json(
      { error: "更新预约失败" },
      { status: 500 }
    );
  }
}

// 删除预约
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前预约
    const booking = await getBookingById(bookingId);
    
    if (!booking) {
      return NextResponse.json(
        { error: "预约不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：只有管理员和客户（如果预约状态是pending）可以删除预约
    if (
      session.user.role !== "admin" && 
      !(session.user.id === booking.clientId && booking.status === "pending")
    ) {
      return NextResponse.json(
        { error: "没有权限删除此预约" },
        { status: 403 }
      );
    }
    
    // 删除预约
    const deleted = await deleteBooking(bookingId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "删除预约失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "预约删除成功"
    });
  } catch (error) {
    console.error(`Error deleting booking ${params.id}:`, error);
    return NextResponse.json(
      { error: "删除预约失败" },
      { status: 500 }
    );
  }
} 