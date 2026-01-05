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
  Cell,
} from "recharts";

export default function StatsPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("ja-JP")
  );
  const [selectedHourDetail, setSelectedHourDetail] = useState<{
    hour: string;
    sales: any[];
  } | null>(null);

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setSales(data || []);
    setLoading(false);
  }

  const todayStr = new Date().toLocaleDateString("ja-JP");
  const daySales = useMemo(
    () =>
      sales.filter(
        (s) =>
          new Date(s.created_at).toLocaleDateString("ja-JP") === selectedDate
      ),
    [sales, selectedDate]
  );

  const selectedDayStats = useMemo(() => {
    const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
    const count = daySales.length;
    const itemAnalysis: { [key: string]: { count: number; emoji: string } } =
      {};
    daySales.forEach((sale) => {
      sale.items?.forEach((item: any) => {
        if (!itemAnalysis[item.name])
          itemAnalysis[item.name] = { count: 0, emoji: item.emoji || "🍴" };
        itemAnalysis[item.name].count += 1;
      });
    });
    return {
      revenue,
      count,
      average: count > 0 ? Math.floor(revenue / count) : 0,
      itemAnalysis: Object.entries(itemAnalysis),
    };
  }, [daySales]);

  const hourlyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const filtered = daySales.filter(
        (s) => new Date(s.created_at).getHours() === i
      );
      return { hour: `${i}`, count: filtered.length, rawHour: i };
    });
  }, [daySales]);

  const monthlyComparisonData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}`,
      今年: 0,
      去年: 0,
    }));
    sales.forEach((sale) => {
      const date = new Date(sale.created_at);
      const year = date.getFullYear();
      const m = date.getMonth();
      if (year === 2026) months[m].今年 += sale.total;
      if (year === 2025) months[m].去年 += sale.total;
    });
    return months;
  }, [sales]);

  const dailyData = useMemo(() => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toLocaleDateString("ja-JP");
    });
    return last30Days.map((dateStr) => {
      const total = sales
        .filter(
          (s) => new Date(s.created_at).toLocaleDateString("ja-JP") === dateStr
        )
        .reduce((sum, s) => sum + s.total, 0);
      return {
        name: dateStr.split("/").slice(1, 3).join("/"),
        total,
        fullDate: dateStr,
      };
    });
  }, [sales]);

  if (loading)
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center font-bold">
        読み込み中...
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-white pb-20 relative">
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        {/* 日本語化ヘッダー */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase">
              売上分析ダッシュボード
            </h1>
            <p className="text-zinc-500 text-sm font-bold">
              2026年度 経営統計データ
            </p>
          </div>
          <input
            type="date"
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-2xl text-sm font-bold shadow-sm outline-none"
            onChange={(e) =>
              e.target.value &&
              setSelectedDate(
                new Date(e.target.value).toLocaleDateString("ja-JP")
              )
            }
          />
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border-2 border-blue-500 shadow-xl">
            <p className="text-xs font-bold text-blue-500 mb-1">
              {selectedDate === todayStr ? "今日" : selectedDate} の売上合計
            </p>
            <p className="text-4xl font-black italic">
              ¥{selectedDayStats.revenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-bold text-zinc-400 mb-1">来店数</p>
            <p className="text-4xl font-black text-emerald-500">
              {selectedDayStats.count}{" "}
              <span className="text-sm font-bold text-zinc-400">名</span>
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-bold text-zinc-400 mb-1">客単価</p>
            <p className="text-4xl font-black text-purple-500">
              ¥{selectedDayStats.average.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1 space-y-8">
            {/* 時間帯別グラフ：型エラーを (data: any) で回避 */}
            <div>
              <h2 className="text-xs font-bold text-zinc-400 mb-4 uppercase tracking-widest">
                時間帯別の来店状況 (0時-23時)
              </h2>
              <div className="h-[200px] w-full bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={hourlyData}
                    margin={{ top: 10, right: 10, left: -35, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 7, fill: "#9ca3af" }}
                      interval={0}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 7, fill: "#9ca3af" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f0fdf4" }}
                      labelFormatter={(v) => `${v}時`}
                    />
                    <Bar
                      dataKey="count"
                      fill="#10b981"
                      radius={[2, 2, 0, 0]}
                      onClick={(data: any) =>
                        setSelectedHourDetail({
                          hour: `${data.hour}時`,
                          sales: daySales.filter(
                            (s) =>
                              new Date(s.created_at).getHours() === data.rawHour
                          ),
                        })
                      }
                      style={{ cursor: "pointer" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 月別売上比較（日本語化＆はみ出し防止） */}
            <div>
              <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  月別売上比較 (昨年 vs 今年)
                </h2>
                <div className="flex gap-2 text-[8px] font-black">
                  <span className="text-purple-600">● 2026年</span>
                  <span className="text-zinc-300">● 2025年</span>
                </div>
              </div>
              <div className="h-[220px] w-full bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyComparisonData}
                    margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: "#9ca3af" }}
                      interval={0}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 8, fill: "#9ca3af" }}
                    />
                    <Tooltip labelFormatter={(v) => `${v}月`} />
                    <Bar
                      dataKey="去年"
                      fill="#e4e4e7"
                      radius={[3, 3, 0, 0]}
                      barSize={14}
                    />
                    <Bar
                      dataKey="今年"
                      fill="#a855f7"
                      radius={[3, 3, 0, 0]}
                      barSize={8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 当日の販売内訳（日本語化） */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between">
                <h2 className="font-bold text-xs">商品別 販売数</h2>
              </div>
              <div className="max-h-[250px] overflow-y-auto">
                {selectedDayStats.itemAnalysis.length > 0 ? (
                  selectedDayStats.itemAnalysis.map(([name, info]: any) => (
                    <div
                      key={name}
                      className="p-4 border-b last:border-0 dark:border-zinc-800 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <span className="font-bold text-xs">
                        {info.emoji} {name}
                      </span>
                      <span className="font-black text-blue-600">
                        {info.count} 個
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-8 text-center text-zinc-400 text-[10px] font-bold italic">
                    本日の売上データはありません
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 右セクション（日本語化） */}
          <section className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xs font-bold mb-6 text-zinc-400 uppercase tracking-widest italic font-black">
                直近30日間の売上推移
              </h2>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyData}
                    onClick={(data) =>
                      data?.activePayload &&
                      setSelectedDate(data.activePayload[0].payload.fullDate)
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip cursor={{ fill: "#f8fafc" }} />
                    <Bar
                      dataKey="total"
                      radius={[6, 6, 0, 0]}
                      style={{ cursor: "pointer" }}
                    >
                      {dailyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.fullDate === selectedDate
                              ? "#2563eb"
                              : "#d1d5db"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 取引履歴（日本語化） */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <h2 className="font-bold text-xs">最近の注文履歴</h2>
              </div>
              {sales.slice(0, 10).map((sale) => (
                <div
                  key={sale.id}
                  className="border-b last:border-0 dark:border-zinc-800"
                >
                  <button
                    onClick={() =>
                      setOpenId(openId === sale.id ? null : sale.id)
                    }
                    className="w-full p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-bold text-[10px]">
                        {new Date(sale.created_at).toLocaleString("ja-JP")}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-black">
                        店頭販売 / {sale.items?.length || 0}点
                      </p>
                    </div>
                    <p className="font-black text-sm">
                      ¥{sale.total.toLocaleString()}
                    </p>
                  </button>
                  {openId === sale.id && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-1">
                      <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                        {sale.items?.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between text-[11px] py-1 border-b last:border-0 border-zinc-200 dark:border-zinc-700"
                          >
                            <span>
                              {item.emoji} {item.name}
                            </span>
                            <span className="font-bold font-mono">
                              ¥{item.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* 詳細モーダル（日本語化） */}
      {selectedHourDetail && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black italic">
                  {selectedHourDetail.hour} の詳細内訳
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold">
                  {selectedDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedHourDetail(null)}
                className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedHourDetail.sales.length > 0 ? (
                selectedHourDetail.sales.map((sale, i) => (
                  <div
                    key={i}
                    className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700"
                  >
                    <div className="flex justify-between text-[9px] font-black text-blue-600 mb-2">
                      <span>伝票 #{i + 1}</span>
                      <span>¥{sale.total.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1 mt-2">
                      {sale.items?.map((item: any, j: number) => (
                        <div
                          key={j}
                          className="text-[11px] flex justify-between"
                        >
                          <span>
                            {item.emoji} {item.name}
                          </span>
                          <span className="font-bold">
                            ¥{item.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-zinc-400 font-bold italic text-sm">
                  注文はありませんでした
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedHourDetail(null)}
              className="w-full mt-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-4 rounded-2xl font-black transition-transform active:scale-95"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
