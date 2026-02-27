import { Country } from "@/types";

export const COUNTRIES: Country[] = [
  { code: "INTL", name: "미선택", englishName: "" },
  { code: "KR", name: "한국", englishName: "South Korea" },
  { code: "JP", name: "일본", englishName: "Japan" },
  { code: "CN", name: "중국", englishName: "China" },
  { code: "IN", name: "인도", englishName: "India" },
  { code: "CA", name: "캐나다", englishName: "Canada" },
  { code: "MY", name: "말레이시아", englishName: "Malaysia" },
];

export const COUNTRY_MAP: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c])
);

export const GENDER_OPTIONS = [
  { value: "male", label: "남성 (Brother)" },
  { value: "female", label: "여성 (Sister)" },
  { value: "unspecified", label: "미선택" },
];

export const DEFAULT_RECIPIENT_COUNTRY = "INTL";
export const DEFAULT_RECIPIENT_GENDER = "unspecified";
