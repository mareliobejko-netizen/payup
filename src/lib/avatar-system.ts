export const AVATAR_PRESETS = [
  { id: "classic", label: "Classico", url: "/avatars/classic.svg" },
  { id: "hair", label: "Capelli", url: "/avatars/hair.svg" },
  { id: "cap", label: "Cappello", url: "/avatars/cap.svg" },
  { id: "glasses", label: "Occhiali", url: "/avatars/glasses.svg" },
  { id: "headphones", label: "Cuffie", url: "/avatars/headphones.svg" },
  { id: "moustache", label: "Baffi", url: "/avatars/moustache.svg" },
  { id: "parrot", label: "Pappagallo", url: "/avatars/parrot.svg" },
  { id: "cat", label: "Gatto", url: "/avatars/cat.svg" },
  { id: "hoodie", label: "Felpa", url: "/avatars/hoodie.svg" },
  { id: "crown", label: "Corona", url: "/avatars/crown.svg" },
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]["id"];

export function isPresetAvatar(value: string | null | undefined) {
  return Boolean(value && AVATAR_PRESETS.some((avatar) => avatar.url === value));
}

export const AVATAR_BADGES = {
  admin: { emoji: "👑", label: "Admin" },
  moderator: { emoji: "🛡️", label: "Moderatore" },
  trending: { emoji: "🔥", label: "Trending" },
  loser: { emoji: "🤡", label: "Perde sempre" },
  reliable: { emoji: "🫡", label: "Uomo di parola" },
  spender: { emoji: "💸", label: "Sponsor" },
  seasonWinner: { emoji: "🏆", label: "Season winner" },
} as const;

export type AvatarBadge = keyof typeof AVATAR_BADGES;

export function resolveAvatarBadges(input: {
  role?: string | null;
  rank?: number | null;
  trending?: boolean;
  completed?: number;
  total?: number;
  spentCents?: number;
  seasonWinner?: boolean;
}) {
  const badges: AvatarBadge[] = [];
  if (input.role === "admin") badges.push("admin");
  else if (input.role === "moderator") badges.push("moderator");
  if (input.trending) badges.push("trending");
  if (input.rank === 1 && (input.total ?? 0) > 0) badges.push("loser");
  if ((input.completed ?? 0) >= 5 && (input.completed ?? 0) === (input.total ?? -1)) badges.push("reliable");
  if ((input.spentCents ?? 0) >= 5000) badges.push("spender");
  if (input.seasonWinner) badges.push("seasonWinner");
  return badges.slice(0, 2);
}
