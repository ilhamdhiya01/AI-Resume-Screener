import { create } from 'zustand';

interface AuthState {
  turnstileToken: string | null;
}

interface AuthActions {
  setTurnstileToken: (token: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

const InitialState: AuthState = {
  turnstileToken: null,
};

export const useAuthStore = create<AuthStore>()((set) => ({
  ...InitialState,
  setTurnstileToken: (token: string | null) => set({ turnstileToken: token }),
}));
