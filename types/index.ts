export interface Language {
  code: string;
  name: string;
  englishName: string;
}

export interface Country {
  code: string;
  name: string;
  englishName: string;
}

export interface AccountSettings {
  recipient_country: string | null;
  recipient_gender: string | null;
  recipient_role: string | null;
  output_langs: string[] | null;
}

export interface ParsedTranslation {
  [langName: string]: string;
}

export interface TranslateRequest {
  user_id: string;
  text: string;
  input_lang: string;
  output_langs: string[];
  recipient_country: string;
  recipient_gender: string;
  recipient_role: string;
}

export interface TranslateResponse {
  parsed: ParsedTranslation;
  raw: string;
}

export interface RegisterRequest {
  user_id: string;
}

export interface LoginRequest {
  user_id: string;
}

export interface SaveSettingsRequest {
  user_id: string;
  recipient_country: string;
  recipient_gender: string;
  recipient_role: string;
  output_langs: string[];
}

export type GenderOption = {
  value: string;
  label: string;
};
