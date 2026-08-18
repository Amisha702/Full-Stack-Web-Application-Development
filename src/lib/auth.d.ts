import type { ReactNode } from "react";

export declare function AuthProvider(props: { children: ReactNode }): JSX.Element;
export declare function useAuth(): {
  token: string | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (username: string, password: string) => Promise<unknown>;
  logout: () => void;
};