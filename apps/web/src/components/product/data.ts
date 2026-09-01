import type { LabId } from "@workspace/data/types";

export interface PriceRow {
  collectionFee: number;
  highlight?: boolean;
  lab: string;
  note?: string;
  price: number;
}

export interface PriceOffer {
  lab: string;
  price_mdl: number;
  variant?: string | null;
  vendor: LabId;
}

export interface SpecOffer {
  collection_protocol: string | null;
  lab: string;
  method: string | null;
  reference_ranges: { analyte: string; range: string; unit: string | null }[];
  specimen: string | null;
  turnaround: string | null;
  turnaround_max_days: number | null;
  turnaround_min_days: number | null;
  vendor: LabId;
}

export const PRODUCT_GALLERY = [
  "https://app.paper.design/file-assets/01M129DBEK4Z10XA1T599DWYSY/5ZX1CM4PT42PF7FG5HQB9KS3CP.webp",
  "https://app.paper.design/file-assets/01M129DBEK4Z10XA1T599DWYSY/42RMYBF3K193SXNQ8MSYK7J85B.webp",
  "https://app.paper.design/file-assets/01M129DBEK4Z10XA1T599DWYSY/2H00NRNSAMKYFFKA3K286QSSS6.jpg",
] as const;

/**
 * Honest mock for Vitamina B12 — 4/5 vendors available (MedExpert missing = honest Not available)
 * Prices are per-test only (fee is single line, not per-row). Cheapest is Sante 175 (0 lei fee).
 * Source: vendor_fees.json (blood 30 Synevo/Invitro, 0 Sante/MedExpert, 25 Alfa). Highlight cheapest.
 * Data wiring W1 vendors 417 graph — swap with real canonical-graph + vendor_offerings snapshot when ready.
 */
export const PRICE_OFFERS_B12: readonly PriceOffer[] = [
  { lab: "Sante", price_mdl: 175, variant: null, vendor: "sante" },
  { lab: "Synevo", price_mdl: 195, variant: null, vendor: "synevo" },
  { lab: "Alfa", price_mdl: 190, variant: null, vendor: "alfa" },
  { lab: "Invitro", price_mdl: 210, variant: null, vendor: "invitro" },
] as const;

/** 1/5 vendors — Showcase stress: single offer state */
export const PRICE_OFFERS_SINGLE: readonly PriceOffer[] = [
  { lab: "Sante", price_mdl: 175, variant: null, vendor: "sante" },
] as const;

/** Large price stress: 1.250.000 lei */
export const PRICE_OFFERS_LARGE: readonly PriceOffer[] = [
  { lab: "Synevo", price_mdl: 1_250_000, variant: null, vendor: "synevo" },
  { lab: "Sante", price_mdl: 1_250_300, variant: null, vendor: "sante" },
  { lab: "Invitro", price_mdl: 1_251_000, variant: null, vendor: "invitro" },
  { lab: "Alfa", price_mdl: 1_249_900, variant: null, vendor: "alfa" },
  {
    lab: "MedExpert",
    price_mdl: 1_300_000,
    variant: null,
    vendor: "medexpert",
  },
] as const;

/** Variant qualifier stress */
export const PRICE_OFFERS_VARIANT: readonly PriceOffer[] = [
  {
    lab: "Synevo",
    price_mdl: 195,
    variant: "24-ore",
    vendor: "synevo",
  },
  {
    lab: "Sante",
    price_mdl: 175,
    variant: "cantitativ",
    vendor: "sante",
  },
  { lab: "Alfa", price_mdl: 190, variant: null, vendor: "alfa" },
  { lab: "Invitro", price_mdl: 210, variant: null, vendor: "invitro" },
] as const;

/** Deprecated demo — kept for type compat, do not use in PriceComparison */
export const PRICE_COMPARISON: PriceRow[] = [
  {
    collectionFee: 15,
    highlight: true,
    lab: "Laborata — preț agregat",
    price: 33,
  },
  {
    collectionFee: 12,
    lab: "Synevo",
    note: "12 lei / vizită, inclus la final",
    price: 52,
  },
  {
    collectionFee: 12,
    lab: "MedLife",
    note: "12 lei taxă recoltare",
    price: 58,
  },
  {
    collectionFee: 15,
    lab: "Regina Maria",
    note: "15 lei recoltare",
    price: 49,
  },
  {
    collectionFee: 10,
    lab: "Bioclinica",
    note: "10 lei la checkout",
    price: 55,
  },
  {
    collectionFee: 18,
    lab: "Medicover",
    note: "18 lei taxă laborator / comandă",
    price: 62,
  },
  {
    collectionFee: 60,
    lab: "Ulta Lab Tests",
    note: "exemplu comparație internațională",
    price: 135,
  },
];

