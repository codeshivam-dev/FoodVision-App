/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as Consultations from "../Consultations.js";
import type * as Crons from "../Crons.js";
import type * as ExpertDietPlans from "../ExpertDietPlans.js";
import type * as MealPlan from "../MealPlan.js";
import type * as Nutritionists from "../Nutritionists.js";
import type * as PreConsultationForms from "../PreConsultationForms.js";
import type * as Recipes from "../Recipes.js";
import type * as Sessions from "../Sessions.js";
import type * as Slots from "../Slots.js";
import type * as Users from "../Users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  Consultations: typeof Consultations;
  Crons: typeof Crons;
  ExpertDietPlans: typeof ExpertDietPlans;
  MealPlan: typeof MealPlan;
  Nutritionists: typeof Nutritionists;
  PreConsultationForms: typeof PreConsultationForms;
  Recipes: typeof Recipes;
  Sessions: typeof Sessions;
  Slots: typeof Slots;
  Users: typeof Users;
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
