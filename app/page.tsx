"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-xl text-slate-800 dark:text-slate-100">
            eCommerce Template
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Products
          </Link>
          <AuthButtons />
        </div>
      </header>
      <main className="flex-1 p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
        <section className="py-20 text-center flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
            Welcome to Your Store
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10">
            A beautiful, fast, and modern e-commerce template built with Next.js, tailwindcss, and Convex.
          </p>
          <Link href="/products" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
            Shop Now
          </Link>
        </section>
      </main>
      <footer className="p-6 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 text-sm">
        &copy; {new Date().getFullYear()} eCommerce Template. Built with Convex + Next.js.
      </footer>
    </div>
  );
}

function AuthButtons() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  if (isLoading) {
    return <div className="w-20 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md" />;
  }

  return (
    <>
      {isAuthenticated ? (
        <button
          className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          onClick={() => void signOut().then(() => router.push("/"))}
        >
          Sign out
        </button>
      ) : (
        <Link
          href="/signin"
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          Sign In
        </Link>
      )}
    </>
  );
}
