import { AVATAR_BADGES, type AvatarBadge } from "@/lib/avatar-system";

type Props = {
  username: string;
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  badges?: AvatarBadge[];
  className?: string;
};

const sizes = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
  xl: "h-24 w-24",
};

export default function PayUpAvatar({ username, avatarUrl, size = "md", badges = [], className = "" }: Props) {
  return (
    <div className={`relative shrink-0 ${sizes[size]} ${className}`}>
      <div className="h-full w-full overflow-hidden rounded-full bg-lime-400 text-black ring-2 ring-white/5">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`Avatar di ${username}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-black">{username[0]?.toUpperCase()}</div>
        )}
      </div>
      {badges.slice(0, 2).map((badge, index) => {
        const meta = AVATAR_BADGES[badge];
        return (
          <span
            key={badge}
            title={meta.label}
            aria-label={meta.label}
            className={`absolute -right-1 flex items-center justify-center rounded-full border-2 border-zinc-950 bg-zinc-900 shadow-lg ${size === "xl" ? "h-8 w-8 text-base" : "h-6 w-6 text-xs"} ${index === 0 ? "-top-1" : "bottom-0"}`}
          >
            {meta.emoji}
          </span>
        );
      })}
    </div>
  );
}
