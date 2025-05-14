import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db, PhotoAlbum } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// 获取相册列表
export async function GET(request: NextRequest) {
  try {
    console.log('[API] 开始获取相册列表');
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[API] 获取相册列表失败: 认证失败');
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    console.log(`[API] 用户角色: ${session.user.role}, 用户ID: ${session.user.id}`);
    
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const photographerId = searchParams.get("photographerId");
    const clientId = searchParams.get("clientId");
    
    let albums: PhotoAlbum[] = [];
    
    // 根据用户角色和查询参数获取相册
    if (session.user.role === "photographer") {
      // 摄影师只能看到自己的相册
      albums = await db.getPhotoAlbumsByPhotographer(session.user.id);
      console.log(`[API] 获取摄影师相册, ID: ${session.user.id}, 相册数量: ${albums.length}`);
    } else if (session.user.role === "admin") {
      // 管理员可以查看所有相册，或按参数筛选
      if (photographerId) {
        albums = await db.getPhotoAlbumsByPhotographer(photographerId);
        console.log(`[API] 管理员获取指定摄影师相册, 摄影师ID: ${photographerId}, 相册数量: ${albums.length}`);
      } else {
        albums = await db.getPhotoAlbums();
        console.log(`[API] 管理员获取所有相册, 相册数量: ${albums.length}`);
      }
    }
    
    console.log(`[API] 返回相册数量: ${albums.length}`);
    return NextResponse.json(albums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json(
      { error: "获取相册数据失败" },
      { status: 500 }
    );
  }
}

// 创建新相册
export async function POST(request: NextRequest) {
  try {
    console.log('[API] 开始创建新相册');
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "photographer") {
      console.log('[API] 创建相册失败：权限不足，非摄影师用户');
      return NextResponse.json(
        { error: "只有摄影师可以创建相册" },
        { status: 403 }
      );
    }
    
    console.log('[API] 摄影师ID:', session.user.id);
    
    const body = await request.json();
    const { name, clientName, date, type } = body;
    
    // 验证必填字段
    if (!name || !date || !type) {
      console.log('[API] 创建相册失败：缺少必要字段');
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    console.log('[API] 相册信息:', { name, clientName, date, type });
    
    // 创建新相册
    try {
      const newAlbum = await db.createPhotoAlbum({
        name,
        photographerId: session.user.id,
        clientName: clientName || "未指定客户",
        type,
        date,
        coverPhotoUrl: null,
        photoCount: 0
      });
      
      console.log('[API] 成功创建相册:', newAlbum.id);
      return NextResponse.json(newAlbum, { status: 201 });
    } catch (saveError) {
      console.error('[API] 保存相册数据失败:', saveError);
      return NextResponse.json(
        { error: "保存相册数据失败" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating album:", error);
    return NextResponse.json(
      { error: "创建相册失败" },
      { status: 500 }
    );
  }
} 