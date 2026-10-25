import { API_ENDPOINTS } from "constants/apiEndpoints";

/**
 * UK Address & Postcode Service
 *
 * Uses:
 * 1. OpenStreetMap Nominatim for UK street address autocomplete
 *    - Rate-limited to max 1 req/sec per public usage policy
 *    - Spaced & debounced to prevent unnecessary network load
 *    - In-memory client caching
 * 2. Postcodes.io for UK postcode validation & location lookup
 *
 * Endpoints are configured dynamically via environment variables in API_ENDPOINTS:
 * - NEXT_PUBLIC_NOMINATIM_URL
 * - NEXT_PUBLIC_POSTCODES_URL
 */

export interface UkAddressResult {
  id: string;
  displayName: string;
  line1: string;
  line2?: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
  source: "nominatim" | "postcodes.io";
}

export interface PostcodeLookupDetails {
  postcode: string;
  city: string;
  county: string;
  country: string;
  adminDistrict?: string;
  region?: string;
}

// In-memory cache for search queries to avoid duplicate API requests
const searchCache = new Map<string, { timestamp: number; results: UkAddressResult[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// Nominatim Rate Limiter (enforces min 1000ms spacing between network calls per usage policy)
let lastNominatimRequestTime = 0;
const NOMINATIM_MIN_INTERVAL_MS = 1000;

/**
 * Standard UK Postcode Regex (BS 7666 compliant format)
 * Covers:
 * - A9 9AA, A99 9AA, AA9 9AA, AA99 9AA, A9A 9AA, AA9A 9AA
 */
const UK_POSTCODE_REGEX =
  /^([Gg][Ii][Rr]\s?0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;

/**
 * Checks if a string conforms to the UK postcode format.
 * Note: Format validation does not guarantee the postcode exists in Royal Mail PAF.
 */
export function isValidUkPostcodeFormat(postcode: string): boolean {
  if (!postcode) return false;
  const trimmed = postcode.trim();
  return UK_POSTCODE_REGEX.test(trimmed);
}

/**
 * Normalizes a UK postcode to standard Royal Mail format:
 * All uppercase with a single space separating outward and inward codes (e.g. 'sw1a1aa' -> 'SW1A 1AA')
 */
export function normalizeUkPostcode(rawPostcode: string): string {
  if (!rawPostcode) return "";
  const cleaned = rawPostcode.trim().toUpperCase().replace(/\s+/g, "");
  if (cleaned.length <= 3) {
    return cleaned;
  }
  const outward = cleaned.slice(0, cleaned.length - 3);
  const inward = cleaned.slice(-3);
  return `${outward} ${inward}`;
}

/**
 * Validates a UK postcode against Postcodes.io database
 */
export async function validatePostcodeWithApi(
  postcode: string,
  signal?: AbortSignal
): Promise<boolean> {
  const normalized = normalizeUkPostcode(postcode);
  if (!isValidUkPostcodeFormat(normalized)) {
    return false;
  }

  try {
    const url = API_ENDPOINTS.ADDRESS.POSTCODE_VALIDATE(normalized);
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });

    if (!res.ok) {
      return isValidUkPostcodeFormat(normalized);
    }

    const data = await res.json();
    return Boolean(data?.result);
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") {
      throw err;
    }
    return isValidUkPostcodeFormat(normalized);
  }
}

/**
 * Looks up detailed location data for a UK postcode using Postcodes.io
 */
export async function lookupPostcodeDetails(
  postcode: string,
  signal?: AbortSignal
): Promise<PostcodeLookupDetails | null> {
  const normalized = normalizeUkPostcode(postcode);
  if (!isValidUkPostcodeFormat(normalized)) {
    return null;
  }

  try {
    const url = API_ENDPOINTS.ADDRESS.POSTCODE_LOOKUP(normalized);
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal,
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const result = data?.result;
    if (!result) return null;

    const dynamicCity =
      result.admin_district ||
      result.parish ||
      result.european_electoral_region ||
      result.region ||
      "";

    const dynamicCounty =
      result.admin_county ||
      result.region ||
      result.admin_district ||
      "";

    const dynamicCountry = result.country || "United Kingdom";

    return {
      postcode: result.postcode || normalized,
      city: dynamicCity,
      county: dynamicCounty,
      country: dynamicCountry,
      adminDistrict: result.admin_district,
      region: result.region,
    };
  } catch (err: unknown) {
    if ((err as Error)?.name === "AbortError") {
      throw err;
    }
    return null;
  }
}

interface NominatimAddress {
  house_number?: string;
  house_name?: string;
  building?: string;
  flats?: string;
  unit?: string;
  road?: string;
  pedestrian?: string;
  footway?: string;
  cycleway?: string;
  path?: string;
  street?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  state?: string;
  region?: string;
  postcode?: string;
  country?: string;
}

