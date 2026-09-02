"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";

const CONCERNS = [
  { label: "Energie", slug: "energie", value: "energy" },
  { label: "Hormoni", slug: "hormoni", value: "hormones" },
  { label: "Inimă", slug: "inima", value: "heart" },
  { label: "Digestiv", slug: "digestiv", value: "gut" },
  { label: "Inflamație", slug: "inflamatie", value: "inflammation" },
  { label: "Diabet", slug: "diabet", value: "diabetes" },
] as const;

interface Props {
  idSuffix?: string;
  onChange?: (v: string) => void;
  value?: string;
}

export function ConcernsRow({ value, onChange, idSuffix = "home" }: Props) {
  return (
    <section
      aria-labelledby={`concerns-heading-${idSuffix}`}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Filtrează după
        </span>
        <Separator orientation="vertical" className="h-3" />
        <h2 className="sr-only" id={`concerns-heading-${idSuffix}`}>
          Filtrează după concern
        </h2>
      </div>
      <ToggleGroup
        aria-label="Filtrează după concern"
        className="flex flex-wrap gap-2"
        onValueChange={(v) => onChange?.(v[0] ?? "")}
        size="sm"
        spacing={2}
        value={value ? [value] : []}
        variant="outline"
      >
        {CONCERNS.map((c) => (
          <ToggleGroupItem
            aria-label={c.label}
            className="rounded-full px-3.5"
            key={c.value}
            value={c.value}
            render={
              <a
                href={
                  value === c.value
                    ? "/analize"
                    : `/analize?concern=${c.value}`
                }
              />
            }
          >
            {c.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex flex-wrap gap-2">
        {CONCERNS.map((c) => (
          <Badge
            key={`cat-${c.value}`}
            variant="outline"
            className="rounded-full text-[11px] font-medium"
            render={<a href={`/categorie/${c.slug}`} />}
          >
            {c.label} →
          </Badge>
        ))}
      </div>
    </section>
  );
}
