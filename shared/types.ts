export type * from "../drizzle/schema";
import type { MatchParticipant } from "../drizzle/schema";

// Extended types with additional fields
export type MatchParticipantWithIcons = MatchParticipant & {
  heroIcon?: string | null;
  playerIcon?: string | null;
};
