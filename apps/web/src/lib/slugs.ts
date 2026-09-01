/** slugs: name_ro → slug_ro + oldSlugs 301, diacritics folding */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const oldSlugs: Record<string, string> = {
  // keep produs → analize redirects
  "vitamina-b12": "vitamina-b12",
};

// provenance note for fee single line
export const FEE_NOTE_RO = "plus 30 lei o singură dată";
export const FEE_NOTE_EN = "plus 30 MDL for blood draw, once";
