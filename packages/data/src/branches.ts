import alfaRaw from "../data/locations/alfa_locations.json" with {
  type: "json",
};
import invitroRaw from "../data/locations/invitro_locations.json" with {
  type: "json",
};
import medexpertRaw from "../data/locations/medexpert_locations.json" with {
  type: "json",
};
import santeRaw from "../data/locations/sante_locations.json" with {
  type: "json",
};
import synevoRaw from "../data/locations/synevo_locations.json" with {
  type: "json",
};
import type { Branch, Weekday } from "./types.js";

type LabId = Branch["labId"];

const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function deriveStreetKey(address: string): string {
  const a = address.toLowerCase();
  if (a.includes("botanica")) {
    return "botanica";
  }
  if (
    a.includes("centru") ||
    a.includes("ștefan") ||
    a.includes("stefan") ||
    a.includes("grigore vieru")
  ) {
    return "centru";
  }
  if (
    a.includes("rîșcani") ||
    a.includes("riscani") ||
    a.includes("moscova") ||
    a.includes("kiev") ||
    a.includes("miron costin") ||
    a.includes("bogdan voievod")
  ) {
    return "riscani";
  }
  if (
    a.includes("buiucani") ||
    a.includes("alba iulia") ||
    a.includes("creangă") ||
    a.includes("creanga") ||
    a.includes("caragiale") ||
    a.includes("deleanu")
  ) {
    return "buiucani";
  }
  if (
    a.includes("ciocana") ||
    a.includes("mircea cel bătrân") ||
    a.includes("ginta latină") ||
    a.includes("ginta latina")
  ) {
    return "ciocana";
  }
  if (
    a.includes("telecentru") ||
    a.includes("pietrarilor") ||
    a.includes("testemițanu") ||
    a.includes("testemitanu")
  ) {
    return "telecentru";
  }
  return "centru";
}

function normalizeHoursString(s: string): string {
  return s
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll(".", ":")
    .replaceAll("  ", " ")
    .trim();
}

function parseInterval(text: string): string | null {
  const t = normalizeHoursString(text);
  // match "07:30 - 15:00" or "7:00-17:00"
  const m = t.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (m) {
    return `${m[1].padStart(5, "0")}-${m[2].padStart(5, "0")}`.replace(
      " 0",
      "0"
    );
  }
  if (/zi liberă|zile libere|închis|inchis/i.test(t)) {
    return null;
  }
  return null;
}

function emptyWeek(): Record<Weekday, string[] | null> {
  const r: Record<Weekday, string[] | null> = {} as Record<
    Weekday,
    string[] | null
  >;
  for (const d of WEEKDAYS) {
    r[d] = null;
  }
  return r;
}

function applyInterval(
  hours: Record<Weekday, string[] | null>,
  days: Weekday[],
  interval: string | null
): void {
  for (const d of days) {
    if (interval === null) {
      hours[d] = null;
    } else {
      hours[d] = [interval];
    }
  }
}

function parseRoHours(raw: string): Record<Weekday, string[] | null> {
  const hours = emptyWeek();
  if (!raw) {
    return hours;
  }
  const txt = raw.trim();
  if (!txt) {
    return hours;
  }
  // split by ; or newline
  const parts = txt
    .split(/[;\n]/)
    .map((p) => p.trim())
    .filter(Boolean);
  let hasAny = false;
  for (const part of parts) {
    const lower = part.toLowerCase();
    const interval = parseInterval(part);
    // detect day range
    if (
      lower.includes("luni") &&
      (lower.includes("vineri") ||
        lower.includes("l-v") ||
        lower.includes("l - v"))
    ) {
      applyInterval(hours, ["Mon", "Tue", "Wed", "Thu", "Fri"], interval);
      hasAny = true;
    } else if (lower.includes("l-v") || lower.includes("luni - vineri")) {
      applyInterval(hours, ["Mon", "Tue", "Wed", "Thu", "Fri"], interval);
      hasAny = true;
    } else if (
      lower.startsWith("sb") ||
      lower.includes("sâmbătă") ||
      lower.includes("sambata")
    ) {
      // could be "Sb: 8.00-13.00" or "Sâmbătă"
      if (lower.includes("duminică") || lower.includes("duminica")) {
        // "Sâmbătă, Duminică: zile libere"
        if (interval === null) {
          hours.Sat = null;
          hours.Sun = null;
        } else {
          hours.Sat = [interval];
          hours.Sun = [interval];
        }
        hasAny = true;
      } else {
        hours.Sat = interval ? [interval] : null;
        hasAny = true;
      }
    } else if (lower.includes("duminică") || lower.includes("duminica")) {
      hours.Sun = interval ? [interval] : null;
      hasAny = true;
    } else if (lower.includes("sâmbătă") && lower.includes("duminică")) {
      hours.Sat = interval ? [interval] : null;
      hours.Sun = interval ? [interval] : null;
      hasAny = true;
    }
  }
  // if we parsed nothing but there is a single interval without day label, assume Mon-Fri
  if (!hasAny) {
    const iv = parseInterval(txt);
    if (iv) {
      applyInterval(hours, ["Mon", "Tue", "Wed", "Thu", "Fri"], iv);
    }
  }
  return hours;
}

