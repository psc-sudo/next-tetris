"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { applyGameAction, createInitialGameState } from "@/lib/tetris/engine";
import { GRAVITY_INTERVAL_MS, KEYBOARD_CONTROLS } from "@/lib/tetris/constants";
import { GameAction, TetrisGameState } from "@/types/tetris";

interface UseTetrisGameReturn {
  gameState: TetrisGameState;
  restartGame: () => void;
}

/**
 * 테트리스 게임의 상태와 부수효과(키보드 입력, 자동 낙하 타이머)를 관리하는 훅
 * 실제 게임 규칙 계산은 전부 engine.ts의 순수 함수에 위임한다.
 */
export function useTetrisGame(): UseTetrisGameReturn {
  const [gameState, dispatch] = useReducer(
    applyGameAction,
    undefined,
    createInitialGameState
  );

  // setInterval 콜백 내부에서 최신 status를 참조하기 위한 ref (stale closure 방지)
  const statusRef = useRef(gameState.status);
  useEffect(() => {
    statusRef.current = gameState.status;
  }, [gameState.status]);

  // 자동 낙하(중력) 타이머 - 고정 속도
  useEffect(() => {
    if (gameState.status !== "playing") return undefined;

    const intervalId = setInterval(() => {
      dispatch({ type: "TICK" });
    }, GRAVITY_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [gameState.status]);

  // 키보드 입력 바인딩
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (statusRef.current !== "playing") return;

      const actionType =
        KEYBOARD_CONTROLS[event.code as keyof typeof KEYBOARD_CONTROLS];
      if (!actionType) return;

      // 방향키/스페이스바의 브라우저 기본 동작(페이지 스크롤) 방지
      event.preventDefault();
      dispatch({ type: actionType } as GameAction);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const restartGame = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  return { gameState, restartGame };
}