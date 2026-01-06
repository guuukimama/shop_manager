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
    const { data: items } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: true });

    if (items) setMenuItems(items);

    const savedCats = localStorage.getItem("shop_categories");
    // ここもデフォルト値を空にする修正を反映
    const parsedCats = savedCats ? JSON.parse(savedCats) : [];
    setCategories(parsedCats);
    if (parsedCats.length > 0) setSelectedCategory(parsedCats[0]);
  };

  const filteredItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
  const tax = Math.floor(subtotal * (isTakeout ? 0.08 : 0.1));
  const total = subtotal + tax;

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
      alert("エラー: " + error.message);
    } else {
      alert("お会計が完了しました！");
      setCart([]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-white pb-10">
      <Header />
      <main className="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* 左側：メニュー選択 */}
        <div className="flex-[2] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">レジ</h2>
            <button
              onClick={() => setIsTakeout(!isTakeout)}
              className="p-3 px-5 border rounded-2xl bg-white dark:bg-zinc-900 shadow-sm font-bold text-sm"
            >
              {isTakeout ? "🥡 持帰 (8%)" : "🍽️ 店内 (10%)"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCart([...cart, item])}
                className="p-4 md:p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all text-left"
              >
                <p className="text-3xl mb-2">{item.emoji || "🍱"}</p>
                <p className="font-bold text-sm md:text-base line-clamp-1">
                  {item.name}
                </p>
                <p className="text-blue-600 font-black text-sm md:text-base">
                  ¥{item.price.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 右側：注文伝票（iPhoneで見えない問題を修正） */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col h-fit md:h-[calc(100vh-120px)] md:sticky md:top-24">
          <h2 className="text-xl font-bold border-b pb-4 mb-4 shrink-0">
            現在の注文
          </h2>

          {/* 商品リストエリア：iPhoneでも最小高さを確保し、中身が増えたらスクロールさせる */}
          <div className="overflow-y-auto space-y-2 pr-2 min-h-[150px] max-h-[300px] md:max-h-full flex-1">
            {cart.length > 0 ? (
              cart.map((item, i) => (
                <div
                  key={i}
                  onClick={() => removeFromCart(i)}
                  className="flex justify-between items-center text-sm py-3 border-b border-zinc-50 dark:border-zinc-800 cursor-pointer active:bg-red-50 dark:active:bg-red-900/20 px-2 rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-[10px] text-zinc-400">
                      #{i + 1} タップで取消
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      ¥{item.price.toLocaleString()}
                    </span>
                    <span className="text-red-500 text-xs font-bold">✕</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-400 mt-10 text-sm italic">
                商品を選択してください
              </p>
            )}
          </div>

          {/* 金額・ボタンエリア：下部に固定 */}
          <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-700 space-y-3 shrink-0">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>小計 (税抜)</span>
              <span>¥{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>消費税 ({isTakeout ? "8%" : "10%"})</span>
              <span>¥{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-black text-2xl pt-1">
              <span>合計</span>
              <span className="text-blue-600">¥{total.toLocaleString()}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg disabled:bg-zinc-100 dark:disabled:bg-zinc-800 transition-all mt-2 active:scale-95"
            >
              決済を確定
            </button>
            <button
              onClick={() => setCart([])}
              className="w-full text-zinc-400 text-[10px] mt-1 underline"
            >
              注文をすべてクリア
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
