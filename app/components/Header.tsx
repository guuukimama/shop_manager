import Link from "next/link"; // ← ここに書く！
import Image from "next/image";

export default function Home() {
  return (
    <header>
      <Image
        className="dark:invert"
        src="/shop_manager.png"
        alt="shop-manager logo"
        width={150}
        height={20}
        priority
      />
      <nav>
        {/* text-sm を text-2xl に変更、gap-6 を gap-10 に広げて調整 */}
        <ul className="flex gap-10 text-2xl font-bold text-gray-700">
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
