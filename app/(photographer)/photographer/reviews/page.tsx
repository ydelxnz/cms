"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  Search, 
  Star, 
  MessageSquare, 
  Calendar, 
  User, 
  ThumbsUp,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { reviewService } from "@/lib/services";
import { Review } from "@/lib/types";

// Filter options
const ratingOptions = [
  { value: "all", label: "全部评分" },
  { value: "5", label: "5星" },
  { value: "4", label: "4星" },
  { value: "3", label: "3星" },
  { value: "2", label: "2星" },
  { value: "1", label: "1星" },
];

const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "待回复" },
  { value: "responded", label: "已回复" },
];

const typeOptions = [
  { value: "all", label: "全部类型" },
  { value: "婚纱照", label: "婚纱照" },
  { value: "全家福", label: "全家福" },
  { value: "艺术人像", label: "艺术人像" },
  { value: "证件照", label: "证件照" },
  { value: "儿童摄影", label: "儿童摄影" },
  { value: "商业摄影", label: "商业摄影" },
  { value: "其他", label: "其他" },
];

// Sort options
const sortOptions = [
  { value: "date-desc", label: "最新评价" },
  { value: "date-asc", label: "最早评价" },
  { value: "rating-desc", label: "评分从高到低" },
  { value: "rating-asc", label: "评分从低到高" },
];

export default function PhotographerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("date-desc");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取评论数据
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 获取摄影师评论
      const data = await reviewService.getPhotographerReviews();
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      console.error('获取评论数据失败:', error);
      setError('获取评论数据失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort reviews when filter state changes
  useEffect(() => {
    let filtered = reviews;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.clientName?.toLowerCase().includes(query) ||
          review.comment?.toLowerCase().includes(query) ||
          review.photoSessionType?.toLowerCase().includes(query)
      );
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((review) => review.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.photoSessionType === typeFilter
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "rating-desc":
          return b.rating - a.rating;
        case "rating-asc":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [searchQuery, ratingFilter, statusFilter, typeFilter, sortOption, reviews]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), "yyyy年MM月dd日", { locale: zhCN });
    } catch (error) {
      return dateString;
    }
  };

  // Handle responding to a review
  const handleRespondToReview = (review: Review) => {
    setSelectedReview(review);
    setResponseText(review.photographerResponse || "");
    setIsResponseDialogOpen(true);
  };

  // Submit response
  const handleSubmitResponse = async () => {
    if (!selectedReview) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // 更新评论回复
      await reviewService.respondToReview(selectedReview.id, responseText);
      
      // 更新本地状态
      const updatedReviews = reviews.map((review) =>
        review.id === selectedReview.id
          ? {
              ...review,
              photographerResponse: responseText,
              responseDate: new Date().toISOString(),
              status: "responded" as const,
            }
          : review
      );
      
      setReviews(updatedReviews);
      setIsResponseDialogOpen(false);
      setSelectedReview(null);
      setResponseText("");
    } catch (error) {
      console.error('回复评论失败:', error);
      setError('回复评论失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle expanded review
  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">客户评价</h2>
        <div className="text-sm text-muted-foreground">
          {reviews.length > 0 && (
            <>
              总评分:{" "}
              <span className="font-medium">
                {(
                  reviews.reduce((sum, review) => sum + review.rating, 0) /
                  reviews.length
                ).toFixed(1)}
              </span>{" "}
              ({reviews.length} 条评价)
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>客户评价</CardTitle>
          <CardDescription>查看和回复客户对您服务的评价</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索评价..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="评分筛选" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reviews list */}
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
              </div>
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const isExpanded = expandedReviews.includes(review.id);
                return (
                  <div
                    key={review.id}
                    className="rounded-lg border p-4 transition-all"
                  >
                    <div className="flex flex-col space-y-2 md:flex-row md:items-start md:justify-between md:space-y-0">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <Badge
                            variant={
                              review.status === "pending"
                                ? "outline"
                                : "secondary"
                            }
                          >
                            {review.status === "pending" ? "待回复" : "已回复"}
                          </Badge>
                          <Badge variant="outline">
                            {review.photoSessionType || "未知类型"}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="mr-1 h-3 w-3" />
                          <span>{review.clientName}</span>
                          <span className="mx-1">·</span>
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>{formatDate(review.date)}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {review.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleRespondToReview(review)}
                          >
                            回复
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpandReview(review.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div
                      className={`mt-2 overflow-hidden transition-all ${
                        isExpanded ? "max-h-[1000px]" : "max-h-16"
                      }`}
                    >
                      <p className="text-sm">{review.comment}</p>
                      {review.photographerResponse && (
                        <div className="mt-4 rounded-md bg-muted p-3">
                          <p className="mb-1 text-xs font-medium">您的回复:</p>
                          <p className="text-sm">{review.photographerResponse}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {review.responseDate
                              ? formatDate(review.responseDate)
                              : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed">
              <MessageSquare className="mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">暂无评价</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>回复客户评价</DialogTitle>
            <DialogDescription>
              感谢客户的反馈并提供专业的回复
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex">{renderStars(selectedReview.rating)}</div>
                  <Badge variant="outline">
                    {selectedReview.photoSessionType || "未知类型"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span>{selectedReview.clientName}</span>
                  <span className="mx-1">·</span>
                  <span>{formatDate(selectedReview.date)}</span>
                </div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="response">您的回复</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="输入您对客户评价的回复..."
                  rows={5}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResponseDialogOpen(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmitResponse} disabled={!responseText.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : "提交回复"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
