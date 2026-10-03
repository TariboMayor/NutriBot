require("dotenv").config();

const db = require("../config/db");

const {
  geocodeAddress,
} = require("../services/geocodingService");

const geocodeHospitals = async () => {
  console.log("Starting hospital geocoding...");

  db.query(
    `
      SELECT
        id,
        name,
        address,
        city,
        state,
        country
      FROM hospitals
      WHERE
        latitude IS NULL
        OR longitude IS NULL
    `,
    async (error, hospitals) => {
      if (error) {
        console.error(
          "Failed to get hospitals:",
          error.message
        );

        process.exit(1);
      }

      if (hospitals.length === 0) {
        console.log(
          "All hospitals already have coordinates."
        );

        process.exit(0);
      }

      console.log(
        `Found ${hospitals.length} hospital(s) without coordinates.`
      );

      for (const hospital of hospitals) {
        try {
          console.log(
            `\nGeocoding: ${hospital.name}`
          );

          const location =
            await geocodeAddress({
              address: hospital.address,
              city: hospital.city,
              state: hospital.state,
              country: hospital.country,
            });

          db.query(
            `
              UPDATE hospitals
              SET
                latitude = ?,
                longitude = ?
              WHERE id = ?
            `,
            [
              location.latitude,
              location.longitude,
              hospital.id,
            ],
            (updateError) => {
              if (updateError) {
                console.error(
                  `Failed to update ${hospital.name}:`,
                  updateError.message
                );
                return;
              }

              console.log(
                `✓ ${hospital.name}`
              );

              console.log(
                `  Latitude: ${location.latitude}`
              );

              console.log(
                `  Longitude: ${location.longitude}`
              );

              console.log(
                `  Address: ${location.formattedAddress}`
              );
            }
          );
        } catch (geocodeError) {
          console.error(
            `✗ Could not geocode ${hospital.name}:`,
            geocodeError.message
          );
        }
      }

      setTimeout(() => {
        console.log(
          "\nHospital geocoding finished."
        );

        process.exit(0);
      }, 1000);
    }
  );
};

geocodeHospitals();
