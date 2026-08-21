"use client";

import { useState } from "react";
import { useTetrisGame } from "@/hooks/useTetrisGame";
import { mergePieceToBoard } from "@/lib/tetris/engine";
import { TETROMINO_COLOR_MAP } from "./tetromino-colors";
import { ScoreBoard } from "./ScoreBoard";
import { ScoreSubmitModal } from "./ScoreSubmitModal";

/** 테트리스 보드 전체를 렌더링하는 최상위 프레젠테이션 컴포넌트 */
export function GameBoard(): JSX.Element {
  const { gameState, restartGame } = useTetrisGame();
  const [isModalDismissed, setIsModalDismissed] = useState(false);

  const displayBoard = gameState.activePiece
    ? mergePieceToBoard(gameState.board, gameState.activePiece)
    : gameState.board;

  const shouldShowModal = gameState.status === "gameOver" && !isModalDismissed;

  function handleRestart(): void {
    setIsModalDismissed(false);
    restartGame();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid border-4 border-slate-700 bg-slate-900"
        style={{
          gridTemplateColumns: `repeat(${displayBoard[0].length}, 1.5rem)`,
          gridTemplateRows: `repeat(${displayBoard.length}, 1.5rem)`,
        }}
      >
        {displayBoard.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`h-6 w-6 border border-slate-800 ${
                cell ? TETROMINO_COLOR_MAP[cell] : "bg-slate-900"
              }`}
            />
          ))
        )}
      </div>

      <ScoreBoard
        score={gameState.score}
        level={gameState.level}
        linesCleared={gameState.linesCleared}
        nextPiece={gameState.nextPiece}
      />

      {gameState.status === "gameOver" && isModalDismissed && (
        <div className="flex flex-col items-center gap-2 rounded-md border border-red-500 bg-red-950/40 p-4">
          <p className="font-bold text-red-400">게임 오버</p>
          <button
            onClick={handleRestart}
            className="rounded bg-slate-700 px-4 py-2 text-sm text-white transition hover:bg-slate-600"
          >
            다시 시작
          </button>
        </div>
      )}

      {shouldShowModal && (
        <ScoreSubmitModal
          score={gameState.score}
          level={gameState.level}
          linesCleared={gameState.linesCleared}
          onSubmitted={() => setIsModalDismissed(true)}
          onClose={() => setIsModalDismissed(true)}
        />
      )}
    </div>
  );
}