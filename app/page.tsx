"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import styles from "./page.module.css";
import Link from "next/link"; // ページ遷移用

export default function Home() {
  const [todaySales, setTodaySales] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [topItem, setTopItem] = useState("データなし");

  useEffect(() => {
    // 保存された売上データを取得
    const savedSales = JSON.parse(localStorage.getItem("shop_sales") || "[]");

    // 今日の日付のデータのみに絞り込み
    const today = new Date().toLocaleDateString();
    const todayData = savedSales.filter(
      (sale: any) => new Date(sale.date).toLocaleDateString() === today
    );

    // 1. 今日の売上合計
    const total = todayData.reduce(
      (sum: number, sale: any) => sum + sale.total,
      0
    );
    setTodaySales(total);

    // 2. 今日の客数
    setCustomerCount(todayData.length);

    // 3. 本日の人気メニューの集計
    const itemCounts: { [key: string]: number } = {};
    todayData.forEach((sale: any) => {
      sale.items.forEach((item: any) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
      });
    });

    const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    if (sortedItems.length > 0) {
      setTopItem(`${sortedItems[0][0]} (${sortedItems[0][1]} 皿)`);
    }
  }, []);

  return (
    <div
      className={`${styles["main-wrap"]} flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black`}
    >
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto py-12 px-6">
        <section className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-zinc-50">
            Welcome back!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
            {new Date().toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            の状況です。
          </p>
        </section>

        {/* 統計カードのグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 売上カード */}
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest">
              Today's Sales
            </h2>
            <p className="text-5xl font-black mt-4">
              ¥{todaySales.toLocaleString()}
            </p>
            <p className="text-sm text-zinc-500 mt-3 font-medium">
              決済確定済みの総額
            </p>
          </div>

          {/* 来客数カード */}
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
            <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest">
              Customers
            </h2>
            <p className="text-5xl font-black mt-4">
              {customerCount} <span className="text-2xl">件</span>
            </p>
            <p className="text-sm text-zinc-500 mt-3 font-medium">
              本日の決済回数
            </p>
          </div>

          {/* 人気メニューカード */}
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md">
            <h2 className="text-sm font-bold text-purple-600 uppercase tracking-widest">
              Top Item
            </h2>
            <p className="text-3xl font-bold mt-4 break-words leading-tight">
              {topItem}
            </p>
            <p className="text-sm text-zinc-500 mt-3 font-medium">
              本日の売れ筋商品
            </p>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link href="/checkout">
            <button className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-95">
              新しい注文を受ける
            </button>
          </Link>
          <Link href="/menu">
            <button className="w-full sm:w-auto bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white border border-zinc-200 dark:border-zinc-700 px-10 py-5 rounded-2xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all active:scale-95">
              メニューを更新する
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
