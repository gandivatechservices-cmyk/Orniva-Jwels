import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "store";

/**
 * Typed dispatch — use this instead of plain `useDispatch` so that thunks
 * have full type inference with async payloads.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed selector — use this instead of plain `useSelector` for full RootState
 * type inference.
 */
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector);
