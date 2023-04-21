import { useDispatch, useSelector } from "react-redux";

/**
 * @type {import("react-redux").TypedUseSelectorHook<import("@/store").RootState>}
 */
export const useAppState = useSelector;

/**
 * @type {()=> import("@/store").AppDispatch}
 */
export const useAppDispatch = useDispatch;
