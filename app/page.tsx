"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import styles from "./page.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; // Supabaseをインポート

export default function Home() {
  const [todaySales, setTodaySales] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [topItem, setTopItem] = useState("データを取得中...");

  useEffect(() => {
    fetchTodayStats();
  }, []);

  async function fetchTodayStats() {
    // 今日の日付の開始（00:00:00）を取得
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).toISOString();

    // Supabaseから今日のデータのみ取得
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .gte("created_at", startOfDay); // 今日の0時以降のデータを取得

    if (error) {
      console.error("データの取得に失敗しました:", error);
      setTopItem("データなし");
      return;
    }

    if (data) {
      // 1. 売上合計の計算
      const total = data.reduce((sum, sale) => sum + sale.total, 0);
      setTodaySales(total);

      // 2. 客数（決済件数）のカウント
      setCustomerCount(data.length);

      // 3. 人気メニューの集計
      const itemCounts: { [key: string]: number } = {};
      data.forEach((sale) => {
        // itemsカラムはJSON形式で保存されている前提
        sale.items?.forEach((item: any) => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
        });
      });

      const sortedItems = Object.entries(itemCounts).sort(
        (a, b) => b[1] - a[1]
      );
      if (sortedItems.length > 0) {
        setTopItem(`${sortedItems[0][0]} (${sortedItems[0][1]} 皿)`);
      } else {
        setTopItem("データなし");
      }
    }
  }

  return (
    <div
      className={`${styles["main-wrap"]} flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black`}
    >
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto py-12 px-6">
        <section className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-zinc-50">
              Welcome back!
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
              {new Date().toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              の状況です
              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase">
                Cloud Live
              </span>
            </p>
          </div>
          <button
            onClick={fetchTodayStats}
            className="text-xs text-zinc-400 hover:text-zinc-600 underline"
          >
            更新
          </button>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 売上カード */}
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest">
              本日の総売上額
            </h2>
            <p className="text-5xl font-black mt-4">
              ¥{todaySales.toLocaleString()}
            </p>
            <p className="text-sm text-zinc-500 mt-3 font-medium italic">
              Supabase同期中
            </p>
          </div>

          {/* 客数カード */}
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest">
              来店数
            </h2>
            <p className="text-5xl font-black mt-4">
              {customerCount} <span className="text-2xl">件</span>
            </p>
            <p className="text-sm text-zinc-500 mt-3 font-medium">
              本日の注文回数
            </p>
          </div>

          {/* 人気メニュー */}
          <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-purple-600 uppercase tracking-widest">
              本日の人気メニュー
            </h2>
            <p className="text-3xl font-bold mt-4 break-words leading-tight">
              {topItem}
            </p>
            <p className="text-sm text-zinc-500 mt-3 font-medium">
              本日の売れ筋
            </p>
          </div>
        </div>

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
