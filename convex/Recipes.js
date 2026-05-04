import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create recipe
export const CreateRecipe = mutation({
  args: {
    jsonData: v.any(),
    imageURI: v.string(),
    recipeName: v.string(),
    uid: v.id("users"),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("recipes", args);
    return id;
  },
});

// Get all recipes
export const GetAllRecipes = query({
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    return recipes;
  },
});

// Get recipe by ID
export const GetRecipeById = query({
  args: {
    id: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    return recipe;
  },
});

// Get user's recipes
export const GetUserRecipes = query({
  args: {
    uid: v.id("users"),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .collect();

    return recipes;
  },
});