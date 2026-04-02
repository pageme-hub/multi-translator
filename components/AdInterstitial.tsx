"use client";

import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const STORAGE_KEY = "last_interstitial_date";

export default function AdInterstitial() {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem(STORAGE_KEY);

    if (lastDate === today) return;

    localStorage.setItem(STORAGE_KEY, today);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not ready
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-xl bg-card p-6 shadow-2xl mx-4">
        <p className="text-center text-sm text-muted-foreground">
          해당 광고는 AI서비스 운영비에 사용됩니다. 잠시만 기다려주세요
        </p>

        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: 250 }}
          data-ad-client="ca-pub-7134217679059595"
          data-ad-slot=""
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        <button
          onClick={() => setVisible(false)}
          disabled={countdown > 0}
          className="mt-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {countdown > 0 ? `닫기 (${countdown}s)` : "닫기"}
        </button>
      </div>
    </div>
  );
}
