import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버 환경 전용 Supabase 클라이언트 생성 함수
 * Route Handler, Server Component에서만 호출해야 함
 * Next.js 15 기준 cookies()는 비동기이므로 async 처리
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[Supabase Server] 환경 변수가 설정되지 않았습니다. .env.local을 확인하세요."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component에서 호출된 경우 set이 무시될 수 있음
          // 미들웨어에서 세션을 갱신하는 구조라면 문제 없음 (예외 처리 원칙 준수)
        }
      },
    },
  });
}