/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as catalog from "../catalog.js";
import type * as categories from "../categories.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as orders from "../orders.js";
import type * as permissions from "../permissions.js";
import type * as pricing from "../pricing.js";
import type * as productImages from "../productImages.js";
import type * as products from "../products.js";
import type * as reviews from "../reviews.js";
import type * as userFunctions from "../userFunctions.js";
import type * as wishlist from "../wishlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  admin: typeof admin;
  auth: typeof auth;
  cart: typeof cart;
  catalog: typeof catalog;
  categories: typeof categories;
  helpers: typeof helpers;
  http: typeof http;
  orders: typeof orders;
  permissions: typeof permissions;
  pricing: typeof pricing;
  productImages: typeof productImages;
  products: typeof products;
  reviews: typeof reviews;
  userFunctions: typeof userFunctions;
  wishlist: typeof wishlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
