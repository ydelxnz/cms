import { NextRequest, NextResponse } from "next/server";
import { getBookings, createBooking, getBookingsByClient, getBookingsByPhotographer, Booking } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取预约列表
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
    const photographerId = searchParams.get("photographerId");
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status") as "pending" | "confirmed" | "cancelled" | "completed" | null;
    
    let bookings: Booking[] = [];
    
    // 根据角色和查询参数获取预约
    if (session.user.role === "admin") {
      // 管理员可以查看所有预约，或根据参数过滤
      if (photographerId) {
        bookings = await getBookingsByPhotographer(photographerId);
      } else if (clientId) {
        bookings = await getBookingsByClient(clientId);
      } else {
        bookings = await getBookings();
      }
    } else if (session.user.role === "photographer") {
      // 摄影师只能查看与自己相关的预约
      bookings = await getBookingsByPhotographer(session.user.id);
    } else if (session.user.role === "client") {
      // 客户只能查看自己的预约
      bookings = await getBookingsByClient(session.user.id);
    }
    
    // 根据状态筛选
    if (bookings && status) {
      bookings = bookings.filter(booking => booking.status === status);
    }
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "获取预约数据失败" },
      { status: 500 }
    );
  }
}

// 创建新预约
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
    
    const body = await request.json();
    const { photographerId, date, startTime, endTime, type, location, notes } = body;
    
    // 验证必填字段
    if (!photographerId || !date || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 创建预约数据
    const bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt"> = {
      clientId: session.user.id,
      photographerId,
      date,
      startTime,
      endTime,
      type,
      location: location || "",
      status: "pending", // 初始状态为待确认
      notes: notes || "",
    };
    
    const newBooking = await createBooking(bookingData);
    
    return NextResponse.json({
      message: "预约创建成功",
      booking: newBooking
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "创建预约失败" },
      { status: 500 }
    );
  }
} 