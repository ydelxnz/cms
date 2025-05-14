"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Photographer } from "@/lib/types";
import { userService } from "@/lib/services";

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [filteredPhotographers, setFilteredPhotographers] = useState<Photographer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const fetchPhotographers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 获取所有摄影师
      const data = await userService.getPhotographers();
      setPhotographers(data);
      setFilteredPhotographers(data);
      
      // 提取所有唯一的专业领域
      const specialties = Array.from(
        new Set(data.flatMap((p) => p.specialties || []))
      ).filter(Boolean) as string[];
      
      setAllSpecialties(specialties);
    } catch (error) {
      console.error('获取摄影师数据失败:', error);
      setError('获取摄影师数据失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter photographers based on search term and specialty
    let filtered = photographers;

    if (searchTerm) {
      filtered = filtered.filter(
        (photographer) =>
          photographer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photographer.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specialty && specialty !== "all") {
      filtered = filtered.filter((photographer) =>
        photographer.specialties?.includes(specialty)
      );
    }

    setFilteredPhotographers(filtered);
  }, [searchTerm, specialty, photographers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">摄影师</h2>
        <p className="text-muted-foreground">
          浏览我们的专业摄影师，查看他们的作品并预约拍摄
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索摄影师姓名或简介..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={specialty}
            onValueChange={setSpecialty}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="专业领域" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部领域</SelectItem>
              {allSpecialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex h-[300px] items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredPhotographers.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPhotographers.map((photographer) => (
            <Card key={photographer.id} className="overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                {photographer.portfolio && photographer.portfolio.length > 0 ? (
                  <img
                    src={photographer.portfolio[0].imageUrl}
                    alt={`${photographer.name}的作品`}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <p className="text-muted-foreground">暂无作品展示</p>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarFallback>{photographer.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{photographer.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="mr-1 h-3 w-3 fill-primary text-primary" />
                        <span>{photographer.rating?.toFixed(1) || "暂无评分"}</span>
                        <span className="mx-1">·</span>
                        <span>{photographer.reviews?.length || 0} 条评价</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                  {photographer.bio}
                </p>
                <div className="mb-4 flex flex-wrap gap-1">
                  {photographer.specialties?.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-4">
                <div className="flex w-full items-center justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/client/photographers/${photographer.id}`}>查看详情</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/client/bookings/new?photographerId=${photographer.id}`}>
                      预约
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">没有找到符合条件的摄影师</p>
          {(searchTerm || specialty !== "all") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setSpecialty("all");
              }}
            >
              清除筛选条件
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
