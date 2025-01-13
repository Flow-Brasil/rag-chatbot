'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-4">
      <div className="max-w-7xl mx-auto flex justify-center gap-4">
        <Link
          href="/"
          className={`flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${isActive('/')}`}
        >
          <span className="material-icons mr-2">home</span>
          Início
        </Link>
        <Link
          href="/chat/clientes"
          className={`flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${isActive('/chat/clientes')}`}
        >
          <span className="material-icons mr-2">chat</span>
          Chat Clientes
        </Link>
        <Link
          href="/gerenciador/clientes"
          className={`flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${isActive('/gerenciador/clientes')}`}
        >
          <span className="material-icons mr-2">people</span>
          Clientes
        </Link>
        <Link
          href="/gerenciador/upload"
          className={`flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${isActive('/gerenciador/upload')}`}
        >
          <span className="material-icons mr-2">upload</span>
          Upload
        </Link>
      </div>
    </nav>
  );
} 