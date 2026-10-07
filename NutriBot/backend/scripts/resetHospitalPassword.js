
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const EMAIL = "staff@testhospital.com";
const NEW_PASSWORD = "Hospital@123";

async function resetHospitalPassword() {
  try {
    const hashedPassword = await bcrypt.hash(
      NEW_PASSWORD,
      10
    );

    const sql = `
      UPDATE users_tbl
      SET password = ?
      WHERE email = ?
    `;

    db.query(
      sql,
      [hashedPassword, EMAIL],
      (error, result) => {
        if (error) {
          console.error(
            "Password reset error:",
            error.message
          );

          process.exit(1);
        }

        if (result.affectedRows === 0) {
          console.error(
            `No user found with email: ${EMAIL}`
          );

          process.exit(1);
        }

        console.log(
          "Hospital staff password reset successfully."
        );

        console.log(`Email: ${EMAIL}`);
        console.log(
          `New password: ${NEW_PASSWORD}`
        );

        process.exit(0);
      }
    );
  } catch (error) {
    console.error(
      "Password reset error:",
      error.message
    );

    process.exit(1);
  }
}

resetHospitalPassword();
