import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { SaveSettingsRequest } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ error: "user_id가 필요합니다." }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: account, error: accountError } = await supabase
      .from("multi_translator_account")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: "등록되지 않은 아이디입니다." }, { status: 404 });
    }

    const { data: settings } = await supabase
      .from("multi_translator_account_settings")
      .select("recipient_country, recipient_gender, recipient_role, output_langs")
      .eq("account_id", account.id)
      .single();

    return NextResponse.json({
      recipient_country: settings?.recipient_country ?? null,
      recipient_gender: settings?.recipient_gender ?? null,
      recipient_role: settings?.recipient_role ?? null,
      output_langs: settings?.output_langs ?? null,
    });
  } catch (error) {
    console.error("[settings GET] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveSettingsRequest = await request.json();
    const { user_id, recipient_country, recipient_gender, recipient_role, output_langs } = body;

    if (!user_id) {
      return NextResponse.json({ error: "user_id가 필요합니다." }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: account, error: accountError } = await supabase
      .from("multi_translator_account")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: "등록되지 않은 아이디입니다." }, { status: 404 });
    }

    const { error } = await supabase
      .from("multi_translator_account_settings")
      .upsert(
        {
          account_id: account.id,
          recipient_country,
          recipient_gender,
          recipient_role,
          output_langs,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "account_id" }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[settings POST] error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
