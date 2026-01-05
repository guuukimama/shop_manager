"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function CheckoutPage() {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isTakeout, setIsTakeout] = useState(false);

  // 動的カテゴリー
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    // メニューの取得
    const savedItems = localStorage.getItem("shop_items");
    if (savedItems) setMenuItems(JSON.parse(savedItems));

    // カテゴリーの取得
    const savedCats = localStorage.getItem("shop_categories");
    const parsedCats = savedCats
      ? JSON.parse(savedCats)
      : ["メイン", "サイド", "ドリンク", "デザート"];
    setCategories(parsedCats);
    if (parsedCats.length > 0) setSelectedCategory(parsedCats[0]);
  }, []);

  const filteredItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );
  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
  const tax = Math.floor(subtotal * (isTakeout ? 0.08 : 0.1));
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newSale = {
      id: Date.now(),
      date: new Date().toISOString(),
      total,
      items: cart,
      tax,
      type: isTakeout ? "テイクアウト" : "店内",
    };
    const existingSales = JSON.parse(
      localStorage.getItem("shop_sales") || "[]"
    );
    localStorage.setItem(
      "shop_sales",
      JSON.stringify([...existingSales, newSale])
    );
    alert("会計完了！");
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-white">
      <Header />
      <main className="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto">
        <div className="flex-[2] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">レジ</h2>
            <button
              onClick={() => setIsTakeout(!isTakeout)}
              className="p-2 border rounded-xl bg-white dark:bg-zinc-800 font-bold text-sm"
            >
              {isTakeout ? "🥡 8%" : "🍽️ 10%"}
            </button>
          </div>

          {/* カテゴリータブ */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCart([...cart, item])}
                className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 transition-all text-left"
              >
                <p className="text-2xl mb-2">{item.emoji || "🍱"}</p>
                <p className="font-bold">{item.name}</p>
                <p className="text-blue-600 font-bold">
                  ¥{item.price.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 伝票セクション */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-6 flex flex-col h-[600px] sticky top-24 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">伝票</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {cart.map((item, i) => (
              <div
                key={i}
                className="flex justify-between text-sm py-1 border-b border-zinc-50 dark:border-zinc-800"
              >
                <span>{item.name}</span>
                <span className="font-bold">
                  ¥{item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-dashed space-y-3">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>小計 (税抜)</span>
              <span>¥{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-2xl pt-2">
              <span>合計</span>
              <span className="text-blue-600">¥{total.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-xl disabled:bg-zinc-200 dark:disabled:bg-zinc-800 transition-all mt-4"
            >
              決済を確定
            </button>
            <button
              onClick={() => setCart([])}
              className="w-full text-zinc-400 text-sm mt-2"
            >
              注文クリア
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
