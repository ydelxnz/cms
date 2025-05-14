import { NextRequest, NextResponse } from "next/server";
import { getPhotoById, updatePhoto, deletePhoto } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from 'fs';
import path from 'path';

// 获取照片详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return NextResponse.json(
        { error: "照片不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：管理员可以查看所有照片，摄影师可以查看自己的照片，客户可以查看与自己关联的照片
    if (
      session.user.role !== "admin" && 
      photo.uploadedBy !== session.user.id && 
      photo.clientId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "没有权限查看此照片" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(photo);
  } catch (error) {
    console.error(`Error fetching photo ${params.id}:`, error);
    return NextResponse.json(
      { error: "获取照片数据失败" },
      { status: 500 }
    );
  }
}

// 更新照片信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
    const body = await request.json();
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前照片
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return NextResponse.json(
        { error: "照片不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：只有管理员和照片上传者（摄影师）可以更新照片信息
    if (session.user.role !== "admin" && photo.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: "没有权限更新此照片" },
        { status: 403 }
      );
    }
    
    // 需要更新的字段（不允许更新文件路径相关字段）
    const { title, description, clientId, tags, metadata } = body;
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (clientId !== undefined) updateData.clientId = clientId || undefined;
    if (tags !== undefined) updateData.tags = tags;
    if (metadata !== undefined) updateData.metadata = metadata;
    
    // 如果没有可更新的内容
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "没有提供有效的更新内容" },
        { status: 400 }
      );
    }
    
    // 更新照片
    const updatedPhoto = await updatePhoto(photoId, updateData);
    
    if (!updatedPhoto) {
      return NextResponse.json(
        { error: "更新照片失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "照片更新成功",
      photo: updatedPhoto
    });
  } catch (error) {
    console.error(`Error updating photo ${params.id}:`, error);
    return NextResponse.json(
      { error: "更新照片失败" },
      { status: 500 }
    );
  }
}

// 删除照片
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const photoId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前照片
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return NextResponse.json(
        { error: "照片不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：只有管理员和照片上传者（摄影师）可以删除照片
    if (session.user.role !== "admin" && photo.uploadedBy !== session.user.id) {
      return NextResponse.json(
        { error: "没有权限删除此照片" },
        { status: 403 }
      );
    }
    
    // 删除数据库中的记录
    const deleted = await deletePhoto(photoId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "删除照片失败" },
        { status: 500 }
      );
    }
    
    // 尝试删除物理文件
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
    } catch (fileError) {
      console.error(`Error deleting photo files for ${photoId}:`, fileError);
      // 即使文件删除失败，仍然返回成功，因为数据库记录已删除
    }
    
    return NextResponse.json({
      message: "照片删除成功"
    });
  } catch (error) {
    console.error(`Error deleting photo ${params.id}:`, error);
    return NextResponse.json(
      { error: "删除照片失败" },
      { status: 500 }
    );
  }
} 