const db = require("../config/db");

const {
  geocodeAddress,
} = require("../services/geocodingService");

/* ========================================
   CREATE HOSPITAL
======================================== */

const createHospital = (req, res) => {
  const {
    name,
    phone,
    email,
    address,
    city,
    state,
    country,
    description,
    website,
    latitude,
    longitude,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Hospital name is required",
    });
  }

  const sql = `
    INSERT INTO hospitals (
      name,
      phone,
      email,
      address,
      latitude,
      longitude,
      city,
      state,
      country,
      description,
      website,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'REGISTERED')
  `;

  const values = [
    name,
    phone || null,
    email || null,
    address || null,
    latitude || null,
    longitude || null,
    city || null,
    state || null,
    country || "Nigeria",
    description || null,
    website || null,
  ];

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error(
        "Create hospital error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to create hospital",
      });
    }

    res.status(201).json({
      message: "Hospital registered successfully",
      hospitalId: result.insertId,
    });
  });
};

/* ========================================
   GET ALL HOSPITALS
======================================== */

const getHospitals = (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      phone,
      email,
      address,
      latitude,
      longitude,
      city,
      state,
      country,
      description,
      website,
      status
    FROM hospitals
    WHERE status = 'REGISTERED'
    ORDER BY name ASC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error(
        "Get hospitals error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to get hospitals",
      });
    }

    res.json(results);
  });
};

/* ========================================
   SEARCH HOSPITALS BY LOCATION
======================================== */

const searchHospitals = async (req, res) => {
  try {
    const {
      state,
      city,
      area,
      address,
      country = "Nigeria",
    } = req.query;

    if (!state && !city && !area && !address) {
      return res.status(400).json({
        message:
          "Please provide a location or address.",
      });
    }

    /* ----------------------------------------
       Convert patient's address into coordinates
    ---------------------------------------- */

    const patientLocation =
      await geocodeAddress({
        state,
        city,
        area,
        address,
        country,
      });

    const patientLatitude =
      Number(patientLocation.latitude);

    const patientLongitude =
      Number(patientLocation.longitude);

    /* ----------------------------------------
       Get hospitals that have coordinates
    ---------------------------------------- */

    const sql = `
      SELECT
        id,
        name,
        phone,
        email,
        address,
        latitude,
        longitude,
        city,
        state,
        country,
        description,
        website,
        status,

        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,
                COS(RADIANS(?))
                *
                COS(RADIANS(latitude))
                *
                COS(
                  RADIANS(longitude)
                  - RADIANS(?)
                )
                +
                SIN(RADIANS(?))
                *
                SIN(RADIANS(latitude))
              )
            )
          )
        ) AS distance_km

      FROM hospitals

      WHERE
        status IN ('REGISTERED', 'VERIFIED', 'CONNECTED')
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL

      ORDER BY distance_km ASC
    `;

    db.query(
      sql,
      [
        patientLatitude,
        patientLongitude,
        patientLatitude,
      ],
      (error, hospitals) => {
        if (error) {
          console.error(
            "Hospital location search error:",
            error.message
          );

          return res.status(500).json({
            message:
              "Failed to search hospitals.",
          });
        }

        const formattedHospitals =
          hospitals.map((hospital) => ({
            ...hospital,

            distance_km: Number(
              hospital.distance_km
            ),

            distance_text:
              hospital.distance_km < 1
                ? `${Math.round(
                    hospital.distance_km * 1000
                  )} m away`
                : `${Number(
                    hospital.distance_km
                  ).toFixed(1)} km away`,
          }));

        return res.json({
          location: {
            latitude: patientLatitude,
            longitude: patientLongitude,
            formattedAddress:
              patientLocation.formattedAddress,
          },

          count: formattedHospitals.length,

          hospitals: formattedHospitals,
        });
      }
    );
  } catch (error) {
    console.error(
      "Hospital search error:",
      error.message
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to search hospitals.",
    });
  }
};

/* ========================================
   GET HOSPITAL BY ID
======================================== */

const getHospital = (req, res) => {
  const hospitalId = req.params.id;

  const sql = `
    SELECT
      id,
      name,
      phone,
      email,
      address,
      latitude,
      longitude,
      city,
      state,
      country,
      description,
      website,
      status,
      created_at,
      updated_at
    FROM hospitals
    WHERE id = ?
  `;

  db.query(
    sql,
    [hospitalId],
    (error, results) => {
      if (error) {
        console.error(
          "Get hospital error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to get hospital",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Hospital not found",
        });
      }

      res.json(results[0]);
    }
  );
};

/* ========================================
   UPDATE HOSPITAL
======================================== */

const updateHospital = (req, res) => {
  const hospitalId = req.params.id;

  const {
    name,
    phone,
    email,
    address,
    latitude,
    longitude,
    city,
    state,
    country,
    description,
    website,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Hospital name is required",
    });
  }

  const sql = `
    UPDATE hospitals
    SET
      name = ?,
      phone = ?,
      email = ?,
      address = ?,
      latitude = ?,
      longitude = ?,
      city = ?,
      state = ?,
      country = ?,
      description = ?,
      website = ?
    WHERE id = ?
  `;

  const values = [
    name,
    phone || null,
    email || null,
    address || null,
    latitude || null,
    longitude || null,
    city || null,
    state || null,
    country || "Nigeria",
    description || null,
    website || null,
    hospitalId,
  ];

  db.query(
    sql,
    values,
    (error, result) => {
      if (error) {
        console.error(
          "Update hospital error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to update hospital",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Hospital not found",
        });
      }

      res.json({
        message:
          "Hospital updated successfully",
      });
    }
  );
};

/* ========================================
   EXPORTS
======================================== */

module.exports = {
  createHospital,
  getHospitals,
  searchHospitals,
  getHospital,
  updateHospital,
};
