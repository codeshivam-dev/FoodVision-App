import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateNewUser = mutation({
    args: {
        email: v.string(),
        name: v.string()
    },
    handler: async (ctx, args) => {
        // Find user by email
        const existing = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("email"), args.email))
            .collect();

        if (existing.length === 0) {
            // Create new user
            const data = {
                name: args.name,
                email: args.email,
                credits: 10,
                role: args.email.includes('nutri') ? 'nutritionist' : 'user'
            };

            const id = await ctx.db.insert("users", data);

            return { _id: id, ...data };
        }

        return existing[0];
    }
});

export const GetUser = query({
    args: {
        email: v.string()
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .filter(q => q.eq(q.field("email"), args.email))
            .collect();
        return existing[0];
    }
})

export const UpdateUserRole = mutation({
    args: {
        uid: v.id('users'),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.uid, { role: args.role });
    }
})

export const UpdateUserPref = mutation({
    args: {
        uid: v.id("users"),
        height: v.string(),
        weight: v.string(),
        gender: v.string(),
        goal: v.string(),
        age: v.optional(v.string()),
        calories: v.optional(v.number()),
        proteins: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.patch(args.uid, {
            height: args.height,
            weight: args.weight,
            gender: args.gender,
            goal: args.goal,
            age: args.age,
            calories: args.calories,
            proteins: args.proteins
        });
        return result;
    }
})

export const UpdateUserProfile = mutation({
    args: {
        uid: v.id("users"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        age: v.optional(v.string()),
        height: v.optional(v.string()),
        weight: v.optional(v.string()),
        gender: v.optional(v.string()),
        goal: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const updateData = {};
        if (args.name !== undefined) updateData.name = args.name;
        if (args.email !== undefined) updateData.email = args.email;
        if (args.age !== undefined) updateData.age = args.age;
        if (args.height !== undefined) updateData.height = args.height;
        if (args.weight !== undefined) updateData.weight = args.weight;
        if (args.gender !== undefined) updateData.gender = args.gender;
        if (args.goal !== undefined) updateData.goal = args.goal;

        await ctx.db.patch(args.uid, updateData);
        return updateData;
    }
})
