import { useAvatarStore } from "@/features/settings/avatarStore"
import { cn } from "@/lib/utils"

interface AvatarProps {
  userId: string
  initials: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-20 w-20 text-xl",
}

export function Avatar({ userId, initials, size = "md", className }: AvatarProps) {
  const photo = useAvatarStore((s) => s.avatars[userId])

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 font-semibold text-primary",
        SIZES[size],
        className
      )}
    >
      {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials}
    </span>
  )
}
