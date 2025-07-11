'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Layout({ children }) {
  const pathname = usePathname();
  
  // 导航项
  const navItems = [
    { path: '/', label: '构建' },
    { path: '/entries', label: '词条' },
    { path: '/equipment', label: '装备' },
    { path: '/guides', label: '指南' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 顶部导航栏 */}
      <header className="bg-gray-800 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-amber-500">
              火炬之光无限 构建工具
            </Link>
          </div>
          <nav>
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className={`${
                      pathname === item.path 
                        ? 'text-amber-400 border-b-2 border-amber-400 pb-1' 
                        : 'hover:text-amber-400'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 p-6 mt-8">
        <div className="container mx-auto text-center text-gray-400 text-sm">
          <p>火炬之光无限构建工具 - 非官方粉丝项目</p>
          <p className="mt-2">数据基于游戏第8赛季</p>
        </div>
      </footer>
    </div>
  );
} 