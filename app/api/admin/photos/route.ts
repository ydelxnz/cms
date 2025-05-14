import { NextRequest, NextResponse } from "next/server";
import { getPhotos, getUsers, getUserById, Photo } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 扩展Photo类型，添加status字段
interface PhotoWithStatus extends Photo {
  status: "pending" | "approved" | "archived";
  photographerName?: string;
  clientName?: string;
}

// 获取照片列表（仅管理员可用）
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
    const photographerId = searchParams.get("photographerId");
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const tags = searchParams.get("tags")?.split(",");
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    // 获取所有照片
    let photos = await getPhotos() as PhotoWithStatus[];
    
    // 应用过滤器
    if (photographerId) {
      photos = photos.filter(p => p.uploadedBy === photographerId);
    }
    
    if (clientId) {
      photos = photos.filter(p => p.clientId === clientId);
    }
    
    if (status) {
      photos = photos.filter(p => p.status === status);
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime();
      photos = photos.filter(p => new Date(p.createdAt).getTime() >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo).getTime();
      photos = photos.filter(p => new Date(p.createdAt).getTime() <= toDate);
    }
    
    if (tags && tags.length > 0) {
      photos = photos.filter(p => 
        tags.some(tag => p.tags.includes(tag))
      );
    }
    
    // 获取所有摄影师和客户的用户信息
    const users = await getUsers();
    const userMap = users.reduce((map, user) => {
      map[user.id] = user.name;
      return map;
    }, {} as Record<string, string>);
    
    // 为每个照片添加摄影师和客户名称
    const photosWithNames = photos.map(photo => {
      const photographerName = userMap[photo.uploadedBy] || "未知摄影师";
      const clientName = photo.clientId ? userMap[photo.clientId] || "未知客户" : null;
      
      return {
        ...photo,
        photographerName,
        clientName
      };
    });
    
    // 排序
    photosWithNames.sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a];
      const fieldB = b[sortField as keyof typeof b];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortOrder === "asc" 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      }
      
      // 默认按日期排序
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    
    // 计算统计数据
    const stats = {
      total: photos.length,
      pending: photos.filter(p => p.status === "pending").length,
      approved: photos.filter(p => p.status === "approved").length,
      archived: photos.filter(p => p.status === "archived").length,
      photographers: new Set(photos.map(p => p.uploadedBy)).size,
      clients: new Set(photos.filter(p => p.clientId).map(p => p.clientId)).size,
    };
    
    return NextResponse.json({
      photos: photosWithNames,
      stats
    });
  } catch (error) {
    console.error("Error fetching admin photos:", error);
    return NextResponse.json(
      { error: "获取照片数据失败" },
      { status: 500 }
    );
  }
} 