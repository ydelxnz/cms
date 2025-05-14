import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    const albumId = params.id;
    if (!albumId) {
      return NextResponse.json(
        { error: "相册ID不能为空" },
        { status: 400 }
      );
    }
    
    // 获取预约信息（作为相册）
    const booking = await db.getBookingById(albumId);
    if (!booking) {
      return NextResponse.json(
        { error: "未找到相册信息" },
        { status: 404 }
      );
    }
    
    // 权限检查
    const isAuthorized = 
      session.user.role === "admin" || 
      (session.user.role === "photographer" && booking.photographerId === session.user.id) ||
      (session.user.role === "client" && booking.clientId === session.user.id);
      
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "无权访问此相册" },
        { status: 403 }
      );
    }
    
    // 获取所有照片
    const allPhotos = await db.getPhotos();
    
    // 筛选属于该预约/相册的照片
    const albumPhotos = allPhotos.filter(
      photo => photo.clientId === booking.clientId && 
              photo.uploadedBy === booking.photographerId
    );
    
    // 构建相册信息
    const album = {
      id: booking.id,
      name: `${booking.type} - ${new Date(booking.date).toLocaleDateString()}`,
      photographerId: booking.photographerId,
      clientId: booking.clientId,
      clientName: "客户姓名", // 实际应用中应该查询客户信息
      type: booking.type,
      date: booking.date,
      coverPhotoUrl: albumPhotos.length > 0 ? albumPhotos[0].thumbnailPath : null,
      photoCount: albumPhotos.length,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
    
    return NextResponse.json(album);
  } catch (error) {
    console.error("Error fetching album:", error);
    return NextResponse.json(
      { error: "获取相册信息失败" },
      { status: 500 }
    );
  }
}

// 更新相册信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "photographer") {
      return NextResponse.json(
        { error: "只有摄影师可以更新相册" },
        { status: 403 }
      );
    }
    
    const albumId = params.id;
    if (!albumId) {
      return NextResponse.json(
        { error: "相册ID不能为空" },
        { status: 400 }
      );
    }
    
    // 获取预约信息（作为相册）
    const booking = await db.getBookingById(albumId);
    if (!booking) {
      return NextResponse.json(
        { error: "未找到相册信息" },
        { status: 404 }
      );
    }
    
    // 权限检查 - 只能更新自己的相册
    if (booking.photographerId !== session.user.id) {
      return NextResponse.json(
        { error: "无权更新此相册" },
        { status: 403 }
      );
    }
    
    // 获取更新数据
    const body = await request.json();
    const { name, type, date } = body;
    
    // 在真实应用中，这里会更新数据库中的相册信息
    // 现在我们直接返回更新后的相册信息
    
    // 获取所有照片
    const allPhotos = await db.getPhotos();
    
    // 筛选属于该预约/相册的照片
    const albumPhotos = allPhotos.filter(
      photo => photo.clientId === booking.clientId && 
              photo.uploadedBy === booking.photographerId
    );
    
    // 构建相册信息
    const updatedAlbum = {
      id: booking.id,
      name: name || `${booking.type} - ${new Date(booking.date).toLocaleDateString()}`,
      photographerId: booking.photographerId,
      clientId: booking.clientId,
      clientName: "客户姓名", // 实际应用中应该查询客户信息
      type: type || booking.type,
      date: date || booking.date,
      coverPhotoUrl: albumPhotos.length > 0 ? albumPhotos[0].thumbnailPath : null,
      photoCount: albumPhotos.length,
      createdAt: booking.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(updatedAlbum);
  } catch (error) {
    console.error("Error updating album:", error);
    return NextResponse.json(
      { error: "更新相册信息失败" },
      { status: 500 }
    );
  }
}

// 删除相册
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "photographer") {
      return NextResponse.json(
        { error: "只有摄影师可以删除相册" },
        { status: 403 }
      );
    }
    
    const albumId = params.id;
    if (!albumId) {
      return NextResponse.json(
        { error: "相册ID不能为空" },
        { status: 400 }
      );
    }
    
    // 获取预约信息（作为相册）
    const booking = await db.getBookingById(albumId);
    if (!booking) {
      return NextResponse.json(
        { error: "未找到相册信息" },
        { status: 404 }
      );
    }
    
    // 权限检查 - 只能删除自己的相册
    if (booking.photographerId !== session.user.id) {
      return NextResponse.json(
        { error: "无权删除此相册" },
        { status: 403 }
      );
    }
    
    // 在真实应用中，这里会删除相册及其照片
    // 现在我们只返回成功信息
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting album:", error);
    return NextResponse.json(
      { error: "删除相册失败" },
      { status: 500 }
    );
  }
} 