"use client";

import { useEffect, useState } from "react";
import { fetchTopScores } from "@/lib/api/scores";
import { ScoreRecord } from "@/types/database";

type FetchStatus = "loading" | "success" | "error";

interface RankingBoardProps {
  limit?: number;
}

/** 상위 랭킹 목록을 조회하여 테이블로 표시하는 컴포넌트 */
export function RankingBoard({ limit = 10 }: RankingBoardProps): JSX.Element {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트 언마운트 이후 상태 업데이트를 방지하기 위한 플래그
    let isCancelled = false;

    async function loadScores(): Promise<void> {
      setStatus("loading");
      setErrorMessage(null);

      const result = await fetchTopScores(limit);

      if (isCancelled) return;

      if (result.success) {
        setScores(result.data);
        setStatus("success");
      } else {
        setErrorMessage(result.error);
        setStatus("error");
      }
    }

    loadScores();

    return () => {
      isCancelled = true;
    };
  }, [limit]);

  if (status === "loading") {
    return (
      <div className="w-full max-w-md rounded-md border border-slate-700 bg-slate-800 p-6 text-center text-slate-400">
        랭킹을 불러오는 중입니다...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-md rounded-md border border-red-500 bg-red-950/40 p-6 text-center text-red-400">
        {errorMessage ?? "랭킹을 불러오지 못했습니다."}
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="w-full max-w-md rounded-md border border-slate-700 bg-slate-800 p-6 text-center text-slate-400">
        아직 등록된 기록이 없습니다. 첫 기록의 주인공이 되어보세요!
      </div>
    );
  }

  return (
    <table className="w-full max-w-md border-collapse overflow-hidden rounded-md border border-slate-700 text-white">
      <thead>
        <tr className="bg-slate-800 text-left text-sm text-slate-400">
          <th className="px-4 py-2">순위</th>
          <th className="px-4 py-2">닉네임</th>
          <th className="px-4 py-2 text-right">점수</th>
          <th className="px-4 py-2 text-right">레벨</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((record, index) => (
          <tr key={record.id} className="border-t border-slate-700 text-sm">
            <td className="px-4 py-2">{index + 1}</td>
            <td className="px-4 py-2">{record.nickname}</td>
            <td className="px-4 py-2 text-right">{record.score.toLocaleString()}</td>
            <td className="px-4 py-2 text-right">{record.level}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}