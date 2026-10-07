const db = require("../config/db");

const getStaffHospital = (userId, callback) => {
  const sql = `
    SELECT
      hs.hospital_id,
      hs.staff_role,
      h.name AS hospital_name
    FROM hospital_staff hs
    INNER JOIN hospitals h
      ON hs.hospital_id = h.id
    WHERE hs.user_id = ?
      AND hs.status = 'ACTIVE'
    ORDER BY hs.id ASC
    LIMIT 1
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      return callback(error, null);
    }

    if (results.length === 0) {
      return callback(null, null);
    }

    callback(null, results[0]);
  });
};


/*
 * Add a medical service to the logged-in hospital.
 *
 * HOSPITAL_STAFF:
 * - hospital_id comes from hospital_staff.
 *
 * ADMIN:
 * - hospital_id can be supplied in the request.
 */
const addHospitalService = (req, res) => {
  const {
    hospital_id,
    service_id,
    duration_minutes,
    price,
  } = req.body;


  if (!service_id) {
    return res.status(400).json({
      message: "service_id is required",
    });
  }


  const createService = (hospitalId) => {
    const sql = `
      INSERT INTO hospital_services (
        hospital_id,
        service_id,
        duration_minutes,
        price,
        status
      )
      VALUES (?, ?, ?, ?, 'ACTIVE')
    `;

    const values = [
      hospitalId,
      service_id,
      duration_minutes || 30,
      price ?? null,
    ];


    db.query(
      sql,
      values,
      (error, result) => {
        if (error) {
          console.error(
            "Add hospital service error:",
            error.message
          );


          if (
            error.code ===
            "ER_DUP_ENTRY"
          ) {
            return res.status(409).json({
              message:
                "This service is already added to the hospital",
            });
          }


          return res.status(500).json({
            message:
              "Failed to add hospital service",
          });
        }


        res.status(201).json({
          message:
            "Hospital service added successfully",
          hospitalServiceId:
            result.insertId,
        });
      }
    );
  };


  /*
   * ADMIN can specify the hospital.
   */
  if (req.user?.role === "ADMIN") {
    if (!hospital_id) {
      return res.status(400).json({
        message:
          "hospital_id is required for administrators",
      });
    }

    return createService(hospital_id);
  }


  /*
   * HOSPITAL_STAFF gets hospital from
   * the authenticated account.
   */
  getStaffHospital(
    req.user.id,
    (error, staffHospital) => {
      if (error) {
        console.error(
          "Find staff hospital error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Unable to determine hospital",
        });
      }


      if (!staffHospital) {
        return res.status(403).json({
          message:
            "You are not assigned to an active hospital",
        });
      }


      createService(
        staffHospital.hospital_id
      );
    }
  );
};


/*
 * Get one hospital service.
 *
 * This is used by the hospital management
 * interface and can also be used when viewing
 * a specific service.
 */
const getHospitalService = (req, res) => {
  const hospitalServiceId =
    req.params.id;


  const sql = `
    SELECT
      hs.id,
      hs.hospital_id,
      h.name AS hospital_name,
      hs.service_id,
      ms.name AS service_name,
      ms.description,
      ms.category,
      hs.duration_minutes,
      hs.price,
      hs.status,
      hs.created_at,
      hs.updated_at
    FROM hospital_services hs
    INNER JOIN hospitals h
      ON hs.hospital_id = h.id
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    WHERE hs.id = ?
  `;


  db.query(
    sql,
    [hospitalServiceId],
    (error, results) => {
      if (error) {
        console.error(
          "Get hospital service error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to get hospital service",
        });
      }


      if (results.length === 0) {
        return res.status(404).json({
          message:
            "Hospital service not found",
        });
      }


      res.json(results[0]);
    }
  );
};


/*
 * Get all services offered by a hospital.
 *
 * This remains available for the patient
 * booking flow.
 */
const getHospitalServices = (
  req,
  res
) => {
  const hospitalId =
    req.params.hospitalId;


  const sql = `
    SELECT
      hs.id,
      hs.hospital_id,
      hs.service_id,
      ms.name AS service_name,
      ms.description,
      ms.category,
      hs.duration_minutes,
      hs.price,
      hs.status,
      hs.created_at,
      hs.updated_at
    FROM hospital_services hs
    INNER JOIN medical_services ms
      ON hs.service_id = ms.id
    WHERE hs.hospital_id = ?
    ORDER BY ms.name ASC
  `;


  db.query(
    sql,
    [hospitalId],
    (error, results) => {
      if (error) {
        console.error(
          "Get hospital services error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Failed to get hospital services",
        });
      }


      res.json(results);
    }
  );
};


/*
 * Get all services belonging to the
 * currently logged-in hospital staff member.
 *
 * This is the endpoint our hospital
 * management page will use.
 */
const getMyHospitalServices = (
  req,
  res
) => {
  getStaffHospital(
    req.user.id,
    (staffError, staffHospital) => {
      if (staffError) {
        console.error(
          "Find staff hospital error:",
          staffError.message
        );

        return res.status(500).json({
          message:
            "Unable to determine hospital",
        });
      }


      if (!staffHospital) {
        return res.status(403).json({
          message:
            "You are not assigned to an active hospital",
        });
      }


      const sql = `
        SELECT
          hs.id,
          hs.hospital_id,
          hs.service_id,
          ms.name AS service_name,
          ms.description,
          ms.category,
          hs.duration_minutes,
          hs.price,
          hs.status,
          hs.created_at,
          hs.updated_at
        FROM hospital_services hs
        INNER JOIN medical_services ms
          ON hs.service_id = ms.id
        WHERE hs.hospital_id = ?
        ORDER BY ms.name ASC
      `;


      db.query(
        sql,
        [staffHospital.hospital_id],
        (error, results) => {
          if (error) {
            console.error(
              "Get my hospital services error:",
              error.message
            );

            return res.status(500).json({
              message:
                "Failed to get hospital services",
            });
          }


          res.json({
            hospital: {
              id:
                staffHospital.hospital_id,
              name:
                staffHospital.hospital_name,
            },

            services: results,
          });
        }
      );
    }
  );
};


/*
 * Update hospital service.
 *
 * Hospital staff can only update services
 * belonging to their own hospital.
 */
const updateHospitalService = (
  req,
  res
) => {
  const hospitalServiceId =
    req.params.id;


  const {
    duration_minutes,
    price,
    status,
  } = req.body;


  if (
    duration_minutes === undefined &&
    price === undefined &&
    status === undefined
  ) {
    return res.status(400).json({
      message:
        "At least one hospital service field is required",
    });
  }


  const updateService = (
    hospitalId = null
  ) => {
    let sql = `
      UPDATE hospital_services
      SET
        duration_minutes = COALESCE(
          ?,
          duration_minutes
        ),
        price = COALESCE(
          ?,
          price
        ),
        status = COALESCE(
          ?,
          status
        )
      WHERE id = ?
    `;


    const values = [
      duration_minutes ?? null,
      price ?? null,
      status ?? null,
      hospitalServiceId,
    ];


    if (hospitalId !== null) {
      sql += `
        AND hospital_id = ?
      `;

      values.push(hospitalId);
    }


    db.query(
      sql,
      values,
      (error, result) => {
        if (error) {
          console.error(
            "Update hospital service error:",
            error.message
          );

          return res.status(500).json({
            message:
              "Failed to update hospital service",
          });
        }


        if (result.affectedRows === 0) {
          return res.status(404).json({
            message:
              "Hospital service not found",
          });
        }


        res.json({
          message:
            "Hospital service updated successfully",
        });
      }
    );
  };


  /*
   * ADMIN can update any service.
   */
  if (req.user?.role === "ADMIN") {
    return updateService();
  }


  /*
   * HOSPITAL_STAFF can only update
   * their own hospital's service.
   */
  getStaffHospital(
    req.user.id,
    (error, staffHospital) => {
      if (error) {
        console.error(
          "Find staff hospital error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Unable to determine hospital",
        });
      }


      if (!staffHospital) {
        return res.status(403).json({
          message:
            "You are not assigned to an active hospital",
        });
      }


      updateService(
        staffHospital.hospital_id
      );
    }
  );
};


/*
 * Deactivate hospital service.
 */
const deactivateHospitalService = (
  req,
  res
) => {
  const hospitalServiceId =
    req.params.id;


  const deactivateService = (
    hospitalId = null
  ) => {
    let sql = `
      UPDATE hospital_services
      SET status = 'INACTIVE'
      WHERE id = ?
    `;


    const values = [
      hospitalServiceId,
    ];


    if (hospitalId !== null) {
      sql += `
        AND hospital_id = ?
      `;

      values.push(hospitalId);
    }


    db.query(
      sql,
      values,
      (error, result) => {
        if (error) {
          console.error(
            "Deactivate hospital service error:",
            error.message
          );

          return res.status(500).json({
            message:
              "Failed to deactivate hospital service",
          });
        }


        if (result.affectedRows === 0) {
          return res.status(404).json({
            message:
              "Hospital service not found",
          });
        }


        res.json({
          message:
            "Hospital service deactivated successfully",
        });
      }
    );
  };


  /*
   * ADMIN can deactivate any service.
   */
  if (req.user?.role === "ADMIN") {
    return deactivateService();
  }


  /*
   * HOSPITAL_STAFF can only deactivate
   * their own hospital's service.
   */
  getStaffHospital(
    req.user.id,
    (error, staffHospital) => {
      if (error) {
        console.error(
          "Find staff hospital error:",
          error.message
        );

        return res.status(500).json({
          message:
            "Unable to determine hospital",
        });
      }


      if (!staffHospital) {
        return res.status(403).json({
          message:
            "You are not assigned to an active hospital",
        });
      }


      deactivateService(
        staffHospital.hospital_id
      );
    }
  );
};

const getMedicalServiceCatalogue = (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      description,
      category
    FROM medical_services
    ORDER BY name ASC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error(
        "Get medical service catalogue error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to get medical services catalogue",
      });
    }

    res.json({
      services: results,
    });
  });
};


module.exports = {
  addHospitalService,
  getHospitalService,
  getHospitalServices,
  getMyHospitalServices,
  getMedicalServiceCatalogue,
  updateHospitalService,
  deactivateHospitalService,
};