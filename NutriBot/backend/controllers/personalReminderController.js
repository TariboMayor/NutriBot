const personalReminderService = require("../services/personalReminderService");

function getUserId(req) {
  return (
    req.user?.id ||
    req.user?.userId ||
    req.user?.user_id
  );
}

function createPersonalReminder(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "User authentication required",
    });
  }

  const {
    title,
    description,
    reminder_type,
    scheduled_for,
    frequency,
  } = req.body;

  if (!title || !scheduled_for) {
    return res.status(400).json({
      message: "Title and scheduled time are required",
    });
  }

  personalReminderService.createPersonalReminder(
    userId,
    {
      title,
      description,
      reminder_type,
      scheduled_for,
      frequency,
    },
    (error, result) => {
      if (error) {
        console.error(
          "Create personal reminder error:",
          error.message
        );

        return res.status(500).json({
          message: "Failed to create personal reminder",
        });
      }

      return res.status(201).json(result);
    }
  );
}

function getMyPersonalReminders(req, res) {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: "User authentication required",
    });
  }

  personalReminderService.getPersonalReminders(
    userId,
    (error, reminders) => {
      if (error) {
        console.error(
          "Get personal reminders error:",
          error.message
        );

        return res.status(500).json({
          message: "Failed to get personal reminders",
        });
      }

      return res.json(reminders);
    }
  );
}

function completePersonalReminder(req, res) {
  const userId = getUserId(req);
  const reminderId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      message: "User authentication required",
    });
  }

  personalReminderService.completePersonalReminder(
    userId,
    reminderId,
    (error, result) => {
      if (error) {
        console.error(
          "Complete personal reminder error:",
          error.message
        );

        return res.status(400).json({
          message: error.message,
        });
      }

      return res.json(result);
    }
  );
}

function cancelPersonalReminder(req, res) {
  const userId = getUserId(req);
  const reminderId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      message: "User authentication required",
    });
  }

  personalReminderService.cancelPersonalReminder(
    userId,
    reminderId,
    (error, result) => {
      if (error) {
        console.error(
          "Cancel personal reminder error:",
          error.message
        );

        return res.status(400).json({
          message: error.message,
        });
      }

      return res.json(result);
    }
  );
}

module.exports = {
  createPersonalReminder,
  getMyPersonalReminders,
  completePersonalReminder,
  cancelPersonalReminder,
};
