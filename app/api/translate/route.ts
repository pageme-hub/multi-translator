import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { buildSystemPrompt, buildTranslatePrompt } from "@/lib/prompts";
import { generateTranslationStream } from "@/lib/gemini";
import { parseTranslation } from "@/lib/parseTranslation";
import { TranslateRequest } from "@/types";
import { LANGUAGE_MAP, LANGUAGES } from "@/constants/languages";
import { COUNTRY_MAP, COUNTRIES } from "@/constants/countries";

export async function POST(request: NextRequest) {
  const body: TranslateRequest = await request.json();
  const { user_id, text, input_lang, output_langs, recipient_country, recipient_gender, recipient_role } = body;

  if (!text || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: "번역할 텍스트를 입력해주세요." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (text.length > 3000) {
    return new Response(JSON.stringify({ error: "텍스트는 3000자 이하여야 합니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validLangCodes = LANGUAGES.map((l) => l.code);
  if (!input_lang || !validLangCodes.includes(input_lang)) {
    return new Response(JSON.stringify({ error: "유효하지 않은 입력 언어입니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!output_langs || output_langs.length === 0) {
    return new Response(JSON.stringify({ error: "출력 언어를 1개 이상 선택해주세요." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const invalidOutputLangs = output_langs.filter((l) => !validLangCodes.includes(l));
  if (invalidOutputLangs.length > 0) {
    return new Response(JSON.stringify({ error: "유효하지 않은 출력 언어가 포함되어 있습니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validCountryCodes = COUNTRIES.map((c) => c.code);
  if (recipient_country && !validCountryCodes.includes(recipient_country)) {
    return new Response(JSON.stringify({ error: "유효하지 않은 국가입니다." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createServerClient();

  const { data: account, error: accountError } = await supabase
    .from("multi_translator_account")
    .select("id")
    .eq("user_id", user_id)
    .single();

  if (accountError || !account) {
    return new Response(JSON.stringify({ error: "등록되지 않은 아이디입니다." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const targetCountry = COUNTRY_MAP[recipient_country]?.englishName ?? recipient_country ?? "India";
  const inputLangName = LANGUAGE_MAP[input_lang]?.name ?? input_lang;
  const inputLangEnglishName = LANGUAGE_MAP[input_lang]?.englishName ?? input_lang;
  const outputLangNames = output_langs.map((code) => LANGUAGE_MAP[code]?.name ?? code).join(", ");
  const outputLangEnglishNames = output_langs.map((code) => LANGUAGE_MAP[code]?.englishName ?? code);

  const [systemInstruction, userPrompt] = await Promise.all([
    buildSystemPrompt({
      targetCountry,
      recipientGender: recipient_gender ?? "unspecified",
      recipientRole: recipient_role ?? "unspecified",
    }),
    buildTranslatePrompt({
      inputLangName,
      inputLangEnglishName,
      outputLangNames,
      outputLangEnglishNames,
      text: text.trim(),
    }),
  ]);

  try {
    const geminiStream = await generateTranslationStream(systemInstruction, userPrompt);
    const encoder = new TextEncoder();
    let fullText = "";

    const stream = new ReadableStream({
      async start(controller) {
        const reader = geminiStream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += value;
            controller.enqueue(encoder.encode(value));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        } finally {
          // 스트림 완료 후 DB 저장 (비동기, 응답에 영향 없음)
          try {
            const parsed = parseTranslation(fullText);
            await supabase.from("multi_translator_data").insert({
              account_id: account.id,
              input_text: text.trim(),
              gemini_raw_response: fullText,
              parsed_results: parsed,
              input_lang,
              output_langs,
              recipient_country: recipient_country ?? null,
              recipient_gender: recipient_gender ?? null,
            });
          } catch (dbErr) {
            console.error("[translate] DB save error:", dbErr);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[translate] gemini error:", error);
    return new Response(JSON.stringify({ error: "번역 중 오류가 발생했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
