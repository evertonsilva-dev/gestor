import type { ReactNode } from "react";

export type NoticeTone = "info" | "error" | "success";

export interface NoticeProps {
  children: ReactNode;
  tone?: NoticeTone;
}