/** Spec honesty mock — 91% specimen, 69% method, 53% collection_protocol, 93% TAT, 6.9% ref ranges */
export const SPEC_OFFERS_B12: readonly SpecOffer[] = [
  {
    collection_protocol: "Preferabil dimineața, à jeun 8h — ser",
    lab: "Synevo",
    method: "clia",
    reference_ranges: [
      { analyte: "Vitamina B12", range: "200–1100", unit: "pg/mL" },
    ],
    specimen: "blood",
    turnaround: "1 zi",
    turnaround_max_days: 1,
    turnaround_min_days: 1,
    vendor: "synevo",
  },
  {
    collection_protocol: null,
    lab: "Sante",
    method: null,
    reference_ranges: [],
    specimen: "blood",
    turnaround: "14 zile lucrătoare",
    turnaround_max_days: 14,
    turnaround_min_days: 14,
    vendor: "sante",
  },
  {
    collection_protocol: "À jeun recomandat",
    lab: "Invitro",
    method: "clia",
    reference_ranges: [],
    specimen: "blood",
    turnaround: "1 zi",
    turnaround_max_days: 1,
    turnaround_min_days: 1,
    vendor: "invitro",
  },
  {
    collection_protocol: null,
    lab: "Alfa",
    method: "clia",
    reference_ranges: [],
    specimen: "blood",
    turnaround: "1 zi",
    turnaround_max_days: 1,
    turnaround_min_days: 1,
    vendor: "alfa",
  },
  {
    collection_protocol: null,
    lab: "MedExpert",
    method: null,
    reference_ranges: [],
    specimen: null,
    turnaround: null,
    turnaround_max_days: null,
    turnaround_min_days: null,
    vendor: "medexpert",
  },
] as const;

export const SPEC_ROWS = [
  { label: "Probă", value: "Ser sau plasmă" },
  { label: "Măsoară", value: "Concentrație masică" },
  { label: "Biomarkeri raportați", value: "Vitamina B12" },
  { label: "Număr biomarkeri", value: "1 biomarker" },
  { label: "Pregătire", value: "Nespecifică — unele rețele recomandă à jeun" },
  {
    label: "Rezultate",
    value: "În dashboard Laborata în 1 zi, cu interval explicat",
  },
] as const;

export const FAQ_ITEMS = [
  {
    answer:
      "Măsoară vitamina B12 totală circulantă în sânge. Nu evaluează direct funcția intracelulară a vitaminei.",
    question: "Ce măsoară acest test?",
    value: "ce-masoara",
  },
  {
    answer:
      "Da. Simptomele neurologice (furnicături, oboseală) pot apărea înainte ca hemoleucograma să arate anemie.",
    question: "Poate exista deficit fără anemie?",
    value: "anemie",
  },
  {
    answer:
      "Valoarea 200–350 pg/mL e considerată nedeterminată în multe ghiduri. Se recomandă MMA sau homocisteină pentru clarificare.",
    question: "Ce se întâmplă dacă rezultatul e la limită?",
    value: "limita",
  },
  {
    answer:
      "Nu. Folatul se testează separat. Ambele influențează metabolismul homocisteinei.",
    question: "Folatul este inclus?",
    value: "folat-inclus",
  },
  {
    answer:
      "Da. Suplimentele orale sau injecțiile pot crește artificial B12 chiar și cu deficit funcțional. Menționează-le la recoltare.",
    question: "Suplimentele pot masca rezultatul?",
    value: "suplimente",
  },
  {
    answer:
      "Acest produs raportează pg/mL (LOINC 2132-9). Nu amesteca valori în pmol/L fără conversie validată; afișează mereu unitatea sursă.",
    question: "pg/mL sau pmol/L?",
    value: "unitati",
  },
  {
    answer:
      "Nu obligatoriu pentru B12, dar unele laboratoare cer à jeun 8–12h.",
    question: "Trebuie să fiu à jeun?",
    value: "recoltare",
  },
  {
    answer:
      "Rezultatul vine cu interval explicat și, dacă ai cont Laborata, cu o notă clinică ce corelează istoricul și simptomele.",
    question: "Cine interpretează rezultatul?",
    value: "interpretare",
  },
] as const;
