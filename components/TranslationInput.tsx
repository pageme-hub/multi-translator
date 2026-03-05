"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface TranslationInputProps {
  value: string;
  onChange: (value: string) => void;
  onTranslate: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export default function TranslationInput({
  value,
  onChange,
  onTranslate,
  onClear,
  isLoading,
}: TranslationInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onTranslate();
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="번역할 텍스트를 입력하세요... (Ctrl+Enter로 번역)"
        className="min-h-[180px] resize-y text-base"
        maxLength={3000}
        disabled={isLoading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{value.length} / 3000</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onClear}
            disabled={isLoading || (!value.trim())}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            지우기
          </Button>
          <Button
            onClick={onTranslate}
            disabled={isLoading || !value.trim()}
            className="min-w-[100px]"
          >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              번역 중...
            </>
          ) : (
            "번역하기"
          )}
        </Button>
        </div>
      </div>
    </div>
  );
}
