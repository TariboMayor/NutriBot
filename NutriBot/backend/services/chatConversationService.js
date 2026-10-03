const db = require("../config/db");

const createConversation = (
  userId,
  title = "New Conversation"
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      INSERT INTO chat_conversations
      (user_id, title)
      VALUES (?, ?)
      `,
      [userId, title],
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        db.query(
          `
          SELECT
            id,
            user_id,
            title,
            created_at,
            updated_at
          FROM chat_conversations
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

const getUserConversations = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT
        c.id,
        c.user_id,
        c.title,
        c.created_at,
        c.updated_at,

        (
          SELECT cm.content
          FROM chat_messages cm
          WHERE cm.conversation_id = c.id
          ORDER BY cm.created_at DESC, cm.id DESC
          LIMIT 1
        ) AS last_message

      FROM chat_conversations c

      WHERE c.user_id = ?

      ORDER BY c.updated_at DESC, c.id DESC
      `,
      [userId],
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

const getConversationById = (
  conversationId,
  userId
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      SELECT
        id,
        user_id,
        title,
        created_at,
        updated_at
      FROM chat_conversations
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [conversationId, userId],
      (error, results) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(results[0] || null);
      }
    );
  });
};

const deleteConversation = (
  conversationId,
  userId
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      DELETE FROM chat_conversations
      WHERE id = ?
        AND user_id = ?
      `,
      [conversationId, userId],
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result.affectedRows > 0);
      }
    );
  });
};

const updateConversationTitle = (
  conversationId,
  userId,
  title
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      UPDATE chat_conversations
      SET title = ?
      WHERE id = ?
        AND user_id = ?
      `,
      [title, conversationId, userId],
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      }
    );
  });
};

const touchConversation = (
  conversationId,
  userId
) => {
  return new Promise((resolve, reject) => {
    db.query(
      `
      UPDATE chat_conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND user_id = ?
      `,
      [conversationId, userId],
      (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      }
    );
  });
};

module.exports = {
  createConversation,
  getUserConversations,
  getConversationById,
  deleteConversation,
  updateConversationTitle,
  touchConversation,
};