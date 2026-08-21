import { ApiResponse, ScoreInsertPayload, ScoreRecord } from "@/types/database";

const SCORES_ENDPOINT = "/api/scores";

/**
 * 게임 종료 후 점수를 서버에 제출한다.
 * 네트워크 오류, 서버 오류(4xx/5xx), 파싱 오류를 모두 방어적으로 처리하여
 * 항상 ApiResponse 형태로 결과를 반환한다 (예외를 밖으로 던지지 않음).
 */
export async function submitScore(
  payload: ScoreInsertPayload
): Promise<ApiResponse<ScoreRecord>> {
  try {
    const response = await fetch(SCORES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as ApiResponse<ScoreRecord>;

    if (!response.ok) {
      const fallbackMessage = "점수 저장에 실패했습니다. 잠시 후 다시 시도해주세요.";
      return {
        success: false,
        error: result.success === false ? result.error : fallbackMessage,
      };
    }

    return result;
  } catch (error) {
    console.error("[submitScore] 네트워크 오류:", error);
    return {
      success: false,
      error: "네트워크 연결을 확인해주세요.",
    };
  }
}

/**
 * 상위 랭킹 목록을 조회한다.
 * 네트워크 오류, 서버 오류, 파싱 오류를 모두 방어적으로 처리한다.
 */
export async function fetchTopScores(
  limit: number = 10
): Promise<ApiResponse<ScoreRecord[]>> {
  try {
    const response = await fetch(`${SCORES_ENDPOINT}?limit=${limit}`, {
      method: "GET",
      cache: "no-store",
    });

    const result = (await response.json()) as ApiResponse<ScoreRecord[]>;

    if (!response.ok) {
      const fallbackMessage = "랭킹을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
      return {
        success: false,
        error: result.success === false ? result.error : fallbackMessage,
      };
    }

    return result;
  } catch (error) {
    console.error("[fetchTopScores] 네트워크 오류:", error);
    return {
      success: false,
      error: "네트워크 연결을 확인해주세요.",
    };
  }
}