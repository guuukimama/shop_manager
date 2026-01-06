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

  // お釣り計算用のステート
  const [receivedAmount, setReceivedAmount] = useState<string>("0");

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
    const parsedCats = savedCats ? JSON.parse(savedCats) : [];
    setCategories(parsedCats);
    if (parsedCats.length > 0) setSelectedCategory(parsedCats[0]);
  };

  const filteredItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  // 金額計算
  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
  const tax = Math.floor(subtotal * (isTakeout ? 0.08 : 0.1));
  const total = subtotal + tax;

  // お釣り計算
  const change = Math.max(0, parseInt(receivedAmount) - total);

  // テンキー入力
  const handleNumberInput = (num: string) => {
    setReceivedAmount((prev) => {
      if (prev === "0") return num;
      if (prev.length > 8) return prev; // 桁数制限
      return prev + num;
    });
  };

  // 注文と入金をすべてリセット
  const resetAll = () => {
    setCart([]);
    setReceivedAmount("0");
  };

  const removeFromCart = (indexToRemove: number) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || parseInt(receivedAmount) < total) {
      alert("預かり金額が足りません");
      return;
    }
    const { error } = await supabase
      .from("sales")
      .insert([
        { total, tax, type: isTakeout ? "テイクアウト" : "店内", items: cart },
      ]);

    if (error) {
      alert("エラー: " + error.message);
    } else {
      alert(`お会計完了！ お釣りは ¥${change.toLocaleString()} です`);
      resetAll(); // 完了時にリセット
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
              className={`p-3 px-5 border rounded-2xl shadow-sm font-bold text-sm transition-colors ${
                isTakeout
                  ? "bg-orange-500 text-white border-orange-600"
                  : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800"
              }`}
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
                    ? "bg-blue-600 text-white shadow-lg"
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
                className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all text-left group"
              >
                <p className="text-3xl mb-2 group-active:scale-110 transition-transform">
                  {item.emoji || "🍱"}
                </p>
                <p className="font-bold text-sm line-clamp-1">{item.name}</p>
                <p className="text-blue-600 font-black">
                  ¥{item.price.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 右側：注文伝票 & お釣り計算 */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-5 border border-zinc-200 dark:border-zinc-800 flex flex-col h-fit md:h-[calc(100vh-120px)] md:sticky md:top-24">
          <h2 className="text-xl font-bold border-b pb-4 mb-4 shrink-0">
            現在の注文
          </h2>

          {/* 注文リスト */}
          <div className="overflow-y-auto space-y-1 min-h-[100px] max-h-[180px] md:max-h-full flex-1 mb-4">
            {cart.length > 0 ? (
              cart.map((item, i) => (
                <div
                  key={i}
                  onClick={() => removeFromCart(i)}
                  className="flex justify-between items-center text-sm py-2 border-b dark:border-zinc-800 cursor-pointer active:bg-red-50 dark:active:bg-red-900/20 px-2 rounded-lg group"
                >
                  <span className="font-medium text-xs group-hover:text-red-500">
                    {item.name}
                  </span>
                  <span className="font-bold group-hover:text-red-500">
                    ¥{item.price.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-400 mt-10 text-xs italic">
                商品を選択してください
              </p>
            )}
          </div>

          {/* 金額計算表示 */}
          <div className="space-y-2 shrink-0 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between text-zinc-500 text-xs">
              <span>合計金額</span>
              <span className="font-bold">¥{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-700 pb-2">
              <span className="text-xs text-zinc-500">お預かり</span>
              <span className="text-2xl font-black">
                ¥{parseInt(receivedAmount).toLocaleString()}
              </span>
            </div>
            <div
              className={`flex justify-between items-end pt-1 ${
                change > 0 ? "text-orange-600" : "text-zinc-400"
              }`}
            >
              <span className="text-xs font-bold">お釣り</span>
              <span className="text-3xl font-black">
                ¥{change.toLocaleString()}
              </span>
            </div>
          </div>

          {/* クイック入力ボタン */}
          <div className="grid grid-cols-4 gap-2 mt-4 shrink-0">
            <button
              onClick={() => setReceivedAmount(total.toString())}
              className="text-[10px] font-bold py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 active:bg-blue-100"
            >
              ちょうど
            </button>
            <button
              onClick={() => setReceivedAmount("1000")}
              className="text-[10px] font-bold py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg active:bg-zinc-200"
            >
              1,000
            </button>
            <button
              onClick={() => setReceivedAmount("5000")}
              className="text-[10px] font-bold py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg active:bg-zinc-200"
            >
              5,000
            </button>
            <button
              onClick={() => setReceivedAmount("10000")}
              className="text-[10px] font-bold py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg active:bg-zinc-200"
            >
              10,000
            </button>
          </div>

          {/* テンキー */}
          <div className="grid grid-cols-3 gap-2 mt-2 shrink-0">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00"].map(
              (n) => (
                <button
                  key={n}
                  onClick={() => handleNumberInput(n)}
                  className="py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold active:bg-zinc-200 dark:active:bg-zinc-700"
                >
                  {n}
                </button>
              )
            )}
            <button
              onClick={() => setReceivedAmount("0")}
              className="py-3 bg-red-50 text-red-500 rounded-xl font-bold active:bg-red-100"
            >
              C
            </button>
          </div>

          {/* 決済ボタン */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || parseInt(receivedAmount) < total}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg disabled:bg-zinc-100 dark:disabled:bg-zinc-800 mt-4 active:scale-95 transition-all shadow-lg"
          >
            決済を確定
          </button>

          <button
            onClick={resetAll}
            className="w-full text-zinc-400 text-[10px] mt-3 underline hover:text-red-500 transition-colors"
          >
            注文をすべてクリア
          </button>
        </div>
      </main>
    </div>
  );
}
