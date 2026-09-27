const db = require("../config/db");

const getAvailableSlots = (
  doctorId,
  hospitalServiceId,
  appointmentDate,
  callback
) => {
  // Step 1: Get the service duration
  const serviceSql = `
    SELECT
      hs.id,
      hs.hospital_id,
      hs.service_id,
      hs.duration_minutes,
      hs.status,
      d.id AS doctor_id,
      d.status AS doctor_status
    FROM hospital_services hs
    INNER JOIN doctor_services ds
      ON ds.hospital_service_id = hs.id
    INNER JOIN doctors d
      ON d.id = ds.doctor_id
    WHERE hs.id = ?
      AND ds.doctor_id = ?
      AND hs.status = 'ACTIVE'
      AND ds.status = 'ACTIVE'
      AND d.status = 'ACTIVE'
    LIMIT 1
  `;

  db.query(
    serviceSql,
    [hospitalServiceId, doctorId],
    (serviceError, serviceResults) => {
      if (serviceError) {
        console.error(
          "Get appointment service error:",
          serviceError.message
        );

        return callback(serviceError);
      }

      if (serviceResults.length === 0) {
        return callback(
          new Error(
            "Doctor and hospital service relationship not found"
          )
        );
      }

      const durationMinutes =
        serviceResults[0].duration_minutes;

      // JavaScript day:
      // Sunday = 0
      // Monday = 1
      // ...
      // Saturday = 6
      //
      // Our database convention:
      // Monday = 1
      // ...
      // Sunday = 7

      const date = new Date(`${appointmentDate}T00:00:00`);

      const jsDay = date.getDay();

      const dayOfWeek = jsDay === 0 ? 7 : jsDay;

      // Step 2: Get availability rules
      const availabilitySql = `
        SELECT
          id,
          availability_type,
          day_of_week,
          specific_date,
          start_time,
          end_time,
          reason,
          status
        FROM doctor_availability
        WHERE doctor_id = ?
          AND status = 'ACTIVE'
          AND (
            (
              availability_type = 'RECURRING'
              AND day_of_week = ?
            )
            OR
            (
              availability_type IN ('SPECIFIC_DATE', 'BLOCKED')
              AND specific_date = ?
            )
          )
        ORDER BY
          availability_type ASC,
          start_time ASC
      `;

      db.query(
        availabilitySql,
        [doctorId, dayOfWeek, appointmentDate],
        (availabilityError, availabilityResults) => {
          if (availabilityError) {
            console.error(
              "Get doctor availability error:",
              availabilityError.message
            );

            return callback(availabilityError);
          }

          // Step 3: Separate working periods and blocked periods
          const recurringPeriods =
            availabilityResults.filter(
              (item) =>
                item.availability_type === "RECURRING"
            );

          const specificPeriods =
            availabilityResults.filter(
              (item) =>
                item.availability_type ===
                "SPECIFIC_DATE"
            );

          const blockedPeriods =
            availabilityResults.filter(
              (item) =>
                item.availability_type === "BLOCKED"
            );

          /*
            A specific-date working schedule takes priority
            over the recurring schedule for that date.

            Example:

            Monday recurring:
            09:00 - 13:00

            Specific date:
            2026-09-30
            10:00 - 14:00

            We use:
            10:00 - 14:00
          */

          const workingPeriods =
            specificPeriods.length > 0
              ? specificPeriods
              : recurringPeriods;

          if (workingPeriods.length === 0) {
            return callback(null, []);
          }

          // Step 4: Get existing appointments
          const appointmentsSql = `
            SELECT
              start_time,
              end_time,
              status
            FROM appointments
            WHERE doctor_id = ?
              AND appointment_date = ?
              AND status IN (
                'PENDING',
                'CONFIRMED',
                'RESCHEDULED'
              )
            ORDER BY start_time ASC
          `;

          db.query(
            appointmentsSql,
            [doctorId, appointmentDate],
            (appointmentError, appointmentResults) => {
              if (appointmentError) {
                console.error(
                  "Get existing appointments error:",
                  appointmentError.message
                );

                return callback(appointmentError);
              }

              const slots = [];

              const timeToMinutes = (time) => {
                const parts = String(time)
                  .substring(0, 8)
                  .split(":");

                return (
                  Number(parts[0]) * 60 +
                  Number(parts[1])
                );
              };

              const minutesToTime = (minutes) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;

                return `${String(hours).padStart(
                  2,
                  "0"
                )}:${String(mins).padStart(2, "0")}:00`;
              };

              const overlaps = (
                start,
                end,
                existingStart,
                existingEnd
              ) => {
                return (
                  start < existingEnd &&
                  end > existingStart
                );
              };

              // Step 5: Generate possible slots
              for (const period of workingPeriods) {
                if (
                  !period.start_time ||
                  !period.end_time
                ) {
                  continue;
                }

                const periodStart = timeToMinutes(
                  period.start_time
                );

                const periodEnd = timeToMinutes(
                  period.end_time
                );

                for (
                  let start = periodStart;
                  start + durationMinutes <= periodEnd;
                  start += 30
                ) {
                  const end =
                    start + durationMinutes;

                  // Check existing appointments
                  const conflictsWithAppointment =
                    appointmentResults.some(
                      (appointment) => {
                        const existingStart =
                          timeToMinutes(
                            appointment.start_time
                          );

                        const existingEnd =
                          timeToMinutes(
                            appointment.end_time
                          );

                        return overlaps(
                          start,
                          end,
                          existingStart,
                          existingEnd
                        );
                      }
                    );

                  if (conflictsWithAppointment) {
                    continue;
                  }

                  // Check blocked periods
                  const conflictsWithBlockedPeriod =
                    blockedPeriods.some((blocked) => {
                      if (
                        !blocked.start_time ||
                        !blocked.end_time
                      ) {
                        return true;
                      }

                      const blockedStart =
                        timeToMinutes(
                          blocked.start_time
                        );

                      const blockedEnd =
                        timeToMinutes(
                          blocked.end_time
                        );

                      return overlaps(
                        start,
                        end,
                        blockedStart,
                        blockedEnd
                      );
                    });

                  if (conflictsWithBlockedPeriod) {
                    continue;
                  }

                  slots.push({
                    start_time:
                      minutesToTime(start),
                    end_time:
                      minutesToTime(end),
                  });
                }
              }

              return callback(null, slots);
            }
          );
        }
      );
    }
  );
};

module.exports = {
  getAvailableSlots,
};