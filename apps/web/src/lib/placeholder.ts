import { BRANCHES } from "@workspace/data/branches";
import { CATALOG, TESTS } from "@workspace/data/canonical";
import { LABS } from "@workspace/data/types";

// Real data — 417 comparison / 7033 catalog, 145 branches
export { LABS };
export const BRANCHES_REAL = BRANCHES;
export const TESTS_REAL = TESTS;
export const CATALOG_REAL = CATALOG;

// Preferred exports
export const BRANCHES_DATA = BRANCHES;
export const TESTS_DATA = TESTS;
export const CATALOG_DATA = CATALOG;

// Deprecated aliases — keep for W2/W3 migration, will be removed after
/** @deprecated use TESTS_REAL from @workspace/data/canonical */
export const MOCK_TESTS = TESTS;
/** @deprecated use BRANCHES from @workspace/data/branches */
export const MOCK_BRANCHES = BRANCHES;