function alfaToBranch(item: Record<string, unknown>, idx: number): Branch {
  const _rawName = (item.raw_name as string) ?? `Alfa ${idx}`;
  const rawAddress = (item.raw_address as string) ?? "";
  const rawHours = (item.raw_hours as string) ?? "";
  const phone = (item.phone as string) ?? "(022) 82 44 44";
  const address = `${rawAddress}, Chișinău`;
  const hours = parseRoHours(rawHours);
  return {
    address,
    city: "Chișinău",
    geo: { lat: 47.02, lng: 28.835 },
    hours,
    id: `alfa-${idx.toString().padStart(2, "0")}`,
    labId: "alfa",
    phone,
    sampleTypes: ["Sânge"],
    streetKey: deriveStreetKey(address),
  };
}

function synevoToBranch(item: Record<string, unknown>, _idx: number): Branch {
  const externalKey = (item.external_key as string) ?? "synevo-unknown";
  const rawName = (item.raw_name as string) ?? externalKey;
  const address = (item.address as string) ?? rawName;
  const phoneRaw = (item.phone as string) ?? "022 856 990";
  const phone = phoneRaw.split(";")[0].trim();
  const lat = Number.parseFloat(String(item.lat ?? "47.01"));
  const lng = Number.parseFloat(String(item.lng ?? "28.83"));
  const hoursRaw = (item.hours as string) ?? "";
  const sampleHours = (item.sample_hours as string) ?? "";
  const source = hoursRaw || sampleHours;
  // synevo hours like "Luni - Vineri: 07:30 - 18:00 Sâmbătă: 08:00 - 14:00 Duminică: 08:00 - 12:00"
  // normalize to our parser
  const normalized = source
    .replaceAll("Luni - Vineri:", "L-V:")
    .replaceAll("Sâmbătă:", "Sb:")
    .replaceAll("Duminică:", "Du:");
  const hours = parseRoHours(normalized);
  // if synevo has weird format without ; we need to split smarter
  // fallback: try to extract daily
  if (hours.Mon === null && source.includes("07:30")) {
    const m = source.match(/07:30\s*-\s*\d{1,2}:\d{2}/);
    if (m) {
      const iv = parseInterval(m[0]);
      if (iv) {
        applyInterval(hours, ["Mon", "Tue", "Wed", "Thu", "Fri"], iv);
      }
    }
  }
  return {
    address,
    city: "Chișinău",
    geo: {
      lat: Number.isFinite(lat) ? lat : 47.01,
      lng: Number.isFinite(lng) ? lng : 28.83,
    },
    hours,
    id: externalKey,
    labId: "synevo",
    phone,
    sampleTypes: ["Sânge", "Urină"],
    streetKey: deriveStreetKey(address),
  };
}

function santeToBranch(item: Record<string, unknown>, _idx: number): Branch {
  const externalKey = (item.external_key as string) ?? "sante-unknown";
  const address =
    (item.address as string) ?? (item.raw_name as string) ?? externalKey;
  const phoneRaw = (item.phone as string) ?? "022 66 72 66";
  const phone = phoneRaw.split(";")[0].trim();
  const lat = Number.parseFloat(String(item.lat ?? "47.02"));
  const lng = Number.parseFloat(String(item.lng ?? "28.83"));
  const hours = (item.hours as string) ?? "";
  const parsed = parseRoHours(hours);
  return {
    address: address.includes("Chișinău") ? address : `${address}, Chișinău`,
    city: address.includes("Bălți")
      ? "Bălți"
      : address.includes("Cahul")
        ? "Cahul"
        : "Chișinău",
    geo: {
      lat: Number.isFinite(lat) ? lat : 47.02,
      lng: Number.isFinite(lng) ? lng : 28.83,
    },
    hours: parsed,
    id: externalKey,
    labId: "sante",
    phone,
    sampleTypes: ["Sânge", "Urină"],
    streetKey: deriveStreetKey(address),
  };
}

