import { TetrominoType } from "@/types/tetris";

export const BOARD_ROWS = 20;
export const BOARD_COLS = 10;

/** 각 테트로미노의 기본 회전 상태(0번 인덱스) 모양 정의 */
export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

/** 레벨업 기준: 몇 줄 지울 때마다 레벨이 오르는지 */
export const LINES_PER_LEVEL = 10;

/** 키보드 키코드 매핑 (조작 방식: 키보드 전용) */
export const KEYBOARD_CONTROLS = {
  ArrowLeft: "MOVE_LEFT",
  ArrowRight: "MOVE_RIGHT",
  ArrowDown: "SOFT_DROP",
  ArrowUp: "ROTATE",
  Space: "HARD_DROP",
} as const;

/** 자동 낙하(중력) 간격 (ms) - 레벨 무관 고정 속도로 결정됨 */
export const GRAVITY_INTERVAL_MS = 1000;