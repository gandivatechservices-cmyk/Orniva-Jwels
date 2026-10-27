import { getCountryDataList, getEmojiFlag, type TCountryCode } from "countries-list";

export interface CountryDialOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Popular luxury & international markets for high-priority quick selection
export const POPULAR_COUNTRY_CODES = [
  "GB", // United Kingdom (Orniva UK Flagship)
  "IN", // India (Heritage atelier)
  "US", // United States
  "AE", // United Arab Emirates (Dubai)
  "CA", // Canada
  "AU", // Australia
  "SG", // Singapore
  "QA", // Qatar
  "SA", // Saudi Arabia
  "KW", // Kuwait
  "DE", // Germany
  "FR", // France
  "CH", // Switzerland
  "IT", // Italy
] as const;

/**
 * Full worldwide country list covering 250+ countries and territories,
 * sorted alphabetically by country name.
 */
export const WORLDWIDE_COUNTRIES: CountryDialOption[] = getCountryDataList()
  .filter((c) => Array.isArray(c.phone) && c.phone.length > 0 && typeof c.phone[0] === "number")
  .map((c) => {
    let flag = "🌐";
    try {
      flag = getEmojiFlag(c.iso2 as TCountryCode) || "🌐";
    } catch {
      flag = "🌐";
    }
    return {
      code: c.iso2,
      name: c.name,
      dialCode: `+${c.phone[0]}`,
      flag,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Popular countries subset for quick access in dropdowns.
 */
export const POPULAR_COUNTRIES: CountryDialOption[] = POPULAR_COUNTRY_CODES
  .map((code) => WORLDWIDE_COUNTRIES.find((c) => c.code === code))
  .filter((c): c is CountryDialOption => Boolean(c));

/**
 * Lookup helper to find a country by ISO code with fallback to GB (+44)
 */
export function getCountryByCode(code?: string): CountryDialOption {
  if (!code) {
    return {
      code: "GB",
      name: "United Kingdom",
      dialCode: "+44",
      flag: "🇬🇧",
    };
  }
  return (
    WORLDWIDE_COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || {
      code: "GB",
      name: "United Kingdom",
      dialCode: "+44",
      flag: "🇬🇧",
    }
  );
}
