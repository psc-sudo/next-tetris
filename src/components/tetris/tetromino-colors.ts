import { TetrominoType } from "@/types/tetris";

/** 테트로미노 타입별 Tailwind 배경색 클래스 매핑 (UI 전용 상수) */
export const TETROMINO_COLOR_MAP: Record<TetrominoType, string> = {
  I: "bg-cyan-400",
  O: "bg-yellow-400",
  T: "bg-purple-500",
  S: "bg-green-500",
  Z: "bg-red-500",
  J: "bg-blue-500",
  L: "bg-orange-500",
};