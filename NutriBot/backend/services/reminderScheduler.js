const reminderProcessor = require("./reminderProcessor");

const startReminderScheduler = () => {
  console.log("Reminder scheduler started.");

  const processReminders = () => {
    reminderProcessor.processDueReminders((error, result) => {
      if (error) {
        console.error(
          "Reminder scheduler error:",
          error.message
        );

        return;
      }

      if (result.processed > 0 || result.failed > 0) {
        console.log(
          `Reminder scheduler: processed ${result.processed}, failed ${result.failed}`
        );
      }
    });
  };

  // Check immediately when the server starts.
  processReminders();

  // Then check every minute.
  setInterval(processReminders, 60 * 1000);
};

module.exports = {
  startReminderScheduler,
};