import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every day at midnight to clean expired slots
crons.interval(
  "clean-expired-slots",
  { hours: 24 },
  internal.slots.cleanExpiredSlots
);

// Run every 6 hours to ensure nutritionists have enough slots
crons.interval(
  "ensure-slots-for-all",
  { hours: 6 },
  internal.slots.ensureAllSlots
);

export default crons;