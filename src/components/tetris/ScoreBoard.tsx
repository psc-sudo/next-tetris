import { TetrominoType } from "@/types/tetris";
import { TETROMINO_SHAPES } from "@/lib/tetris/constants";
import { TETROMINO_COLOR_MAP } from "./tetromino-colors";

interface ScoreBoardProps {
  score: number;
  level: number;
  linesCleared: number;
  nextPiece: TetrominoType;
}

/** 점수/레벨/라인 수와 다음 블록 미리보기(1개)를 표시하는 프레젠테이션 컴포넌트 */
export function ScoreBoard({
  score,
  level,
  linesCleared,
  nextPiece,
}: ScoreBoardProps): JSX.Element {
  const nextShape = TETROMINO_SHAPES[nextPiece];

  return (
    <div className="flex gap-6 rounded-md border border-slate-700 bg-slate-800 p-4 text-white">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-400">SCORE</span>
        <span className="text-lg font-bold">{score.toLocaleString()}</span>
        <span className="text-xs text-slate-400">LEVEL</span>
        <span className="text-lg font-bold">{level}</span>
        <span className="text-xs text-slate-400">LINES</span>
        <span className="text-lg font-bold">{linesCleared}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-slate-400">NEXT</span>
        <div
          className="grid gap-[1px]"
          style={{ gridTemplateColumns: `repeat(${nextShape[0].length}, 1rem)` }}
        >
          {nextShape.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`next-${r}-${c}`}
                className={`h-4 w-4 ${
                  cell ? TETROMINO_COLOR_MAP[nextPiece] : "bg-transparent"
                }`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}