function invitroToBranch(item: Record<string, unknown>, idx: number): Branch {
  const externalKey = (item.external_key as string) ?? `invitro-${idx}`;
  const address =
    (item.address as string) ?? (item.street_address as string) ?? externalKey;
  const phone = "022 88 22 88";
  const lat = Number.parseFloat(String(item.lat ?? "47.02"));
  const lng = Number.parseFloat(String(item.lng ?? "28.83"));
  const hoursRows = (item.hours_rows as Record<string, unknown>[]) ?? [];
  // combine hoursRows values
  const raw = hoursRows.map((r) => `${r.label}: ${r.value}`).join("; ");
  const parsed = parseRoHours(raw);
  return {
    address,
    city: "Chișinău",
    geo: {
      lat: Number.isFinite(lat) ? lat : 47.02,
      lng: Number.isFinite(lng) ? lng : 28.83,
    },
    hours: parsed,
    id:
      externalKey.replace("https://", "").replaceAll("/", "-").slice(0, 60) ||
      `invitro-${idx}`,
    labId: "invitro",
    phone,
    sampleTypes: ["Sânge", "Urină"],
    streetKey: deriveStreetKey(address),
  };
}

function medexpertToBranch(item: Record<string, unknown>, idx: number): Branch {
  const rawName = (item.raw_name as string) ?? `medexpert-${idx}`;
  const address = (item.address as string) ?? rawName;
  const phone = (item.phone as string)?.split(" ")?.[0] ?? "+373 22 811 181";
  const hoursRows = (item.hours_rows as Record<string, unknown>[]) ?? [];
  const raw = hoursRows.map((r) => `${r.label}: ${r.value}`).join("; ");
  const parsed = parseRoHours(raw);
  return {
    address,
    city: "Chișinău",
    geo: { lat: 47.02, lng: 28.83 },
    hours: parsed,
    id: `medexpert-${idx.toString().padStart(2, "0")}`,
    labId: "medexpert",
    phone,
    sampleTypes: ["Sânge"],
    streetKey: deriveStreetKey(address),
  };
}

function buildBranches(): Branch[] {
  const out: Branch[] = [];
  const alfaItems = (alfaRaw as unknown as { items: unknown[] }).items ?? [];
  const santeItems = (santeRaw as unknown as { items: unknown[] }).items ?? [];
  // santeRaw is object with items or array?
  const synevoItems =
    (synevoRaw as unknown as { items: unknown[] }).items ?? [];
  const medexpertItems =
    (medexpertRaw as unknown as { items: unknown[] }).items ?? [];

  // Alfa: items is array under "items"
  const alfaList = Array.isArray(alfaItems) ? alfaItems : [];
  alfaList.forEach((it, i) =>
    out.push(alfaToBranch(it as Record<string, unknown>, i + 1))
  );

  // Synevo
  (synevoItems as Record<string, unknown>[]).forEach((it) =>
    out.push(synevoToBranch(it, 0))
  );

  // Sante
  (santeItems as Record<string, unknown>[]).forEach((it) =>
    out.push(santeToBranch(it, 0))
  );

  // Invitro: file is array of branches directly? Check shape
  const invitroArr = Array.isArray(invitroRaw) ? (invitroRaw as unknown[]) : [];
  // But our import is JSON object with array? Let's handle both
  if (
    invitroArr.length > 0 &&
    typeof invitroArr[0] === "object" &&
    "branch_id" in (invitroArr[0] as Record<string, unknown>)
  ) {
    invitroArr.forEach((it, i) =>
      out.push(invitroToBranch(it as Record<string, unknown>, i))
    );
  } else if (Array.isArray((invitroRaw as Record<string, unknown>).items)) {
    const arr = (invitroRaw as Record<string, unknown>).items as unknown[];
    arr.forEach((it, i) =>
      out.push(invitroToBranch(it as Record<string, unknown>, i))
    );
  }

  // Medexpert
  (medexpertItems as Record<string, unknown>[]).forEach((it, i) =>
    out.push(medexpertToBranch(it, i + 1))
  );

  return out;
}

export const BRANCHES: Branch[] = buildBranches();
export const BRANCH_COUNT = BRANCHES.length;
