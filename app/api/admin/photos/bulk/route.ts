import { NextRequest, NextResponse } from "next/server";
import { getPhotos, writeData, Photo } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import path from "path";
import fs from "fs";

// 照片数据文件路径
const PHOTOS_FILE = path.join(process.cwd(), "data", "photos.json");

// 扩展Photo类型，添加status字段
interface PhotoWithStatus extends Photo {
  status: "pending" | "approved" | "archived";
}

// 管理员批量照片操作
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
    const { action, photoIds, status, filters } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: "缺少必要参数: action" },
        { status: 400 }
      );
    }
    
    // 获取所有照片
    let photos = await getPhotos() as PhotoWithStatus[];
    let targetPhotos: PhotoWithStatus[] = [];
    
    // 确定目标照片
    if (photoIds && Array.isArray(photoIds) && photoIds.length > 0) {
      // 通过ID列表指定照片
      const idsSet = new Set(photoIds);
      targetPhotos = photos.filter(p => idsSet.has(p.id));
    } else if (filters) {
      // 通过过滤条件批量选择照片
      let filtered = [...photos];
      
      const { photographerId, clientId, status: filterStatus, dateFrom, dateTo, tags } = filters;
      
      if (photographerId) {
        filtered = filtered.filter(p => p.uploadedBy === photographerId);
      }
      
      if (clientId) {
        filtered = filtered.filter(p => p.clientId === clientId);
      }
      
      if (filterStatus) {
        filtered = filtered.filter(p => p.status === filterStatus);
      }
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom).getTime();
        filtered = filtered.filter(p => new Date(p.createdAt).getTime() >= fromDate);
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo).getTime();
        filtered = filtered.filter(p => new Date(p.createdAt).getTime() <= toDate);
      }
      
      if (tags && Array.isArray(tags) && tags.length > 0) {
        filtered = filtered.filter(p => 
          tags.some(tag => p.tags.includes(tag))
        );
      }
      
      targetPhotos = filtered;
    } else {
      return NextResponse.json(
        { error: "未指定目标照片，请提供photoIds或filters" },
        { status: 400 }
      );
    }
    
    if (targetPhotos.length === 0) {
      return NextResponse.json(
        { message: "未找到匹配的照片" },
        { status: 200 }
      );
    }
    
    let updatedCount = 0;
    let deletedCount = 0;
    
    // 执行批量操作
    if (action === "updateStatus" && status) {
      // 批量更新状态
      if (!["pending", "approved", "archived"].includes(status)) {
        return NextResponse.json(
          { error: "无效的状态值" },
          { status: 400 }
        );
      }
      
      const targetIds = new Set(targetPhotos.map(p => p.id));
      photos = photos.map(photo => {
        if (targetIds.has(photo.id)) {
          updatedCount++;
          return { ...photo, status, updatedAt: new Date().toISOString() };
        }
        return photo;
      }) as PhotoWithStatus[];
      
      // 保存更新后的数据
      await writeData(PHOTOS_FILE, photos);
      
      return NextResponse.json({
        message: `已成功更新${updatedCount}张照片的状态`,
        updatedCount
      });
    } 
    else if (action === "delete") {
      // 批量删除照片
      const targetIds = new Set(targetPhotos.map(p => p.id));
      
      // 保存原始照片路径用于删除文件
      const photosToDelete = photos.filter(p => targetIds.has(p.id));
      
      // 从数据库中移除照片
      photos = photos.filter(p => !targetIds.has(p.id));
      await writeData(PHOTOS_FILE, photos);
      
      // 尝试删除物理文件
      photosToDelete.forEach(photo => {
        try {
          // 删除原始文件
          const originalFilePath = path.join(process.cwd(), 'public', photo.filePath);
          if (fs.existsSync(originalFilePath)) {
            fs.unlinkSync(originalFilePath);
          }
          
          // 删除缩略图
          const thumbnailFilePath = path.join(process.cwd(), 'public', photo.thumbnailPath);
          if (fs.existsSync(thumbnailFilePath)) {
            fs.unlinkSync(thumbnailFilePath);
          }
          
          deletedCount++;
        } catch (fileError) {
          console.error(`Error deleting photo files for ${photo.id}:`, fileError);
        }
      });
      
      return NextResponse.json({
        message: `已成功删除${deletedCount}张照片`,
        deletedCount
      });
    }
    else {
      return NextResponse.json(
        { error: `不支持的操作: ${action}` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error performing bulk photo operation:", error);
    return NextResponse.json(
      { error: "批量操作照片失败" },
      { status: 500 }
    );
  }
} 