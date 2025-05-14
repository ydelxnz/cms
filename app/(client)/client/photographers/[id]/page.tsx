"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Star, Calendar, MapPin, Phone, Mail, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Photographer } from "@/lib/types";

// Mock data for demonstration
const mockPhotographers: Record<string, Photographer> = {
  "1": {
    id: "1",
    name: "张伟",
    phone: "13800138001",
    email: "zhang@example.com",
    role: "photographer",
    bio: "专注于婚纱摄影和艺术人像，有10年拍摄经验。擅长捕捉自然光线下的情感瞬间，为您创造独特而难忘的照片。",
    specialties: ["婚纱摄影", "艺术人像", "户外写真"],
    portfolio: [
      {
        id: "p1",
        photographerId: "1",
        title: "春日婚纱",
        description: "春天里的浪漫婚纱照",
        imageUrl: "/images/portfolio-1.jpg",
        category: "婚纱摄影",
        createdAt: "2024-03-15",
      },
      {
        id: "p2",
        photographerId: "1",
        title: "城市人像",
        description: "都市风格的艺术人像",
        imageUrl: "/images/portfolio-2.jpg",
        category: "艺术人像",
        createdAt: "2024-02-20",
      },
      {
        id: "p3",
        photographerId: "1",
        title: "夏日写真",
        description: "夏日户外自然写真",
        imageUrl: "/images/portfolio-3.jpg",
        category: "户外写真",
        createdAt: "2024-01-10",
      },
      {
        id: "p4",
        photographerId: "1",
        title: "情侣写真",
        description: "甜蜜情侣的日常记录",
        imageUrl: "/images/portfolio-4.jpg",
        category: "艺术人像",
        createdAt: "2023-12-05",
      },
    ],
    availability: [
      {
        id: "a1",
        photographerId: "1",
        date: "2025-05-01",
        startTime: "09:00",
        endTime: "12:00",
        isBooked: false,
      },
      {
        id: "a2",
        photographerId: "1",
        date: "2025-05-01",
        startTime: "14:00",
        endTime: "17:00",
        isBooked: false,
      },
      {
        id: "a3",
        photographerId: "1",
        date: "2025-05-02",
        startTime: "09:00",
        endTime: "12:00",
        isBooked: true,
      },
      {
        id: "a4",
        photographerId: "1",
        date: "2025-05-03",
        startTime: "14:00",
        endTime: "17:00",
        isBooked: false,
      },
    ],
    rating: 4.8,
    reviews: [
      {
        id: "r1",
        clientId: "c1",
        photographerId: "1",
        sessionId: "s1",
        rating: 5,
        comment: "张老师非常专业，拍摄过程轻松愉快，照片效果超出预期！",
        createdAt: "2024-04-10",
      },
      {
        id: "r2",
        clientId: "c2",
        photographerId: "1",
        sessionId: "s2",
        rating: 4,
        comment: "很有耐心，善于引导，拍出来的照片很自然。",
        createdAt: "2024-03-25",
      },
      {
        id: "r3",
        clientId: "c3",
        photographerId: "1",
        sessionId: "s3",
        rating: 5,
        comment: "非常满意，拍摄氛围很轻松，照片质量很高。",
        createdAt: "2024-02-15",
      },
    ],
    createdAt: "2023-01-15",
    updatedAt: "2024-04-15",
  },
};

export default function PhotographerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setPhotographer(mockPhotographers[id as string] || null);
      setIsLoading(false);
    }, 1000);

    // In a real app, you would fetch photographer data from your API
    // const fetchPhotographer = async () => {
    //   try {
    //     const response = await fetch(`/api/photographers/${id}`);
    //     const data = await response.json();
    //     setPhotographer(data);
    //   } catch (error) {
    //     console.error('Error fetching photographer:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    //
    // fetchPhotographer();

    return () => clearTimeout(timer);
  }, [id]);

  // Get all unique categories from portfolio
  const portfolioCategories = photographer
    ? Array.from(new Set(photographer.portfolio.map((item) => item.category)))
    : [];

  // Filter portfolio items by selected category
  const filteredPortfolio = photographer
    ? selectedCategory === "all"
      ? photographer.portfolio
      : photographer.portfolio.filter((item) => item.category === selectedCategory)
    : [];

  // Group availability by date
  const availabilityByDate = photographer
    ? photographer.availability.reduce<Record<string, typeof photographer.availability>>(
        (acc, slot) => {
          if (!acc[slot.date]) {
            acc[slot.date] = [];
          }
          acc[slot.date].push(slot);
          return acc;
        },
        {}
      )
    : {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/client/photographers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              <div className="h-40 w-full animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="h-60 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">未找到摄影师</h2>
        <p className="text-muted-foreground">该摄影师不存在或已被删除</p>
        <Button className="mt-4" asChild>
          <Link href="/client/photographers">返回摄影师列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/client/photographers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{photographer.name}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Photographer info */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{photographer.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{photographer.name}</h3>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{photographer.rating}</span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      ({photographer.reviews.length} 条评价)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">{photographer.bio}</p>
                <div className="flex flex-wrap gap-1">
                  {photographer.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{photographer.phone}</span>
                  </div>
                  {photographer.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{photographer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Button className="w-full" asChild>
                  <Link href={`/client/photographers/${photographer.id}/book`}>
                    立即预约
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">可预约时间</h3>
              </div>
              <div className="space-y-4">
                {Object.keys(availabilityByDate).length > 0 ? (
                  Object.entries(availabilityByDate).map(([date, slots]) => (
                    <div key={date} className="space-y-2">
                      <h4 className="font-medium">
                        {format(new Date(date), "yyyy年MM月dd日 EEEE", { locale: zhCN })}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {slots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-center rounded-md border p-2 text-sm ${
                              slot.isBooked
                                ? "border-gray-200 bg-gray-100 text-gray-400"
                                : "border-primary/50 bg-primary/5 text-primary"
                            }`}
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                            {slot.isBooked && (
                              <span className="ml-1 text-xs">(已预约)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-20 flex-col items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">暂无可预约时间</p>
                  </div>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/client/photographers/${photographer.id}/book`}>
                    查看更多可预约时间
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio and reviews */}
        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="portfolio">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="portfolio">作品集</TabsTrigger>
              <TabsTrigger value="reviews">客户评价</TabsTrigger>
            </TabsList>
            <TabsContent value="portfolio" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center space-x-2 overflow-x-auto pb-2">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                    >
                      全部
                    </Button>
                    {portfolioCategories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>

                  {filteredPortfolio.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {filteredPortfolio.map((item) => (
                        <div key={item.id} className="overflow-hidden rounded-lg border">
                          <div className="aspect-square bg-gray-100">
                            {/* In a real app, this would be an actual image */}
                            <div className="flex h-full w-full items-center justify-center bg-gray-200">
                              <span className="text-gray-400">{item.title}</span>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {item.category}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(item.createdAt), "yyyy-MM-dd")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">暂无作品</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">客户评价</h3>
                      <p className="text-sm text-muted-foreground">
                        {photographer.reviews.length} 条评价
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">{photographer.rating}</span>
                      <span className="text-sm text-muted-foreground">/5</span>
                    </div>
                  </div>

                  {photographer.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {photographer.reviews.map((review) => (
                        <div key={review.id} className="rounded-lg border p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>客户</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">客户</span>
                            </div>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {format(new Date(review.createdAt), "yyyy-MM-dd")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">暂无评价</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
