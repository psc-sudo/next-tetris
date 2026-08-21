import {
  ActivePiece,
  CellValue,
  GameAction,
  Position,
  TetrisGameState,
  TetrominoType,
} from "@/types/tetris";
import { BOARD_COLS, BOARD_ROWS, LINES_PER_LEVEL, TETROMINO_SHAPES } from "./constants";

const ALL_TETROMINO_TYPES: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

/** 빈 게임 보드 생성 (모든 셀 null) */
export function createEmptyBoard(): CellValue[][] {
  return Array.from({ length: BOARD_ROWS }, () =>
    Array<CellValue>(BOARD_COLS).fill(null)
  );
}

/** 7종류 중 무작위 테트로미노 타입 반환 */
export function getRandomTetrominoType(): TetrominoType {
  const index = Math.floor(Math.random() * ALL_TETROMINO_TYPES.length);
  return ALL_TETROMINO_TYPES[index];
}

/** 특정 타입의 활성 블록을 보드 상단 중앙에 생성 */
export function createActivePiece(type: TetrominoType): ActivePiece {
  const shape = TETROMINO_SHAPES[type];
  const width = shape[0].length;
  const startCol = Math.floor((BOARD_COLS - width) / 2);

  return {
    type,
    shape,
    position: { row: 0, col: startCol },
    rotationIndex: 0,
  };
}

/** 2차원 배열을 시계방향으로 90도 회전 */
function rotateMatrixClockwise(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () =>
    Array<number>(rows).fill(0)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }

  return rotated;
}

/** 주어진 모양/위치가 보드 경계 및 다른 블록과 충돌하지 않는지 검사 */
export function isValidPosition(
  board: CellValue[][],
  shape: number[][],
  position: Position
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 0) continue;

      const boardRow = position.row + r;
      const boardCol = position.col + c;

      // 좌우 경계 및 바닥 경계 검사
      if (boardCol < 0 || boardCol >= BOARD_COLS) return false;
      if (boardRow >= BOARD_ROWS) return false;

      // 보드 상단 밖(스폰 초기)은 통과, 그 외에는 다른 블록과의 충돌 검사
      if (boardRow >= 0 && board[boardRow][boardCol] !== null) return false;
    }
  }
  return true;
}

/** 이동을 시도하고, 유효하면 새 ActivePiece를, 아니면 null을 반환 (순수 함수) */
export function tryMove(
  board: CellValue[][],
  piece: ActivePiece,
  deltaRow: number,
  deltaCol: number
): ActivePiece | null {
  const newPosition: Position = {
    row: piece.position.row + deltaRow,
    col: piece.position.col + deltaCol,
  };

  if (isValidPosition(board, piece.shape, newPosition)) {
    return { ...piece, position: newPosition };
  }
  return null;
}

/** 회전을 시도하고, 유효하면 새 ActivePiece를, 아니면 null을 반환 (벽차기 미적용) */
export function tryRotate(
  board: CellValue[][],
  piece: ActivePiece
): ActivePiece | null {
  // O 블록은 회전해도 모양이 동일하므로 그대로 반환
  if (piece.type === "O") return piece;

  const rotatedShape = rotateMatrixClockwise(piece.shape);

  if (isValidPosition(board, rotatedShape, piece.position)) {
    return {
      ...piece,
      shape: rotatedShape,
      rotationIndex: (piece.rotationIndex + 1) % 4,
    };
  }
  return null;
}

/** 더 이상 내려갈 수 없을 때까지 반복 이동시켜 하드 드롭 결과와 이동 거리를 반환 */
export function hardDropPiece(
  board: CellValue[][],
  piece: ActivePiece
): { piece: ActivePiece; dropDistance: number } {
  let current = piece;
  let dropDistance = 0;

  while (true) {
    const next = tryMove(board, current, 1, 0);
    if (!next) break;
    current = next;
    dropDistance++;
  }

  return { piece: current, dropDistance };
}

/** 활성 블록을 보드에 고정(병합)하여 새 보드를 반환 (불변성 유지) */
export function mergePieceToBoard(
  board: CellValue[][],
  piece: ActivePiece
): CellValue[][] {
  const newBoard = board.map((row) => [...row]);

  piece.shape.forEach((rowValues, r) => {
    rowValues.forEach((cell, c) => {
      if (cell !== 0) {
        const boardRow = piece.position.row + r;
        const boardCol = piece.position.col + c;
        if (boardRow >= 0 && boardRow < BOARD_ROWS) {
          newBoard[boardRow][boardCol] = piece.type;
        }
      }
    });
  });

  return newBoard;
}

/** 가득 찬 줄을 제거하고, 위에 빈 줄을 채워 반환. 제거된 줄 수도 함께 반환 */
export function clearCompletedLines(board: CellValue[][]): {
  board: CellValue[][];
  linesCleared: number;
} {
  const remainingRows = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = BOARD_ROWS - remainingRows.length;

  const emptyRowsToPrepend: CellValue[][] = Array.from(
    { length: linesCleared },
    () => Array<CellValue>(BOARD_COLS).fill(null)
  );

  return {
    board: [...emptyRowsToPrepend, ...remainingRows],
    linesCleared,
  };
}

