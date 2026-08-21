import Link from "next/link";
import { GameBoard } from "@/components/tetris/GameBoard";

export default function HomePage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 py-10">
      <h1 className="text-2xl font-bold text-white">테트리스</h1>
      <GameBoard />
      <Link
        href="/stats"
        className="text-sm text-slate-400 underline transition hover:text-slate-200"
      >
        전체 랭킹 보기
      </Link>
    </main>
  );
}