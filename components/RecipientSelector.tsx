"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { COUNTRIES, ROLE_OPTIONS, GENDER_OPTIONS } from "@/constants/countries";

interface RecipientSelectorProps {
  country: string;
  gender: string;
  role: string;
  onCountryChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export default function RecipientSelector({
  country,
  gender,
  role,
  onCountryChange,
  onGenderChange,
  onRoleChange,
}: RecipientSelectorProps) {
  const showGender = role !== "pastor";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
      {/* 대상자 국가 */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
        <Label htmlFor="country-select" className="text-sm font-medium">
          대상자 국가
        </Label>
        <Select value={country} onValueChange={onCountryChange}>
          <SelectTrigger id="country-select">
            <SelectValue placeholder="국가 선택" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}{c.englishName ? ` (${c.englishName})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 직책 */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
        <Label htmlFor="role-select" className="text-sm font-medium">
          직책
        </Label>
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger id="role-select">
            <SelectValue placeholder="직책 선택" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 성별 - 목회자 선택 시 숨김 */}
      {showGender && (
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
          <Label htmlFor="gender-select" className="text-sm font-medium">
            성별
          </Label>
          <Select value={gender} onValueChange={onGenderChange}>
            <SelectTrigger id="gender-select">
              <SelectValue placeholder="성별 선택" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
