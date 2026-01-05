import Link from "next/link"; // ← ここに書く！
import Image from "next/image";
import styles from "./Header.module.css"; // "from" です！

export default function Home() {
  return (
    <header className={styles.header}>
      <Image
        className="dark:invert"
        src="/shop_manager.png"
        alt="shop-manager logo"
        width={150}
        height={20}
        priority
      />
      <nav>
        {/* text-base: スマホでは16px
    md:text-2xl: 画面が広くなったら24px
    gap-4: スマホでは少し狭く
    md:gap-10: PCでは広く
  */}
        <ul className="flex gap-4 md:gap-10 text-base md:text-2xl font-bold text-gray-700">
          <li>
            <Link href="/" className="hover:text-blue-600">
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
