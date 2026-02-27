"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/constants/languages";

interface LanguageSelectorProps {
  inputLang: string;
  outputLangs: string[];
  onInputLangChange: (value: string) => void;
  onOutputLangsChange: (value: string[]) => void;
}

export default function LanguageSelector({
  inputLang,
  outputLangs,
  onInputLangChange,
  onOutputLangsChange,
}: LanguageSelectorProps) {
  function toggleOutputLang(code: string) {
    if (outputLangs.includes(code)) {
      if (outputLangs.length > 1) {
        onOutputLangsChange(outputLangs.filter((l) => l !== code));
      }
    } else {
      onOutputLangsChange([...outputLangs, code]);
    }
  }

  const availableOutputLangs = LANGUAGES.filter((l) => l.code !== inputLang);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="input-lang-select" className="text-sm font-medium">
          원문 언어
        </Label>
        <Select
          value={inputLang}
          onValueChange={(newInputLang) => {
            onInputLangChange(newInputLang);
            // 새 입력 언어가 출력 언어 목록에 있으면 제거
            if (outputLangs.includes(newInputLang)) {
              const filtered = outputLangs.filter((l) => l !== newInputLang);
              // 출력 언어가 0개가 되면 기존 입력 언어로 대체
              onOutputLangsChange(filtered.length > 0 ? filtered : [inputLang]);
            }
          }}
        >
          <SelectTrigger id="input-lang-select" className="w-full sm:w-48">
            <SelectValue placeholder="언어 선택" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium">번역 언어 (다중 선택)</Label>
        <div className="flex flex-wrap gap-2">
          {availableOutputLangs.map((l) => {
            const isSelected = outputLangs.includes(l.code);
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => toggleOutputLang(l.code)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {l.name}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
