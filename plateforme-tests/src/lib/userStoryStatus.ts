import { StatutUS } from "@/types";

const USER_STORY_STATUS_LABELS: Record<StatutUS, string> = {
  to_do: "À_FAIRE",
  in_progress: "EN_COURS",
  done: "TERMINÉ",
};

export const getUserStoryStatusLabel = (status: StatutUS | string | null | undefined): string => {
  if (!status) {
    return "";
  }
  if (status === "to_do" || status === "in_progress" || status === "done") {
    return USER_STORY_STATUS_LABELS[status];
  }
  return String(status || "").toUpperCase();
};
