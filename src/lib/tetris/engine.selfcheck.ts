import {
  applyGameAction,
  calculateLevel,
  calculateLineClearScore,
  clearCompletedLines,
  createActivePiece,
  createEmptyBoard,
  createInitialGameState,
  hardDropPiece,
  isValidPosition,
  mergePieceToBoard,
} from "./engine";
import { CellValue } from "@/types/tetris";
import { BOARD_COLS, BOARD_ROWS } from "./constants";

let passedCount = 0;
let failedCount = 0;

/** 간단한 자체 assert 헬퍼 (외부 테스트 프레임워크 없이 실행 가능) */
function check(description: string, condition: boolean): void {
  if (condition) {
    passedCount++;
    console.log(`✅ PASS: ${description}`);
  } else {
    failedCount++;
    console.error(`❌ FAIL: ${description}`);
  }
}

console.log("=== Tetris Engine 자체 검증 시작 ===\n");

// 1. 빈 보드 생성 검증
const emptyBoard = createEmptyBoard();
check("빈 보드 크기가 20x10인지", emptyBoard.length === BOARD_ROWS && emptyBoard[0].length === BOARD_COLS);
check("빈 보드의 모든 셀이 null인지", emptyBoard.every((row) => row.every((cell) => cell === null)));

// 2. 블록 생성 및 스폰 위치 검증
const iPiece = createActivePiece("I");
check("I 블록이 유효한 스폰 위치에 생성되는지", isValidPosition(emptyBoard, iPiece.shape, iPiece.position));

// 3. 충돌 판정 검증 (좌측 경계를 벗어나는 경우)
const outOfBoundsPosition = { row: 0, col: -1 };
check(
  "보드 좌측 경계를 벗어난 위치는 무효 처리되는지",
  isValidPosition(emptyBoard, iPiece.shape, outOfBoundsPosition) === false
);

// 4. 하드 드롭 검증: 빈 보드에서 I 블록(가로형)은 바닥까지 19칸 이동해야 함
const { dropDistance } = hardDropPiece(emptyBoard, iPiece);
check("빈 보드에서 하드 드롭 시 이동 거리가 19칸인지", dropDistance === 19);

// 5. 라인 클리어 점수 계산 검증 (표준 가이드라인 기준)
check("1줄 클리어 시 100 * level 점수인지", calculateLineClearScore(1, 1) === 100);
check("2줄 클리어 시 300 * level 점수인지", calculateLineClearScore(2, 1) === 300);
check("3줄 클리어 시 500 * level 점수인지", calculateLineClearScore(3, 1) === 500);
check("4줄(테트리스) 클리어 시 800 * level 점수인지", calculateLineClearScore(4, 1) === 800);
check("레벨 2에서 테트리스 클리어 시 1600점인지", calculateLineClearScore(4, 2) === 1600);

// 6. 레벨 계산 검증
check("0줄 클리어 시 레벨 1인지", calculateLevel(0) === 1);
check("10줄 클리어 시 레벨 2인지", calculateLevel(10) === 2);
check("25줄 클리어 시 레벨 3인지", calculateLevel(25) === 3);

// 7. 라인 클리어 로직 검증: 맨 아래 줄을 가득 채운 뒤 제거되는지 확인
const boardWithFullLine: CellValue[][] = createEmptyBoard();
boardWithFullLine[BOARD_ROWS - 1] = Array<CellValue>(BOARD_COLS).fill("T");
const { board: clearedBoard, linesCleared } = clearCompletedLines(boardWithFullLine);
check("가득 찬 1줄이 정상적으로 카운트되는지", linesCleared === 1);
check("클리어 후 맨 윗줄이 빈 줄로 채워지는지", clearedBoard[0].every((cell) => cell === null));

// 8. 블록 병합(고정) 검증
const mergedBoard = mergePieceToBoard(emptyBoard, iPiece);
const hasIPieceOnBoard = mergedBoard[0].some((cell) => cell === "I");
check("하드 드롭 없이 병합 시 보드에 I 블록이 기록되는지", hasIPieceOnBoard);

// 9. 리듀서(applyGameAction) 통합 검증: MOVE_RIGHT 액션
const initialState = createInitialGameState();
const initialCol = initialState.activePiece?.position.col ?? -1;
const stateAfterMoveRight = applyGameAction(initialState, { type: "MOVE_RIGHT" });
check(
  "MOVE_RIGHT 액션 후 활성 블록의 col이 1 증가하는지",
  stateAfterMoveRight.activePiece?.position.col === initialCol + 1
);

// 10. 게임 오버 방어 로직: status가 gameOver면 액션이 무시되는지
const gameOverState = { ...initialState, status: "gameOver" as const };
const stateAfterActionOnGameOver = applyGameAction(gameOverState, { type: "MOVE_LEFT" });
check(
  "게임 오버 상태에서는 액션이 무시되고 상태가 그대로인지",
  stateAfterActionOnGameOver === gameOverState
);

console.log(`\n=== 검증 완료: ${passedCount}개 통과 / ${failedCount}개 실패 ===`);

if (failedCount > 0) {
  process.exitCode = 1; // CI 파이프라인에서 실패를 감지할 수 있도록 exit code 설정
}