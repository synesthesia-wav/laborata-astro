"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group";

const CONCERNS = [
  { label: "Energy and sleep", value: "energy-sleep" },
  { label: "Heart", value: "heart" },
  { label: "Hormones", value: "hormones" },
  { label: "Gut", value: "gut" },
  { label: "Nutrient gaps", value: "nutrient-gaps" },
  { label: "Inflammation", value: "inflammation" },
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
      <h2 className="sr-only" id={`concerns-heading-${idSuffix}`}>
        Browse by concern
      </h2>
      <ToggleGroup
        aria-label="Browse by concern"
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
            className="rounded-full"
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
