export function getAdSlug(title: string, id?: number | string): string {
  const baseSlug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "offer";

  return id !== undefined && id !== null ? `${baseSlug}-${id}` : baseSlug;
}
