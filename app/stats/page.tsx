"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function StatsPage() {
  const [sales, setSales] = useState<any[]>([]);
  // どの取引詳細を開いているかを管理する状態
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("shop_sales");
    if (saved) setSales(JSON.parse(saved));
  }, []);

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCount = sales.length;
  const averageSpend =
    totalCount > 0 ? Math.floor(totalRevenue / totalCount) : 0;

  // 詳細の開閉を切り替える関数
  const toggleDetail = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">売上レポート (全期間)</h1>

        {/* サマリーカード (変更なし) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border">
            <p className="text-sm font-bold text-zinc-500">総売上 (税込)</p>
            <p className="text-3xl font-black text-blue-600 mt-2">
              ¥{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border">
            <p className="text-sm font-bold text-zinc-500">客数</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">
              {totalCount} 人
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm border">
            <p className="text-sm font-bold text-zinc-500">客単価</p>
            <p className="text-3xl font-black text-purple-600 mt-2">
              ¥{averageSpend.toLocaleString()}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">最近の取引履歴</h2>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border overflow-hidden">
          {sales.length === 0 ? (
            <p className="p-10 text-center text-zinc-400">
              取引データがありません
            </p>
          ) : (
            sales
              .slice()
              .reverse()
              .map((sale) => (
                <div
                  key={sale.id}
                  className="border-b dark:border-zinc-800 last:border-0"
                >
                  {/* クリックできるヘッダー部分 */}
                  <button
                    onClick={() => toggleDetail(sale.id)}
                    className="w-full p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <div className="flex flex-col">
                      <p className="font-bold text-sm">
                        {new Date(sale.date).toLocaleString()}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        <span
                          className={`px-1.5 py-0.5 rounded-md mr-2 ${
                            sale.type === "テイクアウト"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {sale.type}
                        </span>
                        商品 {sale.items.length} 点
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

                  {/* 詳細エリア (openIdが一致した時だけ表示) */}
                  {openId === sale.id && (
                    <div className="px-6 pb-6 pt-2 bg-zinc-50/50 dark:bg-zinc-800/30 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-inner">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b pb-2">
                          Order Details
                        </p>
                        <div className="space-y-2">
                          {sale.items.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-zinc-700 dark:text-zinc-300">
                                {item.name}
                              </span>
                              <span className="font-medium">
                                ¥{item.price.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700 flex justify-between text-xs text-zinc-500">
                          <span>消費税内訳</span>
                          <span>¥{sale.tax.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </main>
    </div>
  );
}
