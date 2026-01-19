'use client';

import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          DishaSetu
        </Link>
        <div className="flex gap-4">
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      </div>
    </nav>
  );
};
