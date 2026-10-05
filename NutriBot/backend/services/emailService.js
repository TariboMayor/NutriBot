const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send appointment confirmation email
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

module.exports = {
  sendAppointmentConfirmationEmail,
};
