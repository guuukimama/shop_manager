"use client";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import styles from "../page.module.css";
import { supabase } from "@/lib/supabaseClient"; // Supabaseをインポート

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

// --- 各カテゴリーアイテムのコンポーネント ---
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
    // ショップ名の読み込み
    const savedName = localStorage.getItem("shop_config_name");
    if (savedName) setShopName(savedName);

    // カテゴリーの読み込み（DB同期版）
    syncCategories();
  }, []);

  // DBの商品データとlocalStorageを合体させて同期する関数
  async function syncCategories() {
    // 1. DBから今使われているカテゴリーを取得
    const { data, error } = await supabase.from("items").select("category");
    const dbCats = data ? data.map((item: any) => item.category) : [];

    // 2. localStorage から保存された並び順を取得
    const savedCats = localStorage.getItem("shop_categories");
    const parsedCats = savedCats
      ? JSON.parse(savedCats)
      : ["メイン", "サイド", "ドリンク", "デザート"];

    // 3. 重複を排除して合体
    const allUniqueCats = Array.from(new Set([...parsedCats, ...dbCats]));

    setCategories(allUniqueCats);
    // 最新の状態を一旦保存しておく
    localStorage.setItem("shop_categories", JSON.stringify(allUniqueCats));
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const result = arrayMove(items, oldIndex, newIndex);
        // 並び替えたらすぐにlocalStorageに反映（保存ボタン忘れ対策）
        localStorage.setItem("shop_categories", JSON.stringify(result));
        return result;
      });
    }
  };

  const handleSave = () => {
    localStorage.setItem("shop_config_name", shopName);
    localStorage.setItem("shop_categories", JSON.stringify(categories));
    alert("設定を保存しました！");
    window.location.reload();
  };

  const resetAllData = () => {
    if (
      confirm(
        "すべてのデータを削除しますか？（DBの商品データは削除されません）"
      )
    ) {
      localStorage.clear();
      alert("初期化しました。");
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
      className={`${styles["main-wrap"]} flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black`}
    >
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 pb-20">
        <header className="mb-10">
          <h1 className="text-3xl font-bold dark:text-white">設定</h1>
          <p className="text-zinc-500 mt-1 font-medium">
            基本設定とカテゴリーの並び替え
          </p>
        </header>

        <div className="space-y-6">
          <section className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-bold mb-4">一般設定</h2>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-zinc-500">
                ショップ名
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full md:w-2/3 px-4 py-3 rounded-xl border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-bold mb-2">メニューカテゴリー設定</h2>
            <p className="text-xs text-zinc-400 mb-6">
              ☰ をドラッグして並び順を変更できます
            </p>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="新しいカテゴリー名"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border dark:bg-zinc-800 dark:border-zinc-700 outline-none"
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

          <section className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 p-6">
            <h2 className="text-lg font-bold text-red-600 mb-4">
              メンテナンス
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">設定の初期化</p>
                <p className="text-sm text-zinc-500">
                  ショップ名とカテゴリー順をリセットします。
                </p>
              </div>
              <button
                onClick={resetAllData}
                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold"
              >
                初期化
              </button>
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="bg-zinc-900 dark:bg-white dark:text-black text-white px-10 py-4 rounded-2xl font-bold shadow-lg transition-transform active:scale-95"
            >
              設定を保存する
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
