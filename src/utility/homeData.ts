import { catalogService, offersService, type Category, type Coupon, type Domain, type Product } from "utility/services";

/**
 * Home page data store (stale-while-revalidate).
 *
 * The data is kept in memory for the whole browser session, so going to another page and back shows the
 * home page instantly with no loading state and no request. If the copy is older than the TTL it is
 * still shown straight away and refreshed quietly in the background. A full page refresh starts clean.
 */

export type HomeData = {
  categories: Category[];
  products: Product[];
  domains: Domain[];
  offers: Coupon[];
};

const FRESH_FOR_MS = 5 * 60 * 1000;

let cache: { data: HomeData; at: number } | null = null;
let inFlight: Promise<HomeData> | null = null;

/** The last loaded data (even if stale), or null when nothing was loaded yet. */
export const getCachedHomeData = (): HomeData | null => cache?.data ?? null;

/** True when the cached copy is recent enough that no request is needed. */
export const isHomeDataFresh = (): boolean => !!cache && Date.now() - cache.at < FRESH_FOR_MS;

/** Drop the cache (e.g. after an admin change) so the next visit loads fresh data. */
export const invalidateHomeData = () => {
  cache = null;
};

/** Loads the home data once; concurrent callers share the same request. */
export function loadHomeData(): Promise<HomeData> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const [categories, productsRes, domains] = await Promise.all([
      catalogService.listRootCategories(),
      catalogService.listProducts(),
      catalogService.listDomains(),
    ]);

    const domainIds = [...new Set((domains || []).map((d) => d._id))];
    const offersByDomain = await Promise.all(domainIds.map((id) => offersService.listActive(id).catch(() => [] as Coupon[])));

    const data: HomeData = {
      categories: categories || [],
      products: productsRes?.items || [],
      domains: domains || [],
      offers: offersByDomain.flat(),
    };
    cache = { data, at: Date.now() };
    return data;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
