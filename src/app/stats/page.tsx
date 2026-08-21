import Link from "next/link";
import { RankingBoard } from "@/components/tetris/RankingBoard";

export default function StatsPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 bg-slate-950 py-10">
      <h1 className="text-2xl font-bold text-white">전체 랭킹</h1>
      <RankingBoard limit={10} />
      <Link
        href="/"
        className="rounded bg-slate-700 px-4 py-2 text-sm text-white transition hover:bg-slate-600"
      >
        게임으로 돌아가기
      </Link>
    </main>
  );
}