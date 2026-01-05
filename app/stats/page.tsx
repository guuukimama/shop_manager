"use client";
import { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function StatsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("売上データの取得に失敗しました:", error);
    } else {
      setSales(data || []);
    }
    setLoading(false);
  }

  // 今日の統計
  const todayStats = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const todaySales = sales.filter(
      (s) => new Date(s.created_at).toLocaleDateString() === today
    );
    const revenue = todaySales.reduce((sum, s) => sum + s.total, 0);
    const count = todaySales.length;
    const average = count > 0 ? Math.floor(revenue / count) : 0;
    return { revenue, count, average };
  }, [sales]);

  // 【重要】時間帯別データ
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}時`,
      count: 0,
    }));
    sales.forEach((sale) => {
      const hour = new Date(sale.created_at).getHours();
      hours[hour].count += 1;
    });
    return hours;
  }, [sales]);

  // 30日間の推移データ
  const chartData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toLocaleDateString();
    });
    return last30Days.map((dateStr) => {
      const dayTotal = sales
        .filter((s) => new Date(s.created_at).toLocaleDateString() === dateStr)
        .reduce((sum, s) => sum + s.total, 0);
      const label = dateStr.split("/").slice(1, 3).join("/");
      return { name: label, total: dayTotal };
    });
  }, [sales]);

  const monthlyStats = useMemo(() => {
    const months: { [key: string]: number } = {};
    sales.forEach((s) => {
      const month = new Date(s.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      });
      months[month] = (months[month] || 0) + s.total;
    });
    return Object.entries(months);
  }, [sales]);

  const toggleDetail = (id: string) => setOpenId(openId === id ? null : id);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center text-zinc-500">
        データを読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-white pb-20">
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">売上ダッシュボード</h1>
            <p className="text-zinc-500 text-sm">クラウド同期済み</p>
          </div>
          <button
            onClick={fetchSales}
            className="text-xs bg-zinc-200 dark:bg-zinc-800 px-4 py-2 rounded-full font-bold hover:bg-zinc-300 transition-colors"
          >
            データを更新
          </button>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Revenue Today
            </p>
            <p className="text-4xl font-black text-blue-600 mt-2">
              ¥{todayStats.revenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Customers
            </p>
            <p className="text-4xl font-black text-emerald-500 mt-2">
              {todayStats.count} <span className="text-lg">人</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              Average spend
            </p>
            <p className="text-4xl font-black text-purple-500 mt-2">
              ¥{todayStats.average.toLocaleString()}
            </p>
          </div>
        </div>

        {/* グラフエリア */}
        <div className="flex flex-col gap-8 mb-10">
          {/* 売上推移グラフ */}
          <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              売上推移 (直近30日間)
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 時間帯別来店数グラフ（ここを復活させました！） */}
          <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              時間帯別・来店数
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f0fdf4" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* 月別合計 & 取引履歴 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">月別合計</h2>
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              {monthlyStats.length > 0 ? (
                monthlyStats.map(([month, total]) => (
                  <div
                    key={month}
                    className="p-5 border-b last:border-0 flex justify-between items-center dark:border-zinc-800"
                  >
                    <span className="font-bold text-zinc-500">{month}</span>
                    <span className="font-black text-blue-600 text-lg">
                      ¥{total.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-10 text-center text-zinc-400">データなし</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">
              最近の取引履歴 (Supabase)
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {sales.length === 0 ? (
                <p className="p-10 text-center text-zinc-400">
                  取引データがありません
                </p>
              ) : (
                sales.slice(0, 10).map((sale) => (
                  <div
                    key={sale.id}
                    className="border-b dark:border-zinc-800 last:border-0"
                  >
                    <button
                      onClick={() => toggleDetail(sale.id)}
                      className="w-full p-5 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="text-left">
                        <p className="font-bold text-sm">
                          {new Date(sale.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {sale.type} / {sale.items?.length || 0}点
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-lg">
                          ¥{sale.total.toLocaleString()}
                        </p>
                        <span
                          className={`text-zinc-400 transition-transform ${
                            openId === sale.id ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    </button>
                    {openId === sale.id && (
                      <div className="px-6 pb-6 pt-2 bg-zinc-50/50 dark:bg-zinc-800/30">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700 shadow-inner">
                          {sale.items?.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm py-2 border-b last:border-0 border-zinc-100 dark:border-zinc-800"
                            >
                              <span className="text-zinc-700 dark:text-zinc-300">
                                {item.name}
                              </span>
                              <span className="font-bold">
                                ¥{item.price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
