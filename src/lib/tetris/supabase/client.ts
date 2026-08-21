import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저 환경 전용 Supabase 클라이언트 생성 함수
 * 클라이언트 컴포넌트("use client")에서만 호출해야 함
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[Supabase Client] 환경 변수가 설정되지 않았습니다. .env.local을 확인하세요."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}