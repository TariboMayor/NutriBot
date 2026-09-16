const db = require("../config/db");

const getFoods = (req, res) => {
  const sql = "SELECT * FROM food_tbl";

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching foods:", error);

      return res.status(500).json({
        message: "Could not fetch foods.",
      });
    }

    res.json(results);
  });
};

module.exports = {
  getFoods,
};