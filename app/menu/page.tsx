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

  useEffect(() => {
    fetchItems();
    const savedCats = localStorage.getItem("shop_categories");
    const parsedCats = savedCats
      ? JSON.parse(savedCats)
      : ["メイン", "サイド", "ドリンク", "デザート"];
    setCategories(parsedCats);
    if (parsedCats.length > 0) {
      setActiveCategory(parsedCats[0]);
      setNewCategory(parsedCats[0]);
    }
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setItems(data || []);
  }

  // --- 追加 ---
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

  // --- 更新 (編集) ---
  const updateItem = async (id: string, updates: any) => {
    const { error } = await supabase.from("items").update(updates).eq("id", id);
    if (!error) {
      setEditingId(null);
      fetchItems();
    } else {
      alert("更新に失敗しました");
    }
  };

  // --- 削除 ---
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
            className="w-14 p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-center text-xl"
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
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700"
          >
            登録する
          </button>
        </form>

        {/* カテゴリー切り替え */}
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
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {items
            .filter((i) => i.category === activeCategory)
            .map((item) => (
              <div
                key={item.id}
                className="p-5 border-b last:border-0 dark:border-zinc-800 flex justify-between items-center group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl bg-zinc-100 dark:bg-zinc-800 w-12 h-12 flex items-center justify-center rounded-2xl">
                    {item.emoji}
                  </span>

                  {editingId === item.id ? (
                    /* 編集モード */
                    <div className="flex flex-wrap gap-2 flex-1">
                      <input
                        autoFocus
                        className="border p-2 rounded-lg dark:bg-zinc-800 text-sm"
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
                      <input
                        type="number"
                        className="border p-2 rounded-lg dark:bg-zinc-800 text-sm w-24"
                        value={item.price}
                        onChange={(e) =>
                          setItems(
                            items.map((i) =>
                              i.id === item.id
                                ? { ...i, price: parseInt(e.target.value) }
                                : i
                            )
                          )
                        }
                      />
                      <button
                        onClick={() =>
                          updateItem(item.id, {
                            name: item.name,
                            price: item.price,
                          })
                        }
                        className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          fetchItems();
                        }}
                        className="bg-zinc-200 dark:bg-zinc-700 px-3 py-1 rounded-lg text-xs font-bold"
                      >
                        キャンセル
                      </button>
                    </div>
                  ) : (
                    /* 通常表示モード */
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setEditingId(item.id)}
                    >
                      <p className="font-bold flex items-center gap-2">
                        {item.name}
                        <span className="text-[10px] text-zinc-400 font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                          クリックで編集
                        </span>
                      </p>
                      <p className="text-sm font-black text-blue-600">
                        ¥{item.price.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-zinc-400 hover:text-red-500 text-xs font-bold"
                  >
                    削除する
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
