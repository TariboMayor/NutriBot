const db = require("../config/db");

const createMessage = (
  conversationId,
  role,
  content
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      INSERT INTO chat_messages
      (conversation_id, role, content)
      VALUES (?, ?, ?)
      `,
      [conversationId, role, content],
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        db.query(
          `
          SELECT
            id,
            conversation_id,
            role,
            content,
            created_at
          FROM chat_messages
          WHERE id = ?
          `,
          [result.insertId],
          (selectError, rows) => {
            if (selectError) {
              reject(selectError);
              return;
            }

            resolve(rows[0]);
          }
        );
      }
    );
  });
};

const getConversationMessages = (
  conversationId
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT
        id,
        conversation_id,
        role,
        content,
        created_at
      FROM chat_messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC, id ASC
      `,
      [conversationId],
      (error, results) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(results);
      }
    );
  });
};

const getRecentMessages = (
  conversationId,
  limit = 12
) => {
  return new Promise((resolve, reject) => {
    const safeLimit = Math.max(
      1,
      Math.min(Number(limit) || 12, 30)
    );

    db.query(
      `
      SELECT
        role,
        content,
        created_at
      FROM chat_messages
      WHERE conversation_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT ${safeLimit}
      `,
      [conversationId],
      (error, results) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(results.reverse());
      }
    );
  });
};

module.exports = {
  createMessage,
  getConversationMessages,
  getRecentMessages,
};