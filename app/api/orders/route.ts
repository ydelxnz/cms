import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder, getOrdersByClient, Order } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取订单列表
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    
    let orders: Order[] = [];
    
    // 根据角色和查询参数获取订单
    if (session.user.role === "admin") {
      // 管理员可以查看所有订单，或根据参数过滤
      if (clientId) {
        orders = await getOrdersByClient(clientId);
      } else {
        orders = await getOrders();
      }
    } else if (session.user.role === "client") {
      // 客户只能查看自己的订单
      orders = await getOrdersByClient(session.user.id);
    }
    
    // 根据状态筛选
    if (orders && status) {
      orders = orders.filter(order => order.status === status);
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "获取订单数据失败" },
      { status: 500 }
    );
  }
}

// 创建新订单
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 只有客户可以创建订单（或管理员代表客户创建）
    if (session.user.role !== "client" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "没有权限创建订单" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { bookingId, items, totalAmount, shippingAddress } = body;
    
    // 验证必填字段
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "订单必须包含至少一个商品" },
        { status: 400 }
      );
    }
    
    // 验证每个商品都有必要的字段
    for (const item of items) {
      if (!item.type || !item.quantity || item.quantity <= 0 || !item.unitPrice || item.unitPrice <= 0) {
        return NextResponse.json(
          { error: "商品信息不完整" },
          { status: 400 }
        );
      }
    }
    
    // 如果管理员创建订单，必须指定客户ID
    let clientId = session.user.id;
    if (session.user.role === "admin") {
      if (!body.clientId) {
        return NextResponse.json(
          { error: "管理员创建订单时必须指定客户ID" },
          { status: 400 }
        );
      }
      clientId = body.clientId;
    }
    
    // 创建订单数据
    const orderData: Omit<Order, "id" | "createdAt" | "updatedAt"> = {
      clientId,
      bookingId: bookingId || undefined,
      items,
      totalAmount: totalAmount || items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      status: "pending",
      paymentStatus: "unpaid",
      shippingAddress: shippingAddress || "",
    };
    
    const newOrder = await createOrder(orderData);
    
    return NextResponse.json({
      message: "订单创建成功",
      order: newOrder
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "创建订单失败" },
      { status: 500 }
    );
  }
} 