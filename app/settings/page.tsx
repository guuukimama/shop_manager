"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import styles from "../page.module.css";
import { supabase } from "@/lib/supabaseClient";

// --- ドラッグ&ドロップ用のインポート ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({
  id,
  onRemove,
}: {
  id: string;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-700 shadow-sm mb-2 touch-none"
    >
      <div
        className="flex items-center gap-3 flex-1"
        {...attributes}
        {...listeners}
      >
        <span className="text-zinc-400">☰</span>
        <span className="dark:text-white">{id}</span>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="text-red-500 hover:text-red-700 p-1 px-2 text-lg"
      >
        ×
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [shopName, setShopName] = useState("My Awesome Shop");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const savedName = localStorage.getItem("shop_config_name");
    if (savedName) setShopName(savedName);
    syncCategories();
  }, []);

  async function syncCategories() {
    const { data } = await supabase.from("items").select("category");
    const dbCats = data ? data.map((item: any) => item.category) : [];

    const savedCats = localStorage.getItem("shop_categories");
    // 修正：デフォルトの ["メイン", ...] を削除
    const parsedCats = savedCats ? JSON.parse(savedCats) : [];

    const allUniqueCats = Array.from(new Set([...parsedCats, ...dbCats]));
    setCategories(allUniqueCats);

    if (allUniqueCats.length > 0) {
      localStorage.setItem("shop_categories", JSON.stringify(allUniqueCats));
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const result = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem("shop_categories", JSON.stringify(result));
        return result;
      });
    }
  };

  const handleSave = () => {
    localStorage.setItem("shop_config_name", shopName);
    localStorage.setItem("shop_categories", JSON.stringify(categories));
    alert("保存しました！");
    window.location.reload();
  };

  const resetAllData = () => {
    if (confirm("初期化しますか？")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const addCategory = () => {
    if (!newCat || categories.includes(newCat)) return;
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem("shop_categories", JSON.stringify(updated));
    setNewCat("");
  };

  const removeCategory = (cat: string) => {
    const updated = categories.filter((c) => c !== cat);
    setCategories(updated);
    localStorage.setItem("shop_categories", JSON.stringify(updated));
  };

  return (
    <div
      className={`${styles["main-wrap"]} flex min-h-screen flex-col bg-zinc-50 dark:bg-black`}
    >
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 pb-20">
        <header className="mb-10">
          <h1 className="text-3xl font-bold dark:text-white">設定</h1>
        </header>
        <div className="space-y-6">
          <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border dark:border-zinc-800">
            <h2 className="text-lg font-bold mb-4">ショップ名</h2>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full md:w-2/3 px-4 py-3 rounded-xl border dark:bg-zinc-800 dark:border-zinc-700 outline-none"
            />
          </section>

          <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border dark:border-zinc-800">
            <h2 className="text-lg font-bold mb-2">カテゴリー設定</h2>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="例: おにく"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border dark:bg-zinc-800 dark:border-zinc-700"
              />
              <button
                onClick={addCategory}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
              >
                追加
              </button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={categories}
                strategy={verticalListSortingStrategy}
              >
                <div className="max-w-md">
                  {categories.map((cat) => (
                    <SortableItem
                      key={cat}
                      id={cat}
                      onRemove={removeCategory}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>

          <button
            onClick={handleSave}
            className="w-full bg-zinc-900 dark:bg-white dark:text-black text-white py-4 rounded-2xl font-bold shadow-lg"
          >
            設定を保存する
          </button>

          <button
            onClick={resetAllData}
            className="w-full text-red-500 text-sm mt-4"
          >
            設定を初期化する
          </button>
        </div>
      </main>
    </div>
  );
}
