import { NextRequest, NextResponse } from "next/server";
import { getReviewById, updateReview, deleteReview } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取评价详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    const review = await getReviewById(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { error: "评价不存在" },
        { status: 404 }
      );
    }
    
    // 所有用户都可以查看评价详情
    return NextResponse.json(review);
  } catch (error) {
    console.error(`Error fetching review ${params.id}:`, error);
    return NextResponse.json(
      { error: "获取评价数据失败" },
      { status: 500 }
    );
  }
}

// 更新评价
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const body = await request.json();
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前评价
    const review = await getReviewById(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { error: "评价不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限
    const isAdmin = session.user.role === "admin";
    const isReviewer = session.user.id === review.clientId;
    
    // 只有管理员或评价的作者可以更新评价
    if (!isAdmin && !isReviewer) {
      return NextResponse.json(
        { error: "没有权限更新此评价" },
        { status: 403 }
      );
    }
    
    // 提取并验证更新内容
    const { rating, comment } = body;
    let updateData: any = {};
    
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: "评分必须在1到5之间" },
          { status: 400 }
        );
      }
      updateData.rating = rating;
    }
    
    if (comment !== undefined) {
      if (!comment.trim()) {
        return NextResponse.json(
          { error: "评价内容不能为空" },
          { status: 400 }
        );
      }
      updateData.comment = comment;
    }
    
    // 如果没有可更新的内容
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "没有提供有效的更新内容" },
        { status: 400 }
      );
    }
    
    // 更新评价
    const updatedReview = await updateReview(reviewId, updateData);
    
    if (!updatedReview) {
      return NextResponse.json(
        { error: "更新评价失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "评价更新成功",
      review: updatedReview
    });
  } catch (error) {
    console.error(`Error updating review ${params.id}:`, error);
    return NextResponse.json(
      { error: "更新评价失败" },
      { status: 500 }
    );
  }
}

// 删除评价
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 获取当前评价
    const review = await getReviewById(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { error: "评价不存在" },
        { status: 404 }
      );
    }
    
    // 检查权限：只有管理员或评价的作者可以删除评价
    if (session.user.role !== "admin" && session.user.id !== review.clientId) {
      return NextResponse.json(
        { error: "没有权限删除此评价" },
        { status: 403 }
      );
    }
    
    // 删除评价
    const deleted = await deleteReview(reviewId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "删除评价失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "评价删除成功"
    });
  } catch (error) {
    console.error(`Error deleting review ${params.id}:`, error);
    return NextResponse.json(
      { error: "删除评价失败" },
      { status: 500 }
    );
  }
} 