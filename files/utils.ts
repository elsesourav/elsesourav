/** Tiny class-name joiner. Swap for `clsx` + `tailwind-merge` if you want override-safe merging. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
