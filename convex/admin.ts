import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { assertAdmin, getUserProfile } from "./permissions";

export {
  create as createCategory,
  listAdmin as listAdminCategories,
  remove as removeCategory,
  update as updateCategory,
} from "./categories";

export {
  create as createProduct,
  generateUploadUrl,
  getAdminById as getAdminProductById,
  listAdmin as listAdminProducts,
  remove as removeProduct,
  update as updateProduct,
} from "./products";

export {
  listAdmin as listAdminOrders,
  updateStatus as updateOrderStatus,
} from "./orders";

export {
  listPending as listPendingReviews,
  updateStatus as updateReviewStatus,
} from "./reviews";

export const promoteToAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Kullanici bulunamadi");
    }

    const profile = await getUserProfile(ctx, args.userId);
    
    if (profile) {
      if (profile.role === "admin") {
        throw new Error("Kullanici zaten admin");
      }
      await ctx.db.patch(profile._id, {
        role: "admin",
        updatedAt: Date.now(),
      });
    } else {
      const now = Date.now();
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const demoteFromAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId: currentUserId } = await assertAdmin(ctx);

    if (currentUserId === args.userId) {
      throw new Error("Kendi yetkinizi kaldiramazsiniz");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Kullanici bulunamadi");
    }

    const profile = await getUserProfile(ctx, args.userId);
    
    if (!profile || profile.role !== "admin") {
      throw new Error("Kullanici zaten admin degil");
    }

    await ctx.db.patch(profile._id, {
      role: "customer",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const listAdmins = query({
  args: {},
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const adminProfiles = await ctx.db
      .query("userProfiles")
      .withIndex("role", (q) => q.eq("role", "admin"))
      .collect();

    const admins = await Promise.all(
      adminProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          userId: profile.userId,
          email: user?.email ?? "",
          name: user?.name ?? "",
          fullName: profile.fullName,
          createdAt: profile.createdAt,
        };
      }),
    );

    return admins.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createInitialAdmin = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Kullanici bulunamadi");
    }

    const profile = await getUserProfile(ctx, user._id);
    
    if (profile) {
      if (profile.role === "admin") {
        return { message: "Kullanici zaten admin" };
      }
      await ctx.db.patch(profile._id, {
        role: "admin",
        updatedAt: Date.now(),
      });
    } else {
      const now = Date.now();
      await ctx.db.insert("userProfiles", {
        userId: user._id,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    }

    return { message: "Admin olusturuldu" };
  },
});
