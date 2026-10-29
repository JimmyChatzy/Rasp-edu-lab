
export function formatLabel(name: string) {
  return name
    ?.replace(/([A-Z])/g, " $1")
    ?.replace(/^./, (char) => char.toUpperCase());
}

export const MAX_FULL_NAME = 100;

// Full name when the user has set one, otherwise the username
export function displayName(user: { username: string; fullName?: string | null }): string {
  return user.fullName?.trim() || user.username;
}
