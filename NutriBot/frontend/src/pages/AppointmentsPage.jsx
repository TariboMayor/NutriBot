import { useEffect, useState } from "react";
import UserSidebar from "../components/navigation/UserSidebar";
import "./AppointmentsPage.css";

const API_BASE_URL = "http://localhost:5000/api";

function AppointmentsPage() {
  const token = localStorage.getItem("nutribot_token");

  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingHospitalDetails, setLoadingHospitalDetails] =
    useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Initial page loading
   */
  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [hospitalsResponse, appointmentsResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/hospitals`, {
              headers,
            }),
            fetch(`${API_BASE_URL}/appointments/my`, {
              headers,
            }),
          ]);

        const hospitalsData = await hospitalsResponse.json();
        const appointmentsData = await appointmentsResponse.json();

        if (cancelled) {
          return;
        }

        if (!hospitalsResponse.ok) {
          throw new Error(
            hospitalsData.message ||
              "Unable to load hospitals."
          );
        }

        if (!appointmentsResponse.ok) {
          throw new Error(
            appointmentsData.message ||
              "Unable to load your appointments."
          );
        }

        setHospitals(
          Array.isArray(hospitalsData)
            ? hospitalsData
            : hospitalsData.hospitals || []
        );

        setAppointments(
          Array.isArray(appointmentsData)
            ? appointmentsData
            : appointmentsData.appointments || []
        );

        setError("");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointment information."
        );
      } finally {
        if (!cancelled) {
          setLoadingHospitals(false);
          setLoadingAppointments(false);
        }
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /*
   * Load doctors and services when hospital changes
   */
  const selectHospital = async (hospitalId) => {
    setSelectedHospital(hospitalId);

    setSelectedDoctor("");
    setSelectedService("");
    setSelectedDate("");
    setSelectedSlot("");

    setDoctors([]);
    setServices([]);
    setSlots([]);

    setError("");
    setSuccess("");

    if (!hospitalId) {
      return;
    }

    setLoadingHospitalDetails(true);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [doctorsResponse, servicesResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/hospitals/${hospitalId}/doctors`,
            {
              headers,
            }
          ),
          fetch(
            `${API_BASE_URL}/hospitals/${hospitalId}/services`,
            {
              headers,
            }
          ),
        ]);

      const doctorsData = await doctorsResponse.json();
      const servicesData = await servicesResponse.json();

      if (!doctorsResponse.ok) {
        throw new Error(
          doctorsData.message ||
            "Unable to load doctors."
        );
      }

      if (!servicesResponse.ok) {
        throw new Error(
          servicesData.message ||
            "Unable to load hospital services."
        );
      }

      setDoctors(
        Array.isArray(doctorsData)
          ? doctorsData
          : doctorsData.doctors || []
      );

      setServices(
        Array.isArray(servicesData)
          ? servicesData
          : servicesData.services || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load hospital information."
      );
    } finally {
      setLoadingHospitalDetails(false);
    }
  };

  /*
   * Load available appointment slots
   */
  const loadSlots = async ({
    hospital = selectedHospital,
    doctor = selectedDoctor,
    service = selectedService,
    date = selectedDate,
  } = {}) => {
    setSlots([]);
    setSelectedSlot("");

    if (!hospital || !date) {
      return;
    }

    setLoadingSlots(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.append("hospital_id", hospital);
      params.append("date", date);

      if (doctor) {
        params.append("doctor_id", doctor);
      }

      if (service) {
        params.append("service_id", service);
      }

      const response = await fetch(
        `${API_BASE_URL}/appointments/available-slots?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load available appointment slots."
        );
      }

      setSlots(
        Array.isArray(data)
          ? data
          : data.slots || []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load available appointment slots."
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  /*
   * Book appointment
   */
  const handleBooking = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedHospital) {
      setError("Please select a hospital.");
      return;
    }

    if (!selectedDate) {
      setError("Please select an appointment date.");
      return;
    }

    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    setBooking(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hospital_id: Number(selectedHospital),
            doctor_id: selectedDoctor
              ? Number(selectedDoctor)
              : null,
            service_id: selectedService
              ? Number(selectedService)
              : null,
            appointment_date: selectedDate,
            appointment_time: selectedSlot,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to book this appointment."
        );
      }

      setSuccess(
        "Your appointment has been booked successfully."
      );

      setSelectedDoctor("");
      setSelectedService("");
      setSelectedDate("");
      setSelectedSlot("");
      setSlots([]);

      /*
       * Refresh appointments after successful booking.
       */
      const appointmentsResponse = await fetch(
        `${API_BASE_URL}/appointments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const appointmentsData =
        await appointmentsResponse.json();

      if (appointmentsResponse.ok) {
        setAppointments(
          Array.isArray(appointmentsData)
            ? appointmentsData
            : appointmentsData.appointments || []
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to book appointment."
      );
    } finally {
      setBooking(false);
    }
  };

  const getHospitalName = (appointment) => {
    return (
      appointment.hospital_name ||
      appointment.hospital?.name ||
      appointment.hospital ||
      "Hospital"
    );
  };

  const getDoctorName = (appointment) => {
    return (
      appointment.doctor_name ||
      appointment.doctor?.name ||
      appointment.doctor ||
      "Doctor not specified"
    );
  };

  const getServiceName = (appointment) => {
    return (
      appointment.service_name ||
      appointment.service?.name ||
      appointment.service ||
      "General consultation"
    );
  };

  const getAppointmentDate = (appointment) => {
    return (
      appointment.appointment_date ||
      appointment.date ||
      "Date not available"
    );
  };

  const getAppointmentTime = (appointment) => {
    return (
      appointment.appointment_time ||
      appointment.time ||
      "Time not available"
    );
  };

  const getAppointmentStatus = (appointment) => {
    return (
      appointment.status ||
      appointment.appointment_status ||
      "PENDING"
    );
  };

  return (
    <div className="appointments-page">
      <UserSidebar />

      <main className="appointments-main">
        <header className="appointments-header">
          <div>
            <span className="appointments-eyebrow">
              HEALTHCARE
            </span>

            <h1>Appointments</h1>

            <p>
              Find healthcare services and manage your
              appointments with NutriBot.
            </p>
          </div>
        </header>

        {error && (
          <div className="appointments-alert appointments-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="appointments-alert appointments-alert-success">
            {success}
          </div>
        )}

        <section className="appointments-section">
          <div className="appointments-section-heading">
            <div>
              <span className="appointments-section-label">
                YOUR HEALTHCARE
              </span>

              <h2>My appointments</h2>

              <p>
                Keep track of your upcoming and previous
                appointments.
              </p>
            </div>
          </div>

          {loadingAppointments ? (
            <div className="appointments-empty">
              <div className="appointments-spinner" />
              <p>Loading your appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="appointments-empty">
              <div className="appointments-empty-icon">
                📅
              </div>

              <h3>No appointments yet</h3>

              <p>
                Choose a hospital below to book your first
                appointment.
              </p>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment, index) => (
                <article
                  className="appointment-card"
                  key={
                    appointment.id ||
                    appointment.appointment_id ||
                    index
                  }
                >
                  <div className="appointment-card-top">
                    <div className="appointment-hospital-icon">
                      🏥
                    </div>

                    <div className="appointment-card-title">
                      <h3>
                        {getHospitalName(appointment)}
                      </h3>

                      <span>
                        {getServiceName(appointment)}
                      </span>
                    </div>

                    <span
                      className={`appointment-status appointment-status-${getAppointmentStatus(
                        appointment
                      )
                        .toString()
                        .toLowerCase()}`}
                    >
                      {getAppointmentStatus(appointment)}
                    </span>
                  </div>

                  <div className="appointment-details">
                    <div>
                      <span className="appointment-detail-label">
                        Doctor
                      </span>

                      <strong>
                        {getDoctorName(appointment)}
                      </strong>
                    </div>

                    <div>
                      <span className="appointment-detail-label">
                        Date
                      </span>

                      <strong>
                        {getAppointmentDate(appointment)}
                      </strong>
                    </div>

                    <div>
                      <span className="appointment-detail-label">
                        Time
                      </span>

                      <strong>
                        {getAppointmentTime(appointment)}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="appointments-section">
          <div className="appointments-section-heading">
            <div>
              <span className="appointments-section-label">
                FIND CARE
              </span>

              <h2>Book an appointment</h2>

              <p>
                Select a hospital, service, doctor and
                available time.
              </p>
            </div>
          </div>

          <div className="appointment-booking-layout">
            <div className="hospital-panel">
              <div className="panel-heading">
                <h3>Available hospitals</h3>

                <span>
                  {hospitals.length} available
                </span>
              </div>

              {loadingHospitals ? (
                <div className="panel-loading">
                  <div className="appointments-spinner" />
                  <p>Loading hospitals...</p>
                </div>
              ) : hospitals.length === 0 ? (
                <div className="panel-empty">
                  <div>🏥</div>

                  <p>
                    No hospitals are currently available.
                  </p>
                </div>
              ) : (
                <div className="hospital-list">
                  {hospitals.map((hospital, index) => {
                    const hospitalId =
                      hospital.id ||
                      hospital.hospital_id;

                    const hospitalName =
                      hospital.name ||
                      hospital.hospital_name ||
                      "Hospital";

                    const isSelected =
                      String(selectedHospital) ===
                      String(hospitalId);

                    return (
                      <button
                        type="button"
                        key={hospitalId || index}
                        className={`hospital-option ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() =>
                          selectHospital(hospitalId)
                        }
                      >
                        <span className="hospital-option-icon">
                          🏥
                        </span>

                        <span className="hospital-option-content">
                          <strong>
                            {hospitalName}
                          </strong>

                          <small>
                            {hospital.address ||
                              hospital.location ||
                              "Healthcare facility"}
                          </small>
                        </span>

                        <span className="hospital-option-arrow">
                          →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="booking-panel">
              <div className="panel-heading">
                <h3>Appointment details</h3>
              </div>

              <form
                className="appointment-form"
                onSubmit={handleBooking}
              >
                <div className="form-field">
                  <label htmlFor="hospital">
                    Hospital
                  </label>

                  <select
                    id="hospital"
                    value={selectedHospital}
                    onChange={(event) =>
                      selectHospital(event.target.value)
                    }
                  >
                    <option value="">
                      Select a hospital
                    </option>

                    {hospitals.map((hospital, index) => {
                      const hospitalId =
                        hospital.id ||
                        hospital.hospital_id;

                      return (
                        <option
                          key={hospitalId || index}
                          value={hospitalId}
                        >
                          {hospital.name ||
                            hospital.hospital_name ||
                            "Hospital"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="doctor">
                    Doctor
                  </label>

                  <select
                    id="doctor"
                    value={selectedDoctor}
                    disabled={
                      !selectedHospital ||
                      loadingHospitalDetails
                    }
                    onChange={(event) => {
                      const doctor =
                        event.target.value;

                      setSelectedDoctor(doctor);

                      loadSlots({
                        doctor,
                      });
                    }}
                  >
                    <option value="">
                      {loadingHospitalDetails
                        ? "Loading doctors..."
                        : "Select a doctor"}
                    </option>

                    {doctors.map((doctor, index) => {
                      const doctorId =
                        doctor.id ||
                        doctor.doctor_id;

                      const doctorName =
                        doctor.name ||
                        doctor.doctor_name ||
                        [
                          doctor.first_name,
                          doctor.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ") ||
                        "Doctor";

                      return (
                        <option
                          key={doctorId || index}
                          value={doctorId}
                        >
                          {doctorName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="service">
                    Service
                  </label>

                  <select
                    id="service"
                    value={selectedService}
                    disabled={
                      !selectedHospital ||
                      loadingHospitalDetails
                    }
                    onChange={(event) => {
                      const service =
                        event.target.value;

                      setSelectedService(service);

                      loadSlots({
                        service,
                      });
                    }}
                  >
                    <option value="">
                      {loadingHospitalDetails
                        ? "Loading services..."
                        : "Select a service"}
                    </option>

                    {services.map((service, index) => {
                      const serviceId =
                        service.id ||
                        service.service_id;

                      const serviceName =
                        service.name ||
                        service.service_name ||
                        "Healthcare service";

                      return (
                        <option
                          key={serviceId || index}
                          value={serviceId}
                        >
                          {serviceName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="appointment-date">
                    Date
                  </label>

                  <input
                    id="appointment-date"
                    type="date"
                    value={selectedDate}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    disabled={!selectedHospital}
                    onChange={(event) => {
                      const date =
                        event.target.value;

                      setSelectedDate(date);

                      loadSlots({
                        date,
                      });
                    }}
                  />
                </div>

                <div className="form-field">
                  <label>Available time</label>

                  {!selectedDate ? (
                    <div className="slot-message">
                      Select a date to see available
                      times.
                    </div>
                  ) : loadingSlots ? (
                    <div className="slot-message">
                      <div className="appointments-spinner" />
                      Loading available times...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="slot-message">
                      No available times for the selected
                      date.
                    </div>
                  ) : (
                    <div className="slots-grid">
                      {slots.map((slot, index) => {
                        const slotValue =
                          typeof slot === "string"
                            ? slot
                            : slot.time ||
                              slot.start_time ||
                              slot.appointment_time;

                        const slotLabel =
                          typeof slot === "string"
                            ? slot
                            : slot.label ||
                              slot.time ||
                              slot.start_time ||
                              "Available";

                        const isSelected =
                          selectedSlot ===
                          slotValue;

                        return (
                          <button
                            type="button"
                            key={slotValue || index}
                            className={`slot-button ${
                              isSelected
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedSlot(
                                slotValue
                              )
                            }
                          >
                            {slotLabel}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="booking-submit"
                  disabled={
                    booking ||
                    !selectedHospital ||
                    !selectedDate ||
                    !selectedSlot
                  }
                >
                  {booking
                    ? "Booking appointment..."
                    : "Book Appointment"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AppointmentsPage;