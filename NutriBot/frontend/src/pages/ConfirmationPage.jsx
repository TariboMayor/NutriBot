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

  const doctorId =
    searchParams.get("doctorId");

  const doctorServiceId =
    searchParams.get("doctorServiceId");

  const appointmentDate =
    searchParams.get("appointmentDate");


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


  const [reason, setReason] =
    useState("");

  const [patientNotes, setPatientNotes] =
    useState("");

  const [booking, setBooking] =
    useState(false);

  const [error, setError] =
    useState("");


  const hospitalServiceId =
    service?.hospital_service_id ||
    service?.hospitalServiceId ||
    doctorServiceId;


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


  const formatDate = (value) => {
    if (!value) return "Not selected";

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


  const formatTime = (value) => {
    if (!value) return "Not selected";

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


  const handleBack = () => {
    navigate(
      `/appointments/availability?doctorId=${doctorId}&doctorServiceId=${doctorServiceId}`,
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


  const handleBooking = async () => {
    setError("");

    if (!hospital?.id) {
      setError("Hospital information is missing.");
      return;
    }

    if (!doctorId) {
      setError("Doctor information is missing.");
      return;
    }

    if (!hospitalServiceId) {
      setError("Service information is missing.");
      return;
    }

    if (!appointmentDate || !startTime) {
      setError("Appointment date or time is missing.");
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

      const response = await fetch(
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
            hospital_id: hospital.id,
            doctor_id: Number(doctorId),
            hospital_service_id:
              Number(hospitalServiceId),
            appointment_date:
              appointmentDate,
            start_time: startTime,
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
            "Unable to book appointment."
        );
      }

      navigate(
        "/appointments",
        {
          replace: true,

          state: {
            bookingSuccess: true,
            appointmentId:
              data.appointmentId,
            appointment:
              data.appointment,
            bookingMessage:
              data.message ||
              "Appointment created successfully.",
          },
        }
      );

    } catch (bookingError) {
      console.error(
        "Appointment booking error:",
        bookingError
      );

      setError(
        bookingError.message ||
          "Unable to book appointment."
      );

    } finally {
      setBooking(false);
    }
  };


  return (
    <div className="confirmation-page">

      <UserSidebar />

      <main className="confirmation-main">

        <button
          type="button"
          className="confirmation-back"
          onClick={handleBack}
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
                <span>Hospital</span>
                <strong>
                  {hospital?.name || "Hospital"}
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
                <span>Doctor</span>
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
                <span>Service</span>
                <strong>
                  {serviceName}
                </strong>

                {service?.duration_minutes && (
                  <small>
                    {service.duration_minutes} minutes
                  </small>
                )}
              </div>
            </div>


            <div className="confirmation-detail">
              <CalendarDays size={19} />

              <div>
                <span>Date</span>
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
                <span>Time</span>
                <strong>
                  {formatTime(startTime)}
                  {endTime &&
                    ` - ${formatTime(endTime)}`}
                </strong>
              </div>
            </div>


            <div className="confirmation-detail">
              <CreditCard size={19} />

              <div>
                <span>Service Fee</span>
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
              />

            </div>

          </div>

        </section>


        <div className="confirmation-notice">

          <CheckCircle2 size={18} />

          <span>
            Your appointment will be created
            as <strong>Pending</strong>.
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

                Booking...
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
