"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { BoardState, InspirationBoard } from "@/lib/types";

const STORAGE_KEY = "jingjian:boards:v1";
const initialState = (): BoardState => ({
  version: 1,
  activeBoardId: "default",
  boards: [{ id: "default", name: "默认灵感板", frameIds: [], createdAt: new Date(0).toISOString() }],
});

type BoardContextValue = BoardState & {
  hydrated: boolean;
  activeBoard: InspirationBoard;
  totalSaved: number;
  setActiveBoard: (id: string) => void;
  toggleFrame: (frameId: string) => void;
  isInActiveBoard: (frameId: string) => boolean;
  createBoard: (name: string) => void;
  renameBoard: (id: string, name: string) => void;
  deleteBoard: (id: string) => void;
  removeFrame: (boardId: string, frameId: string) => void;
  moveFrame: (boardId: string, frameId: string, direction: -1 | 1) => void;
};

const BoardContext = createContext<BoardContextValue | null>(null);

function isValidState(value: unknown): value is BoardState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<BoardState>;
  return state.version === 1 && typeof state.activeBoardId === "string" && Array.isArray(state.boards) && state.boards.length > 0 && state.boards.every((board) =>
    board && typeof board.id === "string" && typeof board.name === "string" && Array.isArray(board.frameIds) && board.frameIds.every((id) => typeof id === "string")
  );
}

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BoardState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let nextState: BoardState | null = null;
    let clearInvalid = false;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isValidState(parsed) && parsed.boards.some((board) => board.id === parsed.activeBoardId)) nextState = parsed;
        else clearInvalid = true;
      }
    } catch {
      clearInvalid = true;
    }
    if (clearInvalid) window.localStorage.removeItem(STORAGE_KEY);
    const timer = window.setTimeout(() => {
      if (nextState) setState(nextState);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const updateBoards = useCallback((fn: (boards: InspirationBoard[]) => InspirationBoard[]) => {
    setState((current) => ({ ...current, boards: fn(current.boards) }));
  }, []);

  const setActiveBoard = useCallback((id: string) => {
    setState((current) => current.boards.some((board) => board.id === id) ? { ...current, activeBoardId: id } : current);
  }, []);

  const toggleFrame = useCallback((frameId: string) => {
    setState((current) => ({
      ...current,
      boards: current.boards.map((board) => board.id !== current.activeBoardId ? board : {
        ...board,
        frameIds: board.frameIds.includes(frameId) ? board.frameIds.filter((id) => id !== frameId) : [...board.frameIds, frameId],
      }),
    }));
  }, []);

  const createBoard = useCallback((rawName: string) => {
    const name = rawName.trim().slice(0, 30);
    if (!name) return;
    const id = `board-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setState((current) => ({ ...current, activeBoardId: id, boards: [...current.boards, { id, name, frameIds: [], createdAt: new Date().toISOString() }] }));
  }, []);

  const renameBoard = useCallback((id: string, rawName: string) => {
    const name = rawName.trim().slice(0, 30);
    if (name) updateBoards((boards) => boards.map((board) => board.id === id ? { ...board, name } : board));
  }, [updateBoards]);

  const deleteBoard = useCallback((id: string) => {
    setState((current) => {
      if (current.boards.length === 1) return initialState();
      const boards = current.boards.filter((board) => board.id !== id);
      return { ...current, boards, activeBoardId: current.activeBoardId === id ? boards[0].id : current.activeBoardId };
    });
  }, []);

  const removeFrame = useCallback((boardId: string, frameId: string) => {
    updateBoards((boards) => boards.map((board) => board.id === boardId ? { ...board, frameIds: board.frameIds.filter((id) => id !== frameId) } : board));
  }, [updateBoards]);

  const moveFrame = useCallback((boardId: string, frameId: string, direction: -1 | 1) => {
    updateBoards((boards) => boards.map((board) => {
      if (board.id !== boardId) return board;
      const index = board.frameIds.indexOf(frameId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= board.frameIds.length) return board;
      const frameIds = [...board.frameIds];
      [frameIds[index], frameIds[target]] = [frameIds[target], frameIds[index]];
      return { ...board, frameIds };
    }));
  }, [updateBoards]);

  const activeBoard = state.boards.find((board) => board.id === state.activeBoardId) ?? state.boards[0];
  const value = useMemo<BoardContextValue>(() => ({
    ...state, hydrated, activeBoard,
    totalSaved: new Set(state.boards.flatMap((board) => board.frameIds)).size,
    setActiveBoard, toggleFrame,
    isInActiveBoard: (frameId) => activeBoard.frameIds.includes(frameId),
    createBoard, renameBoard, deleteBoard, removeFrame, moveFrame,
  }), [state, hydrated, activeBoard, setActiveBoard, toggleFrame, createBoard, renameBoard, deleteBoard, removeFrame, moveFrame]);

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoards() {
  const value = useContext(BoardContext);
  if (!value) throw new Error("useBoards must be used inside BoardProvider");
  return value;
}
