import { readFile } from "fs/promises";
import path from "path";

interface SystemPromptParams {
  targetCountry: string;
  recipientGender: string;
  recipientRole: string;
}

export interface TranslatePromptParams {
  inputLangName: string;
  inputLangEnglishName: string;
  outputLangNames: string;
  outputLangEnglishNames: string[];
  text: string;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

async function readPromptFile(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), "prompts", filename);
  return readFile(filePath, "utf-8");
}

function buildRecipientNote(role: string, gender: string): string {
  if (role === "pastor") {
    return '수신자는 목회자(목사님)입니다. 영어로는 "Pastor", 한국어로는 "목사님"으로 호칭하세요.';
  }
  // 성도 또는 미선택
  if (gender === "male") {
    return '수신자는 성도(남성)입니다. 영어로는 "Brother"를 기본 호칭으로 사용하세요.';
  }
  if (gender === "female") {
    return '수신자는 성도(여성)입니다. 영어로는 "Sister"를 기본 호칭으로 사용하세요.';
  }
  return "수신자 정보가 없으므로 성별·직책 특정 호칭 없이 중립적이고 존중하는 어조를 유지하세요.";
}

export async function buildSystemPrompt({ targetCountry, recipientGender, recipientRole }: SystemPromptParams): Promise<string> {
  const recipientNote = buildRecipientNote(recipientRole, recipientGender);
  const template = await readPromptFile("system.txt");
  return fill(template, { targetCountry, recipientNote });
}

export async function buildTranslatePrompt({
  inputLangName,
  inputLangEnglishName,
  outputLangNames,
  outputLangEnglishNames,
  text,
}: TranslatePromptParams): Promise<string> {
  const tagList = outputLangEnglishNames.map((n) => `[${n}]`).join(", ");
  const exampleOutput = outputLangEnglishNames
    .map((n) => `[${n}]\n(번역된 ${n} 텍스트)`)
    .join("\n\n");

  const template = await readPromptFile("translate.txt");
  return fill(template, {
    inputLangName,
    inputLangEnglishName,
    outputLangNames,
    tagList,
    exampleOutput,
    text,
  });
}
