"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";

const CONCERNS = [
  { label: "Energie și somn", value: "energy-sleep" },
  { label: "Inimă", value: "heart" },
  { label: "Hormoni", value: "hormones" },
  { label: "Digestiv", value: "gut" },
  { label: "Deficit nutrienți", value: "nutrient-gaps" },
  { label: "Inflamație", value: "inflammation" },
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
        <span className="font-medium text-muted-foreground text-xs tracking-wide">
          Filtrează după
        </span>
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
            className="rounded-full px-3.5 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            key={c.value}
            onClick={() => {
              const next = value === c.value ? "" : c.value;
              if (next) {
                window.location.href = `/analize?concern=${next}`;
              } else {
                window.location.href = "/analize";
              }
            }}
            value={c.value}
          >
            {c.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </section>
  );
}
