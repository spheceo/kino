import { query } from "./_generated/server";

export const getCurrentUserIdentity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});
