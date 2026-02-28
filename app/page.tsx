"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import RecipientSelector from "@/components/RecipientSelector";
import LanguageSelector from "@/components/LanguageSelector";
import TranslationInput from "@/components/TranslationInput";
import TranslationResultCard from "@/components/TranslationResultCard";
import CopyAllButton from "@/components/CopyAllButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ParsedTranslation } from "@/types";
import { DEFAULT_INPUT_LANG, DEFAULT_OUTPUT_LANGS } from "@/constants/languages";
import { DEFAULT_RECIPIENT_COUNTRY, DEFAULT_RECIPIENT_GENDER, DEFAULT_RECIPIENT_ROLE } from "@/constants/countries";
import { Save, Settings } from "lucide-react";

/** 스트리밍 중 완성된 [Tag]\n...\n 구간만 파싱 */
function parseTranslationPartial(raw: string): ParsedTranslation {
  const result: ParsedTranslation = {};
  const regex = /\[([\w\s\-]+)\]\s*\n([\s\S]*?)(?=\n\[[\w\s\-]+\])/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const langName = match[1].trim();
    const text = match[2].trim();
    if (langName && text) result[langName] = text;
  }
  return result;
}

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [inputLang, setInputLang] = useState(DEFAULT_INPUT_LANG);
  const [outputLangs, setOutputLangs] = useState<string[]>(DEFAULT_OUTPUT_LANGS);
  const [recipientCountry, setRecipientCountry] = useState(DEFAULT_RECIPIENT_COUNTRY);
  const [recipientGender, setRecipientGender] = useState(DEFAULT_RECIPIENT_GENDER);
  const [recipientRole, setRecipientRole] = useState(DEFAULT_RECIPIENT_ROLE);
  const [parsed, setParsed] = useState<ParsedTranslation | null>(null);
  const [streamingRaw, setStreamingRaw] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("user_id");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUserId(stored);
  }, [router]);

  const loadSettings = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/settings?user_id=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.recipient_country) setRecipientCountry(data.recipient_country);
        if (data.recipient_gender) setRecipientGender(data.recipient_gender);
        if (data.recipient_role) setRecipientRole(data.recipient_role);
        if (data.output_langs && data.output_langs.length > 0) setOutputLangs(data.output_langs);
      }
    } catch {
      // 설정 로드 실패는 조용히 무시 (기본값 유지)
    } finally {
      setSettingsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadSettings(userId);
    }
  }, [userId, loadSettings]);

  async function handleSaveSettings() {
    if (!userId) return;

    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          recipient_country: recipientCountry,
          recipient_gender: recipientGender,
          recipient_role: recipientRole,
          output_langs: outputLangs,
        }),
      });

      if (res.ok) {
        toast({ description: "설정이 저장되었습니다." });
      } else {
        toast({ description: "설정 저장에 실패했습니다.", variant: "destructive" });
      }
    } catch {
      toast({ description: "네트워크 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleTranslate() {
    if (!userId) {
      router.push("/login");
      return;
    }

    if (!inputText.trim()) return;

    setIsTranslating(true);
    setParsed(null);
    setStreamingRaw("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          text: inputText,
          input_lang: inputLang,
          output_langs: outputLangs,
          recipient_country: recipientCountry,
          recipient_gender: recipientGender,
          recipient_role: recipientRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ description: data.error ?? "번역에 실패했습니다.", variant: "destructive" });
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingRaw(accumulated);

        // 완성된 [Tag]\n...\n 구간이 생길 때마다 파싱해서 점진적으로 표시
        const partial = parseTranslationPartial(accumulated);
        if (Object.keys(partial).length > 0) {
          setParsed(partial);
        }
      }

      // 스트림 완료 후 최종 파싱
      const { parseTranslation } = await import("@/lib/parseTranslation");
      const final = parseTranslation(accumulated);
      if (Object.keys(final).length > 0) {
        setParsed(final);
      }
    } catch {
      toast({ description: "네트워크 오류가 발생했습니다.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
      setStreamingRaw("");
    }
  }

  if (!userId) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header userId={userId} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {/* 설정 패널 */}
        <section className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              번역 설정
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <RecipientSelector
              country={recipientCountry}
              gender={recipientGender}
              role={recipientRole}
              onCountryChange={setRecipientCountry}
              onGenderChange={setRecipientGender}
              onRoleChange={setRecipientRole}
            />
            <LanguageSelector
              inputLang={inputLang}
              outputLangs={outputLangs}
              onInputLangChange={setInputLang}
              onOutputLangsChange={setOutputLangs}
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveSettings}
                disabled={isSavingSettings || !settingsLoaded}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSavingSettings ? "저장 중..." : "설정 저장"}
              </Button>
            </div>
          </div>
        </section>

        {/* 번역 레이아웃: 모바일 - 단일 컬럼 / PC - 2컬럼 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 입력 */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              원문 입력
            </h2>
            <TranslationInput
              value={inputText}
              onChange={setInputText}
              onTranslate={handleTranslate}
              isLoading={isTranslating}
            />
          </section>

          {/* 결과 */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                번역 결과
              </h2>
              {parsed && Object.keys(parsed).length > 0 && (
                <CopyAllButton parsed={parsed} />
              )}
            </div>

            {parsed && Object.keys(parsed).length > 0 ? (
              <div className="flex flex-col gap-3">
                {Object.entries(parsed).map(([langName, text]) => (
                  <TranslationResultCard key={langName} langName={langName} text={text} />
                ))}
                {isTranslating && (
                  <p className="text-xs text-muted-foreground animate-pulse px-1">번역 중...</p>
                )}
              </div>
            ) : (
              <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                {isTranslating && streamingRaw ? (
                  <span className="animate-pulse">번역 중...</span>
                ) : isTranslating ? (
                  <span className="animate-pulse">Gemini에 요청 중...</span>
                ) : (
                  "번역 결과가 여기에 표시됩니다."
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="mt-auto border-t border-border bg-background/80 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 flex-wrap">
          <span className="text-sm text-muted-foreground">불편사항, 기능 제안 등은 여기로 :</span>
          <a
            href="https://t.me/ehddbftmdfl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            문의하기
          </a>
        </div>
      </footer>
    </div>
  );
}
