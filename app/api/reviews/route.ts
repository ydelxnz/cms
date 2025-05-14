import { NextRequest, NextResponse } from "next/server";
import { getReviews, createReview, getReviewsByClient, getReviewsByPhotographer, Review } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取评价列表
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
    
    let reviews: Review[] = [];
    
    // 根据角色和查询参数获取评价
    if (session.user.role === "admin") {
      // 管理员可以查看所有评价，或根据参数过滤
      if (photographerId) {
        reviews = await getReviewsByPhotographer(photographerId);
      } else if (clientId) {
        reviews = await getReviewsByClient(clientId);
      } else {
        reviews = await getReviews();
      }
    } else if (session.user.role === "photographer") {
      // 摄影师只能查看与自己相关的评价
      reviews = await getReviewsByPhotographer(session.user.id);
    } else if (session.user.role === "client") {
      // 客户可以查看自己的评价或特定摄影师的评价
      if (photographerId) {
        // 客户可以查看特定摄影师的所有评价
        reviews = await getReviewsByPhotographer(photographerId);
      } else {
        // 默认查看客户自己的评价
        reviews = await getReviewsByClient(session.user.id);
      }
    }
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "获取评价数据失败" },
      { status: 500 }
    );
  }
}

// 创建新评价
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
    
    // 只有客户可以创建评价
    if (session.user.role !== "client") {
      return NextResponse.json(
        { error: "只有客户可以创建评价" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { photographerId, bookingId, rating, comment } = body;
    
    // 验证必填字段
    if (!photographerId || !rating || rating < 1 || rating > 5 || !comment) {
      return NextResponse.json(
        { error: "缺少必要字段或评分无效" },
        { status: 400 }
      );
    }
    
    // 创建评价数据
    const reviewData: Omit<Review, "id" | "createdAt" | "updatedAt"> = {
      clientId: session.user.id,
      photographerId,
      bookingId: bookingId || undefined,
      rating,
      comment,
    };
    
    const newReview = await createReview(reviewData);
    
    return NextResponse.json({
      message: "评价创建成功",
      review: newReview
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "创建评价失败" },
      { status: 500 }
    );
  }
} 