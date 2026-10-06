
export function formatLabel(name: string) {
  return name
    ?.replace(/([A-Z])/g, " $1")
    ?.replace(/^./, (char) => char.toUpperCase());
}
