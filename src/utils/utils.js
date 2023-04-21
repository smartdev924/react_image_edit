import { useStore } from "@/state/store";

export function state() {
  return useStore.getState();
}

export function tools() {
  return state().editor.tools;
}

export function fabricCanvas() {
  return state().fabric;
}
