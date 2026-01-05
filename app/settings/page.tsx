"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import styles from "../page.module.css";

export default function SettingsPage() {
  // 状態管理
  const [shopName, setShopName] = useState("My Awesome Shop");
  const [currency, setCurrency] = useState("JPY");
  const [isAutoPrint, setIsAutoPrint] = useState(false);
  // カテゴリー管理を追加
  const [categories, setCategories] = useState<string[]>([]);
  const [newCat, setNewCat] = useState("");

  // 初回読み込み
  useEffect(() => {
    const savedName = localStorage.getItem("shop_config_name");
    const savedCategories = localStorage.getItem("shop_categories");
    if (savedName) setShopName(savedName);
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // 初期値
      const defaultCats = ["メイン", "サイド", "ドリンク", "デザート"];
      setCategories(defaultCats);
      localStorage.setItem("shop_categories", JSON.stringify(defaultCats));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("shop_config_name", shopName);
    localStorage.setItem("shop_categories", JSON.stringify(categories));
    alert("設定を保存しました！");
    window.location.reload(); // 反映のためにリロード
  };

  // データの初期化（デバッグ・運用リセット用）
  const resetAllData = () => {
    if (
      confirm(
        "すべての売上、メニュー、設定データを削除しますか？この操作は取り消せません。"
      )
    ) {
      localStorage.clear();
      alert("すべてのデータを初期化しました。");
      window.location.reload();
    }
  };

  const addCategory = () => {
    if (!newCat || categories.includes(newCat)) return;
    setCategories([...categories, newCat]);
    setNewCat("");
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
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
            アプリ全体の基本設定を行います
          </p>
        </header>

        <div className="space-y-6">
          {/* 一般設定 */}
          <section className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-bold">一般設定</h2>
            </div>
            <div className="p-6 space-y-6">
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
            </div>
          </section>

          {/* カテゴリー管理 */}
          <section className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-bold">メニューカテゴリー設定</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="新しいカテゴリー名"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border dark:bg-zinc-800 dark:border-zinc-700 outline-none"
                />
                <button
                  onClick={addCategory}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold"
                >
                  追加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-sm font-bold"
                  >
                    {cat}
                    <button
                      onClick={() => removeCategory(cat)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">
                ※ここでの変更はメニュー登録・会計画面のタブに反映されます。
              </p>
            </div>
          </section>

          {/* メンテナンス設定 */}
          <section className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
            <div className="p-6 border-b border-red-50 border-zinc-800">
              <h2 className="text-lg font-bold text-red-600">メンテナンス</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">データの初期化</p>
                  <p className="text-sm text-zinc-500">
                    すべての売上履歴、登録メニューを完全に消去します。
                  </p>
                </div>
                <button
                  onClick={resetAllData}
                  className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
                >
                  初期化を実行
                </button>
              </div>
            </div>
          </section>

          {/* 保存ボタン */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="bg-zinc-900 dark:bg-white dark:text-black text-white px-10 py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
              設定を保存する
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
