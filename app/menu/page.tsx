"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function MenuManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newEmoji, setNewEmoji] = useState("🍴"); // デフォルト絵文字
  const [activeCategory, setActiveCategory] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editEmoji, setEditEmoji] = useState("");

  // カテゴリーに応じた初期絵文字を返す関数
  const getDefaultEmoji = (cat: string) => {
    if (cat.includes("ドリンク") || cat.includes("飲み物")) return "🥤";
    if (cat.includes("デザート") || cat.includes("スイーツ")) return "🍰";
    if (cat.includes("サイド") || cat.includes("つまみ")) return "🍟";
    if (cat.includes("メイン") || cat.includes("定食")) return "🍱";
    if (cat.includes("麺")) return "🍜";
    if (cat.includes("飯")) return "🍛";
    return "🍴"; // どれにも当てはまらない場合
  };

  useEffect(() => {
    const savedItems = localStorage.getItem("shop_items");
    if (savedItems) setItems(JSON.parse(savedItems));

    const savedCats = localStorage.getItem("shop_categories");
    const parsedCats = savedCats
      ? JSON.parse(savedCats)
      : ["メイン", "サイド", "ドリンク", "デザート"];
    setCategories(parsedCats);

    if (parsedCats.length > 0) {
      setActiveCategory(parsedCats[0]);
      setNewCategory(parsedCats[0]);
      setNewEmoji(getDefaultEmoji(parsedCats[0])); // 初期絵文字セット
    }
  }, []);

  // カテゴリー選択が変わったら絵文字も自動提案
  const handleCategoryChange = (cat: string) => {
    setNewCategory(cat);
    setNewEmoji(getDefaultEmoji(cat));
  };

  const saveToStorage = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("shop_items", JSON.stringify(newItems));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const newItem = {
      id: Date.now(),
      name: newName,
      price: parseInt(newPrice),
      category: newCategory,
      emoji: newEmoji, // 選択（または自動セット）された絵文字
    };
    saveToStorage([...items, newItem]);
    setNewName("");
    setNewPrice("");
  };

  const startEditing = (item: any) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditCategory(item.category);
    setEditEmoji(item.emoji);
  };

  const saveEdit = (id: number) => {
    const updatedItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            name: editName,
            price: parseInt(editPrice),
            category: editCategory,
            emoji: editEmoji,
          }
        : item
    );
    saveToStorage(updatedItems);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-white pb-20">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">メニュー管理</h1>

        {/* 登録フォーム */}
        <form
          onSubmit={addItem}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm flex flex-wrap gap-4 border border-zinc-200 dark:border-zinc-800 mb-12"
        >
          {/* 絵文字選択 */}
          <input
            type="text"
            className="w-14 p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 text-center text-xl"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            title="絵文字を入力"
          />
          <input
            type="text"
            placeholder="商品名"
            className="flex-1 min-w-[200px] p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="number"
            placeholder="価格"
            className="w-32 p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <select
            className="p-3 border rounded-xl dark:bg-zinc-800 dark:border-zinc-700 font-bold outline-none"
            value={newCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
          >
            追加
          </button>
        </form>

        {/* カテゴリー別表示タブ */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md"
                  : "bg-white text-zinc-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
              }`}
            >
              {cat} ({items.filter((i) => i.category === cat).length})
            </button>
          ))}
        </div>

        {/* リスト表示 */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {items.filter((i) => i.category === activeCategory).length > 0 ? (
            items
              .filter((i) => i.category === activeCategory)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-5 border-b last:border-0 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {editingId === item.id ? (
                    <div className="flex flex-wrap gap-3 items-center">
                      <input
                        type="text"
                        className="w-12 p-2 border rounded-lg dark:bg-zinc-800"
                        value={editEmoji}
                        onChange={(e) => setEditEmoji(e.target.value)}
                      />
                      <input
                        type="text"
                        className="flex-1 min-w-[150px] p-2 border rounded-lg dark:bg-zinc-800"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <input
                        type="number"
                        className="w-24 p-2 border rounded-lg dark:bg-zinc-800 font-bold text-blue-600"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                      />
                      <select
                        className="p-2 border rounded-lg dark:bg-zinc-800"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-zinc-200 dark:bg-zinc-700 px-4 py-2 rounded-lg text-xs font-bold"
                        >
                          中止
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl bg-zinc-100 dark:bg-zinc-800 w-12 h-12 flex items-center justify-center rounded-2xl">
                          {item.emoji || "🍴"}
                        </span>
                        <div>
                          <p className="font-bold">{item.name}</p>
                          <p className="text-sm font-black text-blue-600">
                            ¥{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <button
                          onClick={() => startEditing(item)}
                          className="text-zinc-400 hover:text-blue-500 text-xs font-bold uppercase tracking-widest"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("削除しますか？"))
                              saveToStorage(
                                items.filter((i) => i.id !== item.id)
                              );
                          }}
                          className="text-zinc-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          ) : (
            <p className="p-10 text-center text-zinc-400 italic">
              このカテゴリーにはまだ商品がありません
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
