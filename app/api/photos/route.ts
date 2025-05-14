import { NextRequest, NextResponse } from "next/server";
import { getPhotos, createPhoto, getPhotosByPhotographer, getPhotosByClient, Photo } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

// 获取照片列表
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
    const tags = searchParams.get("tags")?.split(",");
    
    let photos: Photo[] = [];
    
    // 根据角色和查询参数获取照片
    if (session.user.role === "admin") {
      // 管理员可以查看所有照片，或根据参数过滤
      if (photographerId) {
        photos = await getPhotosByPhotographer(photographerId);
      } else if (clientId) {
        photos = await getPhotosByClient(clientId);
      } else {
        photos = await getPhotos();
      }
    } else if (session.user.role === "photographer") {
      // 摄影师只能查看自己上传的照片或关联的客户照片
      if (clientId) {
        // 获取该客户的照片，但需要验证是否是该摄影师的客户
        photos = await getPhotosByClient(clientId);
        photos = photos.filter(photo => photo.uploadedBy === session.user.id);
      } else {
        // 默认获取摄影师自己上传的所有照片
        photos = await getPhotosByPhotographer(session.user.id);
      }
    } else if (session.user.role === "client") {
      // 客户只能查看与自己关联的照片
      photos = await getPhotosByClient(session.user.id);
    }
    
    // 根据标签筛选
    if (photos && tags && tags.length > 0) {
      photos = photos.filter(photo => {
        return tags.some(tag => photo.tags.includes(tag));
      });
    }
    
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "获取照片数据失败" },
      { status: 500 }
    );
  }
}

// 上传新照片
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
    
    // 只有摄影师和管理员可以上传照片
    if (session.user.role !== "photographer" && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "没有权限上传照片" },
        { status: 403 }
      );
    }
    
    // 处理表单数据
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const clientId = formData.get("clientId") as string;
    const tags = (formData.get("tags") as string || "").split(",").filter(Boolean);
    
    if (!file || !title) {
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 验证文件类型
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型，请上传 JPEG, PNG 或 WebP 格式的图片" },
        { status: 400 }
      );
    }
    
    // 生成随机文件名
    const fileId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${fileId}.${fileExtension}`;
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), "public", "uploads", "photos");
    const thumbnailDir = path.join(process.cwd(), "public", "uploads", "thumbnails");
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    if (!existsSync(thumbnailDir)) {
      await mkdir(thumbnailDir, { recursive: true });
    }
    
    // 保存原始文件路径
    const filePath = path.join(uploadDir, fileName);
    const fileBytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(fileBytes));
    
    // 生成缩略图
    const thumbnailName = `thumb_${fileId}.webp`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailName);
    
    await sharp(Buffer.from(fileBytes))
      .resize(300, 300, { fit: "inside" })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
    
    // 保存照片数据到数据库
    const photoData = {
      title,
      description: description || "",
      fileName,
      filePath: `/uploads/photos/${fileName}`,
      thumbnailPath: `/uploads/thumbnails/${thumbnailName}`,
      uploadedBy: session.user.id,
      clientId: clientId || undefined,
      tags: tags || [],
    };
    
    const newPhoto = await createPhoto(photoData);
    
    return NextResponse.json({
      message: "照片上传成功",
      photo: newPhoto
    }, { status: 201 });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "上传照片失败" },
      { status: 500 }
    );
  }
} 