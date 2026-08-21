import { ScoreRecord } from "@/types/database";

/** DB row(snake_case) → 프론트 타입(camelCase) 변환 */
export function mapDbRowToScoreRecord(row: {
  id: string;
  nickname: string;
  score: number;
  lines_cleared: number;
  level: number;
  user_id: string | null;
  created_at: string;
}): ScoreRecord {
  return {
    id: row.id,
    nickname: row.nickname,
    score: row.score,
    linesCleared: row.lines_cleared,
    level: row.level,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}