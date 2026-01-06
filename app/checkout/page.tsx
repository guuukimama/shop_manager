"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { supabase } from "@/lib/supabaseClient";

export default function CheckoutPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isTakeout, setIsTakeout] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: items, error: itemError } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: true });

    if (items) setMenuItems(items);

    const savedCats = localStorage.getItem("shop_categories");
    const parsedCats = savedCats
      ? JSON.parse(savedCats)
      : ["メイン", "サイド", "ドリンク", "デザート"];
    setCategories(parsedCats);
    if (parsedCats.length > 0) setSelectedCategory(parsedCats[0]);
  };

  const filteredItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
  const tax = Math.floor(subtotal * (isTakeout ? 0.08 : 0.1));
  const total = subtotal + tax;

  // --- 【追加】1点削除する関数 ---
  const removeFromCart = (indexToRemove: number) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const { error } = await supabase.from("sales").insert([
      {
        total: total,
        tax: tax,
        type: isTakeout ? "テイクアウト" : "店内",
        items: cart,
      },
    ]);

    if (error) {
      alert("お会計は完了していません: " + error.message);
    } else {
      alert("お会計が完了しました！");
      setCart([]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-white">
      <Header />
      <main className="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto">
        {/* 左側：メニュー選択 */}
        <div className="flex-[2] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">レジ</h2>
            <button
              onClick={() => setIsTakeout(!isTakeout)}
              className="p-3 px-5 border rounded-2xl bg-white dark:bg-zinc-900 shadow-sm font-bold text-sm transition-all active:scale-95"
            >
              {isTakeout ? "🥡 テイクアウト (8%)" : "🍽️ 店内飲食 (10%)"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                    : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCart([...cart, item])}
                  className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <p className="text-3xl mb-3 group-active:scale-110 transition-transform">
                    {item.emoji || "🍱"}
                  </p>
                  <p className="font-bold mb-1">{item.name}</p>
                  <p className="text-blue-600 font-black">
                    ¥{item.price.toLocaleString()}
                  </p>
                </button>
              ))
            ) : (
              <p className="col-span-full text-center py-10 text-zinc-400">
                このカテゴリーに商品はありません。
              </p>
            )}
          </div>
        </div>

        {/* 右側：伝票セクション（ここをタップ削除可能に修正） */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-6 flex flex-col h-[650px] sticky top-24 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">現在の注文</h2>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {cart.length > 0 ? (
              cart.map((item, i) => (
                <div
                  key={i}
                  // タップでその商品だけ削除
                  onClick={() => removeFromCart(i)}
                  className="flex justify-between items-center text-sm py-2 border-b border-zinc-50 dark:border-zinc-800 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors px-2 rounded-lg"
                  title="タップで削除"
                >
                  <div className="flex flex-col">
                    <span className="font-medium group-hover:text-red-500 transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      #{i + 1} タップで取消
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold group-hover:text-red-500">
                      ¥{item.price.toLocaleString()}
                    </span>
                    <span className="text-zinc-300 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xs">
                      ✕
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-400 mt-10 text-sm italic">
                商品を選択してください
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-dashed border-zinc-200 dark:border-zinc-700 space-y-3">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>小計 (税抜)</span>
              <span>¥{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span>消費税 ({isTakeout ? "8%" : "10%"})</span>
              <span>¥{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-black text-3xl pt-2">
              <span>合計</span>
              <span className="text-blue-600">¥{total.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-xl disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 transition-all mt-4 shadow-lg shadow-blue-100 dark:shadow-none active:scale-95"
            >
              決済を確定
            </button>
            <button
              onClick={() => setCart([])}
              className="w-full text-zinc-400 text-xs mt-2 hover:text-red-400 transition-colors underline underline-offset-4"
            >
              注文をすべてクリア
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
