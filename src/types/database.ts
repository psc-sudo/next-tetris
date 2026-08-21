/**
 * Supabase 'scores' 테이블과 1:1 매핑되는 타입
 * DB 스키마 변경 시 이 파일도 함께 수정해야 함
 */
export interface ScoreRecord {
  id: string;
  nickname: string;
  score: number;
  linesCleared: number;
  level: number;
  userId: string | null;
  createdAt: string;
}

/**
 * INSERT 시 클라이언트가 보내는 payload 타입
 * id, createdAt은 DB에서 자동 생성되므로 제외
 */
export interface ScoreInsertPayload {
  nickname: string;
  score: number;
  linesCleared: number;
  level: number;
}

/**
 * API 응답 표준 포맷 (성공/실패 모두 이 형태로 통일)
 * 예외 처리 원칙에 따라 모든 API는 이 타입을 반환
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };