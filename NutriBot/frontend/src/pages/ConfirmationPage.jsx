import { useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Hospital,
  Loader2,
  Stethoscope,
  UserRound,
  AlertCircle,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import UserSidebar from "../components/navigation/UserSidebar";

import "./ConfirmationPage.css";


function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] =
    useSearchParams();


  /*
   * =========================================================
   * URL PARAMETERS
   * =========================================================
   */

  const doctorId =
    searchParams.get("doctorId");

  const doctorServiceId =
    searchParams.get("doctorServiceId");

  const hospitalServiceIdFromUrl =
    searchParams.get("hospitalServiceId");

  const appointmentDate =
    searchParams.get("appointmentDate");


  /*
   * =========================================================
   * BOOKING DATA
   * =========================================================
   */

  const hospital =
    location.state?.hospital || null;

  const doctor =
    location.state?.doctor || null;

  const service =
    location.state?.service || null;

  const slot =
    location.state?.slot || null;

  const patientLocation =
    location.state?.patientLocation || null;


  /*
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [reason, setReason] =
    useState("");

  const [patientNotes, setPatientNotes] =
    useState("");

  const [booking, setBooking] =
    useState(false);

  const [error, setError] =
    useState("");

  const [bookingSuccess, setBookingSuccess] =
    useState(false);

  const [appointmentResult, setAppointmentResult] =
    useState(null);


  /*
   * =========================================================
   * IMPORTANT
   *
   * The backend appointment endpoint needs
   * the ACTUAL hospital service ID.
   *
   * Priority:
   *
   * 1. service.hospital_service_id
   * 2. service.hospitalServiceId
   * 3. hospitalServiceId from URL
   *
   * We intentionally DO NOT use doctorServiceId
   * as a fallback because they are different IDs.
   * =========================================================
   */

  const hospitalServiceId =
    service?.hospital_service_id ||
    service?.hospitalServiceId ||
    hospitalServiceIdFromUrl ||
    null;


  /*
   * =========================================================
   * DISPLAY VALUES
   * =========================================================
   */

  const doctorName =
    doctor?.name ||
    doctor?.full_name ||
    doctor?.doctor_name ||
    "Doctor";


  const specialty =
    doctor?.specialty ||
    doctor?.specialisation ||
    doctor?.specialization ||
    "Medical Doctor";


  const serviceName =
    service?.service_name ||
    service?.name ||
    "Medical Service";


  const startTime =
    slot?.start_time ||
    slot?.startTime ||
    "";


  const endTime =
    slot?.end_time ||
    slot?.endTime ||
    "";


  /*
   * =========================================================
   * FORMAT DATE
   * =========================================================
   */

  const formatDate = (value) => {
    if (!value) {
      return "Not selected";
    }

    const date =
      new Date(`${value}T00:00:00`);

    return date.toLocaleDateString(
      "en-NG",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };


  /*
   * =========================================================
   * FORMAT TIME
   * =========================================================
   */

  const formatTime = (value) => {
    if (!value) {
      return "Not selected";
    }

    const [hours, minutes] =
      String(value)
        .split(":")
        .map(Number);

    const date = new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-NG",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };


  /*
   * =========================================================
   * FORMAT PRICE
   * =========================================================
   */

  const formatPrice = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not specified";
    }

    return `₦${Number(value).toLocaleString(
      "en-NG"
    )}`;
  };


  /*
   * =========================================================
   * GO BACK
   * =========================================================
   */

  const handleBack = () => {
    navigate(
      `/appointments/availability?doctorId=${doctorId}&doctorServiceId=${doctorServiceId}&hospitalServiceId=${hospitalServiceId}&appointmentDate=${appointmentDate}`,
      {
        state: {
          hospital,
          doctor,
          service,
          patientLocation,
        },
      }
    );
  };


  /*
   * =========================================================
   * BOOK APPOINTMENT
   * =========================================================
   */

  const handleBooking = async () => {
    setError("");


    /*
     * Validate required booking information.
     */

    if (!hospital?.id) {
      setError(
        "Hospital information is missing."
      );

      return;
    }


    if (!doctorId) {
      setError(
        "Doctor information is missing."
      );

      return;
    }


    if (!hospitalServiceId) {
      setError(
        "Hospital service information is missing."
      );

      return;
    }


    if (!appointmentDate) {
      setError(
        "Appointment date is missing."
      );

      return;
    }


    if (!startTime) {
      setError(
        "Appointment start time is missing."
      );

      return;
    }


    if (!endTime) {
      setError(
        "Appointment end time is missing."
      );

      return;
    }


    try {
      setBooking(true);


      const token =
        localStorage.getItem(
          "nutribot_token"
        );


      if (!token) {
        setError(
          "Your session has expired. Please log in again."
        );

        return;
      }


      /*
       * Send appointment request to backend.
       *
       * The backend creates the appointment
       * with status PENDING.
       *
       * PENDING is the internal hospital workflow
       * state. The patient sees "Request Sent".
       */

      const response =
        await fetch(
          "/api/appointments",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              hospital_id:
                Number(hospital.id),

              doctor_id:
                Number(doctorId),

              hospital_service_id:
                Number(hospitalServiceId),

              appointment_date:
                appointmentDate,

              start_time:
                startTime,

              end_time:
                endTime,

              reason:
                reason.trim() || null,

              patient_notes:
                patientNotes.trim() || null,
            }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send appointment request."
        );
      }


      /*
       * SUCCESS
       *
       * Do not navigate away immediately.
       * Show the request-sent confirmation.
       */

      setAppointmentResult(data);

      setBookingSuccess(true);

    } catch (bookingError) {
      console.error(
        "Appointment booking error:",
        bookingError
      );


      setError(
        bookingError.message ||
          "Unable to send appointment request."
      );

    } finally {
      setBooking(false);
    }
  };


  /*
   * =========================================================
   * GO TO MY APPOINTMENTS
   * =========================================================
   */

  const handleViewAppointments = () => {
    navigate(
      "/appointments",
      {
        replace: true,

        state: {
          bookingSuccess: true,

          appointmentId:
            appointmentResult?.appointmentId,

          appointment:
            appointmentResult?.appointment,

          bookingMessage:
            appointmentResult?.message ||
            "Your appointment request has been sent to the hospital.",
        },
      }
    );
  };


  /*
   * =========================================================
   * SUCCESS CARD
   * =========================================================
   */

  if (bookingSuccess) {
    return (
      <div className="confirmation-page">

        <UserSidebar />


        <main className="confirmation-main">

          <section className="confirmation-success-card">

            <div className="confirmation-success-icon">
              <CheckCircle2 size={42} />
            </div>


            <div className="confirmation-success-content">

              <span className="confirmation-success-label">
                Request Sent
              </span>


              <h1>
                Appointment Request Sent
              </h1>


              <p>
                Your appointment request has been
                successfully sent to the hospital.
              </p>


              <div className="confirmation-success-details">

                <div>
                  <Hospital size={18} />

                  <span>
                    {hospital?.name ||
                      "Hospital"}
                  </span>
                </div>


                <div>
                  <UserRound size={18} />

                  <span>
                    Dr. {doctorName}
                  </span>
                </div>


                <div>
                  <CalendarDays size={18} />

                  <span>
                    {formatDate(
                      appointmentDate
                    )}
                  </span>
                </div>


                <div>
                  <Clock size={18} />

                  <span>
                    {formatTime(
                      startTime
                    )}

                    {endTime &&
                      ` - ${formatTime(
                        endTime
                      )}`}
                  </span>
                </div>

              </div>


              <div className="confirmation-success-notice">

                <CheckCircle2 size={17} />

                <span>
                  Your request has been submitted
                  to the hospital. The hospital will
                  review your request and respond to
                  you through NutriBot.
                </span>

              </div>


              <div className="confirmation-success-actions">

                <button
                  type="button"
                  className="confirmation-success-button"
                  onClick={
                    handleViewAppointments
                  }
                >
                  <CalendarDays size={18} />

                  View My Appointments
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>
    );
  }


  /*
   * =========================================================
   * NORMAL CONFIRMATION PAGE
   * =========================================================
   */

  return (
    <div className="confirmation-page">

      <UserSidebar />


      <main className="confirmation-main">

        <button
          type="button"
          className="confirmation-back"
          onClick={handleBack}
          disabled={booking}
        >
          <ArrowLeft size={18} />

          Back to Date & Time
        </button>


        <header className="confirmation-header">

          <div className="confirmation-eyebrow">

            <CheckCircle2 size={16} />

            Appointment Booking

          </div>


          <h1>
            Confirm Your Appointment
          </h1>


          <p>
            Review your appointment details
            before confirming your booking.
          </p>

        </header>


        {error && (
          <div className="confirmation-error">

            <AlertCircle size={18} />

            {error}

          </div>
        )}


        <section className="confirmation-card">

          <div className="confirmation-card-header">

            <div className="confirmation-icon">
              <CalendarDays size={23} />
            </div>


            <div>

              <h2>
                Appointment Details
              </h2>


              <p>
                Please review your booking.
              </p>

            </div>

          </div>


          <div className="confirmation-details">

            <div className="confirmation-detail">

              <Hospital size={19} />

              <div>

                <span>
                  Hospital
                </span>


                <strong>
                  {hospital?.name ||
                    "Hospital"}
                </strong>


                {hospital?.address && (
                  <small>
                    {hospital.address}
                  </small>
                )}

              </div>

            </div>


            <div className="confirmation-detail">

              <UserRound size={19} />

              <div>

                <span>
                  Doctor
                </span>


                <strong>
                  Dr. {doctorName}
                </strong>


                <small>
                  {specialty}
                </small>

              </div>

            </div>


            <div className="confirmation-detail">

              <Stethoscope size={19} />

              <div>

                <span>
                  Service
                </span>


                <strong>
                  {serviceName}
                </strong>


                {service?.duration_minutes && (
                  <small>
                    {service.duration_minutes}
                    {" "}
                    minutes
                  </small>
                )}

              </div>

            </div>


            <div className="confirmation-detail">

              <CalendarDays size={19} />

              <div>

                <span>
                  Date
                </span>


                <strong>
                  {formatDate(
                    appointmentDate
                  )}
                </strong>

              </div>

            </div>


            <div className="confirmation-detail">

              <Clock size={19} />

              <div>

                <span>
                  Time
                </span>


                <strong>
                  {formatTime(
                    startTime
                  )}

                  {endTime &&
                    ` - ${formatTime(
                      endTime
                    )}`}
                </strong>

              </div>

            </div>


            <div className="confirmation-detail">

              <CreditCard size={19} />

              <div>

                <span>
                  Service Fee
                </span>


                <strong>
                  {formatPrice(
                    service?.price
                  )}
                </strong>

              </div>

            </div>

          </div>

        </section>


        <section className="confirmation-form-card">

          <div className="confirmation-form-header">

            <h2>
              Additional Information
            </h2>


            <p>
              Optional information for the
              healthcare provider.
            </p>

          </div>


          <div className="confirmation-form">

            <div className="confirmation-form-group">

              <label htmlFor="reason">
                Reason for Visit
              </label>


              <input
                id="reason"
                type="text"
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value
                  )
                }
                placeholder="e.g. Routine consultation"
                disabled={booking}
              />

            </div>


            <div className="confirmation-form-group">

              <label htmlFor="notes">
                Additional Notes
              </label>


              <textarea
                id="notes"
                value={patientNotes}
                onChange={(event) =>
                  setPatientNotes(
                    event.target.value
                  )
                }
                placeholder="Anything you would like the doctor to know..."
                rows="4"
                disabled={booking}
              />

            </div>

          </div>

        </section>


        <div className="confirmation-notice">

          <CheckCircle2 size={18} />

          <span>
            Your appointment request will be
            sent to the hospital for review.
          </span>

        </div>


        <div className="confirmation-actions">

          <button
            type="button"
            className="confirmation-cancel"
            onClick={handleBack}
            disabled={booking}
          >
            Back
          </button>


          <button
            type="button"
            className="confirmation-book"
            onClick={handleBooking}
            disabled={booking}
          >

            {booking ? (
              <>
                <Loader2
                  size={18}
                  className="confirmation-spinner"
                />

                Sending Request...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />

                Confirm & Book
              </>
            )}

          </button>

        </div>

      </main>

    </div>
  );
}


export default ConfirmationPage;
