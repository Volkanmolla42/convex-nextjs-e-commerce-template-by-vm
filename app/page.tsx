"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-border flex justify-between items-center shadow-sm">
        <Link href="/" className="font-bold text-xl text-foreground">
          eCommerce Template
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Products
          </Link>
          <AuthButtons />
        </div>
      </header>
      <main className="flex-1 p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
        <section className="py-20 text-center flex flex-col items-center justify-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Welcome to Your Store
          </h1>
          <Link
            href="/products"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Shop Now
          </Link>
        </section>
      </main>
      <footer className="p-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-muted-foreground text-sm text-center sm:text-left">
          &copy; {new Date().getFullYear()} eCommerce Template. Built with Convex + Next.js.
        </p>
        <ThemeToggle />
      </footer>
    </div>
  );
}

function AuthButtons() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  if (isLoading) {
    return <div className="w-20 h-8 bg-muted animate-pulse rounded-md" />;
  }

  return (
    <>
      {isAuthenticated ? (
        <button
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
          onClick={() => void signOut().then(() => router.push("/"))}
        >
          Sign out
        </button>
      ) : (
        <Link
          href="/signin"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      )}
    </>
  );
}
