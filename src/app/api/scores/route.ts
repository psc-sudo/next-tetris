import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapDbRowToScoreRecord } from "@/lib/supabase/mappers";
import { ApiResponse, ScoreInsertPayload, ScoreRecord } from "@/types/database";

const MAX_NICKNAME_LENGTH = 12;
const MIN_NICKNAME_LENGTH = 1;

/**
 * 점수 데이터의 기초적인 이상치를 검증하는 함수
 * 완벽한 부정행위 방지는 아니지만, 명백히 조작된 값은 걸러냄
 */
function validateScorePayload(payload: unknown): payload is ScoreInsertPayload {
  if (typeof payload !== "object" || payload === null) return false;

  const p = payload as Record<string, unknown>;

  if (
    typeof p.nickname !== "string" ||
    p.nickname.trim().length < MIN_NICKNAME_LENGTH ||
    p.nickname.trim().length > MAX_NICKNAME_LENGTH
  ) {
    return false;
  }

  if (typeof p.score !== "number" || p.score < 0 || !Number.isInteger(p.score)) {
    return false;
  }

  if (
    typeof p.linesCleared !== "number" ||
    p.linesCleared < 0 ||
    !Number.isInteger(p.linesCleared)
  ) {
    return false;
  }

  if (typeof p.level !== "number" || p.level < 1 || !Number.isInteger(p.level)) {
    return false;
  }

  // 라인당 최대 점수를 과도하게 초과하는 경우 이상치로 간주 (테트리스 기준 라인당 최대 약 1200점대)
  const MAX_SCORE_PER_LINE = 1500;
  if (p.linesCleared > 0 && p.score / p.linesCleared > MAX_SCORE_PER_LINE) {
    return false;
  }
  // 라인을 하나도 못 지웠는데 점수가 비정상적으로 높은 경우 (소프트드롭만으로 가능한 상한 여유있게 설정)
  if (p.linesCleared === 0 && p.score > 5000) {
    return false;
  }

  return true;
}

/**
 * POST /api/scores
 * 게임 종료 시 점수를 기록
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ScoreRecord>>> {
  try {
    const body = await request.json();

    if (!validateScorePayload(body)) {
      return NextResponse.json(
        { success: false, error: "유효하지 않은 점수 데이터입니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scores")
      .insert({
        nickname: body.nickname.trim(),
        score: body.score,
        lines_cleared: body.linesCleared,
        level: body.level,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/scores] Supabase insert error:", error.message);
      return NextResponse.json(
        { success: false, error: "점수 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: mapDbRowToScoreRecord(data) },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/scores] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "요청 처리 중 알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scores?limit=10
 * 상위 랭킹 조회 (통계 화면용)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ScoreRecord[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");

    // limit 파라미터 방어적 파싱: 잘못된 값이 와도 기본값 10으로 안전하게 처리
    const parsedLimit = Number(limitParam);
    const limit =
      Number.isInteger(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100
        ? parsedLimit
        : 10;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("score", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[GET /api/scores] Supabase select error:", error.message);
      return NextResponse.json(
        { success: false, error: "랭킹 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data.map(mapDbRowToScoreRecord) },
      { status: 200 }
    );
  } catch (err) {
    console.error("[GET /api/scores] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "요청 처리 중 알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}