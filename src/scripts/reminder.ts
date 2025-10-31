import cron from "node-cron";

export const reminderSchedule = () => {
  cron.schedule("*/5 * * * * *", () => {
    // add logic here
    console.log("running task");
  });
};
