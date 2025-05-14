import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBooking } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 更新预约状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    console.log(`[API] 开始处理预约状态更新请求，预约ID: ${bookingId}`);
    
    // 解析请求体
    let requestBody;
    try {
      requestBody = await request.json();
      console.log(`[API] 请求数据:`, requestBody);
    } catch (jsonError) {
      console.error(`[API] 解析请求体失败:`, jsonError);
      return NextResponse.json(
        { error: "无效的请求数据格式" },
        { status: 400 }
      );
    }
    
    const { status, notes } = requestBody;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    console.log(`[API] 当前会话:`, session ? {
      id: session.user.id,
      role: session.user.role
    } : "无会话");
    
    if (!session) {
      console.log(`[API] 认证失败，用户未登录`);
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前预约
    let booking;
    try {
      booking = await getBookingById(bookingId);
      console.log(`[API] 获取到预约:`, booking ? {
        id: booking.id,
        status: booking.status
      } : "未找到预约");
    } catch (bookingError) {
      console.error(`[API] 获取预约失败:`, bookingError);
      return NextResponse.json(
        { error: "获取预约信息失败" },
        { status: 500 }
      );
    }
    
    if (!booking) {
      console.log(`[API] 预约ID ${bookingId} 不存在`);
      return NextResponse.json(
        { error: "预约不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限
    const isAdmin = session.user.role === "admin";
    const isPhotographer = session.user.id === booking.photographerId;
    const isClient = session.user.id === booking.clientId;
    console.log(`[API] 权限检查: 管理员=${isAdmin}, 摄影师=${isPhotographer}, 客户=${isClient}`);
    
    // 如果没有相关权限
    if (!isAdmin && !isPhotographer && !isClient) {
      console.log(`[API] 用户 ${session.user.id} 没有权限更新预约 ${bookingId}`);
      return NextResponse.json(
        { error: "没有权限更新此预约状态" },
        { status: 403 }
      );
    }
    
    // 准备更新数据
    const updateData: any = {};
    
    // 处理状态更新（如果提供）
    if (status !== undefined && status !== booking.status) {
      console.log(`[API] 状态更新请求: ${booking.status} -> ${status}`);
      
      // 状态转换验证规则
      const validStatusTransitions: Record<string, string[]> = {
        pending: ["confirmed", "cancelled"],
        confirmed: ["completed", "cancelled"],
        completed: [],
        cancelled: ["pending"] // 只有管理员可以重新激活已取消的预约
      };
      
      // 验证状态转换是否有效
      const validNextStatuses = validStatusTransitions[booking.status] || [];
      if (!validNextStatuses.includes(status) && !isAdmin) {
        console.log(`[API] 无效的状态转换: ${booking.status} -> ${status}`);
        return NextResponse.json(
          { error: `不能将预约从 ${booking.status} 状态更改为 ${status}` },
          { status: 400 }
        );
      }
      
      // 基于角色的状态更新权限验证
      if (!isAdmin) {
        // 摄影师只能确认和完成预约
        if (isPhotographer && !["confirmed", "completed"].includes(status)) {
          console.log(`[API] 摄影师权限不足，无法设置状态为 ${status}`);
          return NextResponse.json(
            { error: "摄影师只能确认或完成预约" },
            { status: 403 }
          );
        }
        
        // 客户只能取消预约
        if (isClient && status !== "cancelled") {
          console.log(`[API] 客户权限不足，无法设置状态为 ${status}`);
          return NextResponse.json(
            { error: "客户只能取消预约" },
            { status: 403 }
          );
        }
      }
      
      updateData.status = status;
    }
    
    // 处理备注更新
    if (notes !== undefined) {
      console.log(`[API] 更新备注信息`);
      updateData.notes = notes;
    }
    
    // 如果没有可更新的内容
    if (Object.keys(updateData).length === 0) {
      console.log(`[API] 没有提供需要更新的内容`);
      return NextResponse.json(
        { error: "没有提供有效的更新内容" },
        { status: 400 }
      );
    }
    
    // 更新预约
    console.log(`[API] 开始更新预约，更新数据:`, updateData);
    let updatedBooking;
    try {
      updatedBooking = await updateBooking(bookingId, updateData);
      console.log(`[API] 预约更新成功`);
    } catch (updateError) {
      console.error(`[API] 更新预约失败:`, updateError);
      return NextResponse.json(
        { error: "更新预约数据失败，请稍后再试" },
        { status: 500 }
      );
    }
    
    if (!updatedBooking) {
      console.log(`[API] 更新函数未返回更新后的预约数据`);
      return NextResponse.json(
        { error: "更新预约状态失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "预约状态更新成功",
      booking: updatedBooking
    });
  } catch (error) {
    console.error(`[API] 处理预约状态更新时发生未预期错误:`, error);
    return NextResponse.json(
      { error: "更新预约状态失败，服务器内部错误" },
      { status: 500 }
    );
  }
} 