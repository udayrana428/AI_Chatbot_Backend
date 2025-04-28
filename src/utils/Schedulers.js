import cron from "node-cron";
import { Guest } from "../models/guest.model.js";

// Runs every day at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // 30 days ago

    const deleted = await Guest.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
    });

    console.log(`[CLEANUP] Deleted ${deleted.deletedCount} old guest records.`);
  } catch (error) {
    console.error("Error cleaning guest records:", error);
  }
});
