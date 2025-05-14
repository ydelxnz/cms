"use client";

import { useEffect, useState } from "react";
import { bookingService } from "@/lib/services";
import { Booking } from "@/lib/types";

export default function TestBookingAPI() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载所有预约
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await bookingService.getPhotographerBookings();
        setBookings(data);
        setError(null);
      } catch (err: any) {
        console.error("获取预约失败:", err);
        setError("获取预约列表失败: " + (err.message || String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // 获取单个预约详情
  const handleGetBooking = async (id: string) => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingById(id);
      setSelectedBooking(data);
      setError(null);
    } catch (err: any) {
      console.error("获取预约详情失败:", err);
      setError("获取预约详情失败: " + (err.message || String(err)));
      setSelectedBooking(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">预约 API 测试</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 预约列表 */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">预约列表</h2>
          {loading && <p>加载中...</p>}
          
          {bookings && bookings.length > 0 ? (
            <ul className="space-y-2">
              {bookings.map((booking) => (
                <li key={booking.id} className="border-b pb-2">
                  <p><span className="font-medium">预约ID:</span> {booking.id}</p>
                  <p><span className="font-medium">客户:</span> {booking.clientName || booking.clientId}</p>
                  <p><span className="font-medium">日期:</span> {booking.date}</p>
                  <p><span className="font-medium">时间:</span> {booking.startTime} - {booking.endTime}</p>
                  <p><span className="font-medium">状态:</span> {booking.status}</p>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2"
                    onClick={() => handleGetBooking(booking.id)}
                  >
                    查看详情
                  </button>
                </li>
              ))}
            </ul>
          ) : !loading ? (
            <p>暂无预约数据</p>
          ) : null}
        </div>
        
        {/* 预约详情 */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">预约详情</h2>
          
          {loading && <p>加载中...</p>}
          
          {selectedBooking ? (
            <div>
              <p><span className="font-medium">预约ID:</span> {selectedBooking.id}</p>
              <p><span className="font-medium">客户ID:</span> {selectedBooking.clientId}</p>
              <p><span className="font-medium">客户名称:</span> {selectedBooking.clientName || "无名称"}</p>
              <p><span className="font-medium">摄影师ID:</span> {selectedBooking.photographerId}</p>
              <p><span className="font-medium">日期:</span> {selectedBooking.date}</p>
              <p><span className="font-medium">时间:</span> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
              <p><span className="font-medium">地点:</span> {selectedBooking.location || "未指定"}</p>
              <p><span className="font-medium">类型:</span> {selectedBooking.type || "未指定"}</p>
              <p><span className="font-medium">状态:</span> {selectedBooking.status}</p>
              <p><span className="font-medium">备注:</span> {selectedBooking.notes || "无"}</p>
              <p><span className="font-medium">创建时间:</span> {selectedBooking.createdAt}</p>
              <p><span className="font-medium">更新时间:</span> {selectedBooking.updatedAt}</p>
              
              <pre className="bg-gray-100 p-4 mt-4 overflow-auto max-h-60 rounded">
                {JSON.stringify(selectedBooking, null, 2)}
              </pre>
            </div>
          ) : !loading ? (
            <p>请从左侧选择一个预约查看详情</p>
          ) : null}
        </div>
      </div>
    </div>
  );
} 