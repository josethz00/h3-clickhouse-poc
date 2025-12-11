export function parsePointCoord(pointStr: string): { lat: number; lon: number } {
  const cleaned = pointStr
    .replace("POINT", "")
    .replace("(", "")
    .replace(")", "")
    .trim()

  const [lonStr, latStr] = cleaned
    .split(" ")
    .filter(Boolean)

  return {
    lat: Number(latStr),
    lon: Number(lonStr),
  }
}

