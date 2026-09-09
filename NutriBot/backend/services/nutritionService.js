const db = require("../config/db");

const getNutritionByTopic = (topic) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM nutrition_knowledge_tbl WHERE topic = ?",
      [topic],
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

module.exports = { getNutritionByTopic };