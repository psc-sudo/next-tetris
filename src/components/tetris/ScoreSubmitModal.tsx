"use client";

import { useState } from "react";
import { submitScore } from "@/lib/api/scores";

interface ScoreSubmitModalProps {
  score: number;
  level: number;
  linesCleared: number;
  onSubmitted: () => void;
  onClose: () => void;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const MAX_NICKNAME_LENGTH = 12;

/** 게임 오버 시 표시되는 닉네임 입력 및 점수 제출 모달 */
export function ScoreSubmitModal({
  score,
  level,
  linesCleared,
  onSubmitted,
  onClose,
}: ScoreSubmitModalProps): JSX.Element {
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedNickname = nickname.trim();
  const isNicknameValid =
    trimmedNickname.length > 0 && trimmedNickname.length <= MAX_NICKNAME_LENGTH;

  async function handleSubmit(): Promise<void> {
    if (!isNicknameValid) {
      setErrorMessage("닉네임은 1~12자 사이로 입력해주세요.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);

    const result = await submitScore({
      nickname: trimmedNickname,
      score,
      level,
      linesCleared,
    });

    if (result.success) {
      setStatus("success");
      onSubmitted();
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex w-80 flex-col gap-4 rounded-md border border-slate-700 bg-slate-800 p-6 text-white">
        <div>
          <h2 className="text-lg font-bold">게임 오버!</h2>
          <p className="mt-1 text-sm text-slate-400">
            최종 점수 {score.toLocaleString()}점을 기록에 남겨보세요.
          </p>
        </div>

        <input
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="닉네임 입력 (최대 12자)"
          maxLength={MAX_NICKNAME_LENGTH}
          disabled={status === "submitting" || status === "success"}
          className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-slate-400 disabled:opacity-50"
        />

        {errorMessage && (
          <p className="text-sm text-red-400" role="alert">
            {errorMessage}
          </p>
        )}

        {status === "success" ? (
          <>
            <p className="text-sm text-green-400">기록이 저장되었습니다!</p>
            <button
              onClick={onClose}
              className="rounded bg-slate-700 px-3 py-2 text-sm transition hover:bg-slate-600"
            >
              닫기
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={status === "submitting" || !isNicknameValid}
              className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {status === "submitting" ? "저장 중..." : "기록 저장"}
            </button>
            <button
              onClick={onClose}
              disabled={status === "submitting"}
              className="rounded border border-slate-600 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              건너뛰기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}