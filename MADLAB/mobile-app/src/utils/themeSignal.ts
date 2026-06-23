type Listener = (theme: "light" | "dark") => void;
const listeners = new Set<Listener>();

export const themeSignal = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(theme: "light" | "dark") {
    listeners.forEach((l) => l(theme));
  },
};