interface NominatimItem {
  place_id: number;
  display_name: string;
  name?: string;
  address?: NominatimAddress;
}

/**
 * Dynamically parses a Nominatim address record into standard checkout address fields
 */
function parseNominatimAddress(item: NominatimItem): UkAddressResult {
  const addr = item.address || {};

  // 1. Street Address (Line 1) dynamically parsed
  const building =
    addr.house_number ||
    addr.house_name ||
    addr.building ||
    addr.flats ||
    addr.unit ||
    "";

  const street =
    addr.road ||
    addr.pedestrian ||
    addr.street ||
    addr.footway ||
    addr.cycleway ||
    addr.path ||
    "";

  let line1 = "";
  if (building && street) {
    line1 = `${building} ${street}`;
  } else if (street) {
    line1 = street;
  } else if (building) {
    line1 = building;
  } else if (item.name && item.name !== addr.city && item.name !== addr.postcode) {
    line1 = item.name;
  } else {
    line1 = item.display_name.split(",")[0]?.trim() || "";
  }

  // 2. Line 2 (Optional secondary unit/suburb)
  const line2 =
    addr.suburb ||
    addr.neighbourhood ||
    addr.quarter ||
    addr.city_district ||
    undefined;

  // 3. City / Town dynamically parsed
  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.hamlet ||
    "";

  // 4. County / Region dynamically parsed
  const county =
    addr.county ||
    addr.state_district ||
    addr.region ||
    addr.state ||
    "";

  // 5. Postcode dynamically normalized
  const postalCode = addr.postcode ? normalizeUkPostcode(addr.postcode) : "";

  // 6. Country dynamically parsed
  const country = addr.country || "United Kingdom";

  // Dynamic user-facing label
  const labelParts = [line1, city, county, postalCode].filter(Boolean);
  const displayName = labelParts.length > 0 ? labelParts.join(", ") : item.display_name;

  return {
    id: `osm-${item.place_id}`,
    displayName,
    line1,
    line2,
    city,
    county,
    postalCode,
    country,
    source: "nominatim",
  };
}

/**
 * Searches UK addresses via OpenStreetMap Nominatim and Postcodes.io dynamically
 */
export async function searchUkAddresses(
  rawQuery: string,
  signal?: AbortSignal
): Promise<UkAddressResult[]> {
  const query = rawQuery.trim();
  if (query.length < 3) {
    return [];
  }

  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results;
  }

  // Fast-path: Check if query matches a full UK postcode format
  const isPostcodeQuery = isValidUkPostcodeFormat(query);
  if (isPostcodeQuery) {
    try {
      const pcDetails = await lookupPostcodeDetails(query, signal);
      if (pcDetails) {
        const dynamicParts = [pcDetails.postcode, pcDetails.city, pcDetails.county, pcDetails.country].filter(Boolean);
        const directResult: UkAddressResult = {
          id: `pc-${pcDetails.postcode}`,
          displayName: dynamicParts.join(", "),
          line1: "",
          city: pcDetails.city,
          county: pcDetails.county,
          postalCode: pcDetails.postcode,
          country: pcDetails.country,
          source: "postcodes.io",
        };

        searchCache.set(cacheKey, { timestamp: Date.now(), results: [directResult] });
        return [directResult];
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") throw err;
    }
  }

  // Enforce Nominatim rate limit (minimum 1000ms spacing between calls)
  const now = Date.now();
  const timeSinceLastRequest = now - lastNominatimRequestTime;
  if (timeSinceLastRequest < NOMINATIM_MIN_INTERVAL_MS) {
    const delayNeeded = NOMINATIM_MIN_INTERVAL_MS - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, delayNeeded));
  }
  lastNominatimRequestTime = Date.now();

  const url = API_ENDPOINTS.ADDRESS.NOMINATIM_SEARCH({
    q: query,
    format: "jsonv2",
    addressdetails: 1,
    countrycodes: "gb",
    limit: 6,
    "accept-language": "en-GB,en",
  });

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "Address search rate limit reached. Please enter your address manually or try again in a moment."
      );
    }
    throw new Error(
      `Address search service returned status ${response.status}. Please enter address manually.`
    );
  }

  const items: NominatimItem[] = await response.json();
  const results = items.map(parseNominatimAddress);

  // Keep in cache
  searchCache.set(cacheKey, { timestamp: Date.now(), results });
  return results;
}

/**
 * Centralized service object following project standard conventions
 */
export const ukAddressService = {
  search: searchUkAddresses,
  lookupPostcode: lookupPostcodeDetails,
  validatePostcode: validatePostcodeWithApi,
  isValidFormat: isValidUkPostcodeFormat,
  normalizePostcode: normalizeUkPostcode,
};
