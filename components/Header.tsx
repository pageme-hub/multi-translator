"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  userId: string | null;
}

export default function Header({ userId }: HeaderProps) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("user_id");
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
            <path d="M12 2c-2.5 3-4 6.5-4 10s1.5 7 4 10" />
            <path d="M12 2c2.5 3 4 6.5 4 10s-1.5 7-4 10" />
          </svg>
          <span className="text-lg font-bold">다국어 번역기</span>
        </div>
        <div className="flex items-center gap-3">
          {userId ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {userId}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => router.push("/login")}>
              로그인
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
