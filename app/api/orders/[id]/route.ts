import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder, deleteOrder } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取订单详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    const order = await getOrderById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：只有管理员和订单的客户可以查看订单详情
    if (session.user.role !== "admin" && order.clientId !== session.user.id) {
      return NextResponse.json(
        { error: "没有权限查看此订单" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error);
    return NextResponse.json(
      { error: "获取订单数据失败" },
      { status: 500 }
    );
  }
}

// 更新订单状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await request.json();
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前订单
    const order = await getOrderById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限
    const isAdmin = session.user.role === "admin";
    const isClient = session.user.id === order.clientId;
    
    // 根据请求和角色决定可以更新的内容
    const { status, paymentStatus, shippingAddress, ...otherUpdates } = body;
    let updateData: any = {};
    
    // 管理员可以更新所有字段
    if (isAdmin) {
      updateData = body;
    }
    // 客户只能更新某些状态（如取消订单）和收货地址
    else if (isClient) {
      // 只允许客户取消未处理的订单
      if (status === "cancelled" && order.status === "pending") {
        updateData.status = status;
      }
      
      // 允许客户更新收货地址（如果订单未发货）
      if (shippingAddress && order.status !== "shipped" && order.status !== "completed") {
        updateData.shippingAddress = shippingAddress;
      }
    }
    // 其他人无权更新
    else {
      return NextResponse.json(
        { error: "没有权限更新此订单" },
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
    
    // 更新订单
    const updatedOrder = await updateOrder(orderId, updateData);
    
    if (!updatedOrder) {
      return NextResponse.json(
        { error: "更新订单失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "订单更新成功",
      order: updatedOrder
    });
  } catch (error) {
    console.error(`Error updating order ${params.id}:`, error);
    return NextResponse.json(
      { error: "更新订单失败" },
      { status: 500 }
    );
  }
}

// 删除订单
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前订单
    const order = await getOrderById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: "订单不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：只有管理员可以删除订单，或者客户可以删除未处理的订单
    if (
      session.user.role !== "admin" && 
      !(session.user.id === order.clientId && order.status === "pending")
    ) {
      return NextResponse.json(
        { error: "没有权限删除此订单" },
        { status: 403 }
      );
    }
    
    // 删除订单
    const deleted = await deleteOrder(orderId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "删除订单失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "订单删除成功"
    });
  } catch (error) {
    console.error(`Error deleting order ${params.id}:`, error);
    return NextResponse.json(
      { error: "删除订单失败" },
      { status: 500 }
    );
  }
} 