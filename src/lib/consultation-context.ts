export function resolveConsultationArea(
  requested: string | null,
  available: readonly string[],
): string {
  return requested && available.includes(requested) ? requested : "";
}

export function composeConsultationMessage(
  title: string,
  areaPrefix: string,
  areaLabel: string,
  details: string,
): string {
  return [title, areaPrefix + areaLabel, "", details].join("\n");
}