/** 표준 가이드라인 기준 라인 클리어 점수 계산 */
export function calculateLineClearScore(linesCleared: number, level: number): number {
  switch (linesCleared) {
    case 1:
      return 100 * level;
    case 2:
      return 300 * level;
    case 3:
      return 500 * level;
    case 4:
      return 800 * level;
    default:
      return 0;
  }
}

/** 소프트 드롭 점수: 이동한 셀당 1점 */
export function calculateSoftDropScore(cellsMoved: number): number {
  return cellsMoved * 1;
}

/** 하드 드롭 점수: 이동한 셀당 2점 */
export function calculateHardDropScore(cellsMoved: number): number {
  return cellsMoved * 2;
}

/** 누적 클리어 라인 수 기준 레벨 계산 (10줄당 1레벨업, 1레벨부터 시작) */
export function calculateLevel(totalLinesCleared: number): number {
  return Math.floor(totalLinesCleared / LINES_PER_LEVEL) + 1;
}

/** 초기 게임 상태 생성 */
export function createInitialGameState(): TetrisGameState {
  const firstPieceType = getRandomTetrominoType();
  const nextPieceType = getRandomTetrominoType();

  return {
    board: createEmptyBoard(),
    activePiece: createActivePiece(firstPieceType),
    nextPiece: nextPieceType,
    score: 0,
    level: 1,
    linesCleared: 0,
    status: "playing",
  };
}

/**
 * 활성 블록을 보드에 고정하고, 라인 클리어 처리 후 다음 블록을 스폰한다.
 * 새 블록 스폰이 불가능하면 게임 오버 처리.
 */
function lockPieceAndSpawnNext(
  state: TetrisGameState,
  pieceToLock: ActivePiece
): TetrisGameState {
  const mergedBoard = mergePieceToBoard(state.board, pieceToLock);
  const { board: clearedBoard, linesCleared } = clearCompletedLines(mergedBoard);

  const newTotalLinesCleared = state.linesCleared + linesCleared;
  const newLevel = calculateLevel(newTotalLinesCleared);
  const lineClearScore = calculateLineClearScore(linesCleared, state.level);

  const newActivePiece = createActivePiece(state.nextPiece);
  const newNextPieceType = getRandomTetrominoType();

  // 새 블록이 스폰 위치에 놓일 수 없으면 게임 오버 (보드가 꽉 찬 상태)
  const canSpawn = isValidPosition(
    clearedBoard,
    newActivePiece.shape,
    newActivePiece.position
  );

  return {
    board: clearedBoard,
    activePiece: canSpawn ? newActivePiece : null,
    nextPiece: newNextPieceType,
    score: state.score + lineClearScore,
    level: newLevel,
    linesCleared: newTotalLinesCleared,
    status: canSpawn ? "playing" : "gameOver",
  };
}

/**
 * 게임의 메인 리듀서 함수. 현재 상태와 액션을 받아 다음 상태를 반환한다.
 * 순수 함수이므로 동일 입력에는 항상 동일 출력을 보장 (테스트 용이)
 */
export function applyGameAction(
  state: TetrisGameState,
  action: GameAction
): TetrisGameState {
  // RESTART는 게임 오버 상태에서도 동작해야 하므로 최우선으로 처리
  if (action.type === "RESTART") {
    return createInitialGameState();
  }

  // 게임 진행 중이 아니거나 활성 블록이 없으면 액션 무시 (방어적 처리)
  if (state.status !== "playing" || state.activePiece === null) {
    return state;
  }

  switch (action.type) {
    case "MOVE_LEFT": {
      const moved = tryMove(state.board, state.activePiece, 0, -1);
      return moved ? { ...state, activePiece: moved } : state;
    }

    case "MOVE_RIGHT": {
      const moved = tryMove(state.board, state.activePiece, 0, 1);
      return moved ? { ...state, activePiece: moved } : state;
    }

    case "ROTATE": {
      const rotated = tryRotate(state.board, state.activePiece);
      return rotated ? { ...state, activePiece: rotated } : state;
    }

    case "SOFT_DROP": {
      const moved = tryMove(state.board, state.activePiece, 1, 0);
      if (moved) {
        return {
          ...state,
          activePiece: moved,
          score: state.score + calculateSoftDropScore(1),
        };
      }
      // 더 내려갈 수 없으면 고정 처리
      return lockPieceAndSpawnNext(state, state.activePiece);
    }

    case "HARD_DROP": {
      const { piece: droppedPiece, dropDistance } = hardDropPiece(
        state.board,
        state.activePiece
      );
      const stateWithDropScore: TetrisGameState = {
        ...state,
        score: state.score + calculateHardDropScore(dropDistance),
      };
      return lockPieceAndSpawnNext(stateWithDropScore, droppedPiece);
    }

    case "TICK": {
      // 중력에 의한 자동 낙하: 점수 미부여
      const moved = tryMove(state.board, state.activePiece, 1, 0);
      if (moved) {
        return { ...state, activePiece: moved };
      }
      return lockPieceAndSpawnNext(state, state.activePiece);
    }

    default: {
      // 방어적 처리: 정의되지 않은 액션 타입이 들어와도 상태를 그대로 유지
      return state;
    }
  }
}