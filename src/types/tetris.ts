/** 보드의 한 셀 상태: 비어있거나(null), 블록 색상 키를 가짐 */
export type CellValue = TetrominoType | null;

/** 테트로미노 7종류 */
export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

/** 보드 좌표 (행, 열) */
export interface Position {
  row: number;
  col: number;
}

/** 회전 상태를 포함한 현재 조작 중인 블록 */
export interface ActivePiece {
  type: TetrominoType;
  shape: number[][];
  position: Position;
  rotationIndex: number;
}

/** 게임 전체 상태 - useTetrisGame 훅이 관리 */
export interface TetrisGameState {
  board: CellValue[][];
  activePiece: ActivePiece | null;
  nextPiece: TetrominoType;
  score: number;
  level: number;
  linesCleared: number;
  status: GameStatus;
}

export type GameStatus = "idle" | "playing" | "paused" | "gameOver";

/** 키보드 입력으로 발생 가능한 액션 (engine.ts의 순수 함수 입력값) */
export type GameAction =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "SOFT_DROP" }
  | { type: "HARD_DROP" }
  | { type: "ROTATE" }
  | { type: "TICK" }        // 추가: 중력에 의한 자동 낙하 (점수 없음)
  | { type: "RESTART" };    // 추가: 게임 오버 후 재시작