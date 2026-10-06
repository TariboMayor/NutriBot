const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});


/**
 * ======================================================
 * SEND APPOINTMENT CONFIRMATION EMAIL
 * ======================================================
 */

const sendAppointmentConfirmationEmail = (
  {
    recipientEmail,
    patientName,
    hospitalName,
    doctorName,
    serviceName,
    appointmentDate,
    startTime,
  },
  callback
) => {
  if (!recipientEmail) {
    return callback(
      new Error("Recipient email is required")
    );
  }

  const formattedTime = String(startTime)
    .substring(0, 5);

  const mailOptions = {
    from: `"NutriBot" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "NutriBot - Appointment Confirmed",

    text:
      `Hello ${patientName || "NutriBot User"},\n\n` +
      `Your appointment has been confirmed.\n\n` +
      `Hospital: ${hospitalName}\n` +
      `Doctor: Dr. ${doctorName}\n` +
      `Service: ${serviceName}\n` +
      `Date: ${appointmentDate}\n` +
      `Time: ${formattedTime}\n\n` +
      `Please arrive on time for your appointment.\n\n` +
      `Thank you for using NutriBot.\n\n` +
      `NutriBot\n` +
      `Your AI Health Assistant`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        padding: 30px;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          padding: 30px;
        ">

          <h2 style="
            margin-top: 0;
            color: #111111;
          ">
            Appointment Confirmed
          </h2>

          <p>
            Hello ${patientName || "NutriBot User"},
          </p>

          <p>
            Your appointment has been successfully
            confirmed by the hospital.
          </p>

          <div style="
            background: #f8f8f8;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
          ">

            <p>
              <strong>Hospital:</strong>
              ${hospitalName}
            </p>

            <p>
              <strong>Doctor:</strong>
              Dr. ${doctorName}
            </p>

            <p>
              <strong>Service:</strong>
              ${serviceName}
            </p>

            <p>
              <strong>Date:</strong>
              ${appointmentDate}
            </p>

            <p>
              <strong>Time:</strong>
              ${formattedTime}
            </p>

          </div>

          <p>
            Please arrive on time for your appointment.
          </p>

          <p>
            Thank you for using
            <strong>NutriBot</strong>.
          </p>

          <p style="
            color: #777777;
            font-size: 13px;
          ">
            Your AI Health Assistant
          </p>

        </div>
      </div>
    `,
  };

  transporter.sendMail(
    mailOptions,
    (error, info) => {
      if (error) {
        console.error(
          "Appointment confirmation email error:",
          error.message
        );

        return callback(error);
      }

      console.log(
        "Appointment confirmation email sent:",
        info.messageId
      );

      callback(null, info);
    }
  );
};


/**
 * ======================================================
 * SEND HOSPITAL APPOINTMENT REPLY EMAIL
 * ======================================================
 *
 * Used when hospital staff sends a message to a patient
 * regarding a specific appointment.
 */

const sendAppointmentReplyEmail = (
  {
    recipientEmail,
    patientName,
    hospitalName,
    doctorName,
    serviceName,
    appointmentDate,
    startTime,
    subject,
    message,
  },
  callback
) => {
  if (!recipientEmail) {
    return callback(
      new Error("Recipient email is required")
    );
  }

  if (!message) {
    return callback(
      new Error("Reply message is required")
    );
  }

  const formattedTime =
    String(startTime || "").substring(0, 5);

  const emailSubject =
    subject ||
    `NutriBot - Message from ${hospitalName || "Hospital"}`;

  const mailOptions = {
    from: `"NutriBot" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: emailSubject,

    text:
      `Hello ${patientName || "NutriBot User"},\n\n` +
      `${hospitalName || "Your hospital"} has sent you a message regarding your appointment.\n\n` +
      `Appointment Details:\n` +
      `Hospital: ${hospitalName || "—"}\n` +
      `Doctor: Dr. ${doctorName || "—"}\n` +
      `Service: ${serviceName || "—"}\n` +
      `Date: ${appointmentDate || "—"}\n` +
      `Time: ${formattedTime || "—"}\n\n` +
      `Message from the hospital:\n` +
      `${message}\n\n` +
      `Please log in to NutriBot to view your appointment and any related messages.\n\n` +
      `Thank you for using NutriBot.\n\n` +
      `NutriBot\n` +
      `Your AI Health Assistant`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        background: #f5f5f5;
        padding: 30px;
      ">

        <div style="
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          padding: 30px;
        ">

          <h2 style="
            margin-top: 0;
            color: #111111;
          ">
            Message from ${hospitalName || "Your Hospital"}
          </h2>

          <p>
            Hello ${patientName || "NutriBot User"},
          </p>

          <p>
            Your hospital has sent you a message
            regarding your appointment.
          </p>

          <div style="
            background: #f8f8f8;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
          ">

            <h3 style="
              margin-top: 0;
              color: #111111;
            ">
              Appointment Details
            </h3>

            <p>
              <strong>Hospital:</strong>
              ${hospitalName || "—"}
            </p>

            <p>
              <strong>Doctor:</strong>
              Dr. ${doctorName || "—"}
            </p>

            <p>
              <strong>Service:</strong>
              ${serviceName || "—"}
            </p>

            <p>
              <strong>Date:</strong>
              ${appointmentDate || "—"}
            </p>

            <p>
              <strong>Time:</strong>
              ${formattedTime || "—"}
            </p>

          </div>

          <div style="
            background: #fff9e6;
            border-left: 4px solid #e6bf3f;
            border-radius: 6px;
            padding: 18px;
            margin: 20px 0;
          ">

            <h3 style="
              margin-top: 0;
              color: #111111;
            ">
              Message from the Hospital
            </h3>

            <p style="
              white-space: pre-wrap;
              line-height: 1.7;
              color: #333333;
            ">
              ${message}
            </p>

          </div>

          <p>
            Please log in to NutriBot to view your
            appointment and any related messages.
          </p>

          <p>
            Thank you for using
            <strong>NutriBot</strong>.
          </p>

          <p style="
            color: #777777;
            font-size: 13px;
          ">
            Your AI Health Assistant
          </p>

        </div>

      </div>
    `,
  };

  transporter.sendMail(
    mailOptions,
    (error, info) => {
      if (error) {
        console.error(
          "Appointment reply email error:",
          error.message
        );

        return callback(error);
      }

      console.log(
        "Appointment reply email sent:",
        info.messageId
      );

      callback(null, info);
    }
  );
};


module.exports = {
  sendAppointmentConfirmationEmail,
  sendAppointmentReplyEmail,
};
