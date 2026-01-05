import Link from "next/link"; // ← ここに書く！
import Image from "next/image";
import styles from "./Header.module.css"; // "from" です！

export default function Home() {
  return (
    <header className={styles.header}>
      {/* ロゴをLinkで囲んでホーム(TOP)へ戻れるようにする */}
      <Link href="/">
        <Image
          className="dark:invert cursor-pointer"
          src="/shop_manager.png"
          alt="shop-manager logo"
          width={150}
          height={20}
          priority
        />
      </Link>

      <nav>
        <ul className="flex gap-4 md:gap-10 text-base md:text-2xl font-bold text-gray-700">
          <li>
            {/* お会計専用のページ /checkout に飛ばす */}
            <Link href="/checkout" className="hover:text-blue-600">
              お会計
            </Link>
          </li>
          <li>
            <Link href="/menu" className="hover:text-blue-600">
              メニュー管理
            </Link>
          </li>
          <li>
            <Link href="/stats" className="hover:text-blue-600">
              統計
            </Link>
          </li>
          <li>
            <Link href="/settings" className="hover:text-blue-600">
              設定
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
