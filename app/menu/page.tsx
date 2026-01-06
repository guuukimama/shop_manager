"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { supabase } from "@/lib/supabaseClient";

export default function MenuManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newEmoji, setNewEmoji] = useState("🍴");
  const [activeCategory, setActiveCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 初回読み込み
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setItems(data);

      // --- カテゴリーの自動同期ロジック ---
      // 1. デフォルトのカテゴリー
      const defaultCats = ["メイン", "サイド", "ドリンク", "デザート"];

      // 2. ブラウザに保存されているカテゴリー（もしあれば）
      const savedCats = localStorage.getItem("shop_categories");
      const parsedCats = savedCats ? JSON.parse(savedCats) : defaultCats;

      // 3. DBの全商品が持っているカテゴリーを抽出
      const dbCats = data.map((item: any) => item.category);

      // 1, 2, 3 をすべて合体させて重複を排除（Setを使用）
      const allUniqueCats: string[] = Array.from(
        new Set([...parsedCats, ...dbCats])
      );

      setCategories(allUniqueCats);

      // 表示するタブが未設定なら最初のものをセット
      if (!activeCategory && allUniqueCats.length > 0) {
        setActiveCategory(allUniqueCats[0]);
        setNewCategory(allUniqueCats[0]);
      }
    }
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const { error } = await supabase.from("items").insert([
      {
        name: newName,
        price: parseInt(newPrice),
        category: newCategory,
        emoji: newEmoji,
      },
    ]);
    if (!error) {
      setNewName("");
      setNewPrice("");
      fetchItems();
    }
  };

  const updateItem = async (id: string, updates: any) => {
    const { error } = await supabase.from("items").update(updates).eq("id", id);
    if (!error) {
      setEditingId(null);
      fetchItems();
    } else {
      alert("更新に失敗しました");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("この商品を削除してもよろしいですか？")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (!error) fetchItems();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-white pb-20">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">メニュー設定</h1>

        {/* 新規登録フォーム */}
        <form
          onSubmit={addItem}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm flex flex-wrap gap-4 border border-zinc-200 dark:border-zinc-800 mb-12"
        >
          <input
            type="text"
            className="w-14 p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-center text-xl shadow-inner"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
          />
          <input
            type="text"
            placeholder="商品名"
            className="flex-1 min-w-[200px] p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 outline-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="number"
            placeholder="価格"
            className="w-32 p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 outline-none"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <select
            className="p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 font-bold"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            登録する
          </button>
        </form>

        {/* カテゴリー切り替えタブ */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-zinc-500 border dark:bg-zinc-900 dark:border-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 商品リスト */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          {items
            .filter((i) => i.category === activeCategory)
            .map((item) => (
              <div
                key={item.id}
                className="p-5 border-b last:border-0 dark:border-zinc-800 flex justify-between items-center group"
              >
                {editingId === item.id ? (
                  <div className="flex flex-wrap gap-4 flex-1 items-center">
                    <input
                      className="w-14 h-14 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-center text-2xl shadow-inner outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.emoji}
                      onChange={(e) =>
                        setItems(
                          items.map((i) =>
                            i.id === item.id
                              ? { ...i, emoji: e.target.value }
                              : i
                          )
                        )
                      }
                    />
                    <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                      <input
                        autoFocus
                        className="border p-2 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm font-bold outline-none"
                        value={item.name}
                        onChange={(e) =>
                          setItems(
                            items.map((i) =>
                              i.id === item.id
                                ? { ...i, name: e.target.value }
                                : i
                            )
                          )
                        }
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-zinc-400">¥</span>
                        <input
                          type="number"
                          className="border p-2 rounded-lg dark:bg-zinc-800 text-sm w-24 font-mono"
                          value={item.price}
                          onChange={(e) =>
                            setItems(
                              items.map((i) =>
                                i.id === item.id
                                  ? {
                                      ...i,
                                      price: parseInt(e.target.value) || 0,
                                    }
                                  : i
                              )
                            )
                          }
                        />
                        <select
                          className="border p-2 rounded-lg dark:bg-zinc-800 text-xs font-bold"
                          value={item.category}
                          onChange={(e) =>
                            setItems(
                              items.map((i) =>
                                i.id === item.id
                                  ? { ...i, category: e.target.value }
                                  : i
                              )
                            )
                          }
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() =>
                          updateItem(item.id, {
                            name: item.name,
                            price: item.price,
                            emoji: item.emoji,
                            category: item.category,
                          })
                        }
                        className="bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          fetchItems();
                        }}
                        className="text-xs text-zinc-400"
                      >
                        戻る
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="flex items-center gap-4 flex-1 cursor-pointer"
                      onClick={() => setEditingId(item.id)}
                    >
                      <span className="text-3xl bg-zinc-100 dark:bg-zinc-800 w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm">
                        {item.emoji}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm font-black text-blue-600">
                          ¥{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-zinc-300 hover:text-red-500 p-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
