import { useEffect, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Hospital,
  Stethoscope,
  AlertCircle,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import UserSidebar from "../components/navigation/UserSidebar";

import "./AvailabilityPage.css";


const API_URL =
  "http://localhost:5000/api";


function AvailabilityPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] =
    useSearchParams();


  /*
   * URL parameters.
   */
  const doctorId =
    searchParams.get("doctorId");

  const doctorServiceId =
    searchParams.get(
      "doctorServiceId"
    );


  /*
   * Data passed from Select Service page.
   */
  const hospital =
    location.state?.hospital || null;

  const doctor =
    location.state?.doctor || null;

  const service =
    location.state?.service || null;

  const patientLocation =
    location.state?.patientLocation || null;


  /*
   * IMPORTANT:
   *
   * The backend needs hospital_services.id.
   *
   * The service object can contain this value
   * under different names depending on the
   * response returned by the backend.
   */
  const hospitalServiceId =
    service?.hospital_service_id ||
    service?.hospitalServiceId ||
    service?.hospital_service?.id ||
    searchParams.get(
      "hospitalServiceId"
    ) ||
    service?.id ||
    doctorServiceId ||
    "";


  /*
   * Appointment date.
   */
  const [selectedDate, setSelectedDate] =
    useState(() => {
      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const year =
        today.getFullYear();

      const month =
        String(
          today.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          today.getDate()
        ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    });


  const [slots, setSlots] =
    useState([]);

  const [selectedSlot, setSelectedSlot] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
   * DEBUG INFORMATION
   */
  console.log(
    "BOOKING IDs:",
    {
      doctorId,
      doctorServiceId,
      hospitalServiceId,
      selectedDate,
    }
  );


  /*
   * Create the next 14 dates.
   */
  const availableDates =
    Array.from(
      { length: 14 },
      (_, index) => {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() +
            index
        );

        return date;
      }
    );


  /*
   * Convert date to YYYY-MM-DD.
   */
  const formatDateForApi =
    (date) => {
      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };


  /*
   * Fetch available appointment slots.
   */
  useEffect(() => {
    const fetchAvailableSlots =
      async () => {

        if (
          !doctorId ||
          !hospitalServiceId ||
          !selectedDate
        ) {
          console.log(
            "BOOKING REQUEST NOT SENT:",
            {
              doctorId,
              doctorServiceId,
              hospitalServiceId,
              selectedDate,
            }
          );

          return;
        }


        try {
          setLoading(true);
          setError("");
          setSlots([]);
          setSelectedSlot(null);


          /*
           * Get authentication token.
           */
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
           * Backend expects:
           *
           * doctorId
           * hospitalServiceId
           * appointmentDate
           */
          const query =
            new URLSearchParams({
              doctorId:
                String(
                  doctorId
                ),

              hospitalServiceId:
                String(
                  hospitalServiceId
                ),

              appointmentDate:
                selectedDate,
            });


          const requestUrl =
            `${API_URL}/appointments/available-slots?${query.toString()}`;


          console.log(
            "AVAILABLE SLOTS REQUEST:",
            {
              doctorId,
              hospitalServiceId,
              appointmentDate:
                selectedDate,
              url:
                requestUrl,
            }
          );


          const response =
            await fetch(
              requestUrl,
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const data =
            await response
              .json()
              .catch(
                () => ({})
              );


          console.log(
            "AVAILABLE SLOTS RESPONSE:",
            {
              status:
                response.status,
              data,
            }
          );


          if (!response.ok) {
            throw new Error(
              data.message ||
                data.error ||
                "Unable to load available appointment slots."
            );
          }


          setSlots(
            Array.isArray(
              data.slots
            )
              ? data.slots
              : []
          );

        } catch (
          fetchError
        ) {

          console.error(
            "Get available slots error:",
            fetchError
          );


          setError(
            fetchError.message ||
              "Unable to load available appointment slots."
          );


          setSlots([]);

        } finally {
          setLoading(false);
        }
      };


    fetchAvailableSlots();

  }, [
    doctorId,
    doctorServiceId,
    hospitalServiceId,
    selectedDate,
  ]);


  /*
   * Go back to Select Service.
   */
  const handleBack =
    () => {
      navigate(
        `/appointments/service/${doctorId}`,
        {
          state: {
            hospital,
            doctor,
            patientLocation,
          },
        }
      );
    };


  /*
   * Continue to appointment confirmation.
   */
  const handleContinue =
    () => {

      if (!selectedSlot) {
        return;
      }


      navigate(
        `/appointments/confirm?doctorId=${doctorId}&doctorServiceId=${doctorServiceId}&hospitalServiceId=${hospitalServiceId}&appointmentDate=${selectedDate}`,
        {
          state: {
            hospital,
            doctor,
            service,
            slot:
              selectedSlot,
            patientLocation,
            hospitalServiceId,
          },
        }
      );
    };


  /*
   * Doctor name.
   */
  const doctorName =
    doctor?.name ||
    doctor?.full_name ||
    doctor?.doctor_name ||
    (
      doctor?.first_name &&
      doctor?.last_name
        ? `${doctor.first_name} ${doctor.last_name}`
        : null
    ) ||
    "Doctor";


  /*
   * Doctor specialty.
   */
  const doctorSpecialty =
    doctor?.specialty ||
    doctor?.specialisation ||
    doctor?.specialization ||
    "Medical Doctor";


  /*
   * Service name.
   */
  const serviceName =
    service?.service_name ||
    service?.name ||
    "Medical Service";


  /*
   * Format appointment slot time.
   */
  const formatSlotTime =
    (slot) => {

      if (
        typeof slot ===
        "string"
      ) {
        return slot;
      }


      return (
        slot?.start_time ||
        slot?.startTime ||
        slot?.time ||
        ""
      );
    };


  return (
    <div className="availability-page">

      <UserSidebar />


      <main className="availability-main">

        {/* BACK */}

        <button
          type="button"
          className="availability-back"
          onClick={handleBack}
        >
          <ArrowLeft
            size={18}
          />

          Back to Service
        </button>


        {/* HEADER */}

        <section className="availability-header">

          <div className="availability-eyebrow">

            <CalendarDays
              size={16}
            />

            Appointment Booking

          </div>


          <h1>
            Select Date & Time
          </h1>


          <p>
            Choose a date and an available
            appointment time for your visit.
          </p>

        </section>


        {/* BOOKING SUMMARY */}

        <section className="availability-summary">

          <div className="availability-summary-icon">

            <Stethoscope
              size={24}
            />

          </div>


          <div className="availability-summary-content">

            <h2>
              Dr. {doctorName}
            </h2>


            <p>
              {doctorSpecialty}
            </p>


            <div className="availability-summary-details">

              {hospital?.name && (
                <span>

                  <Hospital
                    size={15}
                  />

                  {hospital.name}

                </span>
              )}


              <span>

                <Stethoscope
                  size={15}
                />

                {serviceName}

              </span>

            </div>

          </div>

        </section>


        {/* ERROR */}

        {error && (
          <section className="availability-message availability-error">

            <AlertCircle
              size={19}
            />

            <span>
              {error}
            </span>

          </section>
        )}


        {/* DATE */}

        <section className="availability-section">

          <div className="availability-section-header">

            <div>

              <h2>
                Choose a Date
              </h2>


              <p>
                Select the day you would like
                to visit the doctor.
              </p>

            </div>

          </div>


          <div className="availability-date-list">

            {availableDates.map(
              (date) => {

                const value =
                  formatDateForApi(
                    date
                  );


                const isSelected =
                  selectedDate ===
                  value;


                return (
                  <button
                    type="button"
                    key={value}
                    className={`availability-date-card ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedDate(
                        value
                      )
                    }
                  >

                    <span className="availability-date-weekday">

                      {date.toLocaleDateString(
                        "en-NG",
                        {
                          weekday:
                            "short",
                        }
                      )}

                    </span>


                    <strong>
                      {date.getDate()}
                    </strong>


                    <span className="availability-date-month">

                      {date.toLocaleDateString(
                        "en-NG",
                        {
                          month:
                            "short",
                        }
                      )}

                    </span>


                    {isSelected && (
                      <CheckCircle2
                        size={17}
                        className="availability-date-check"
                      />
                    )}

                  </button>
                );
              }
            )}

          </div>

        </section>


        {/* TIME SLOTS */}

        <section className="availability-section">

          <div className="availability-section-header">

            <div>

              <h2>
                Available Times
              </h2>


              <p>
                Select an available appointment
                time for your chosen date.
              </p>

            </div>


            {!loading && (
              <span className="availability-count">

                {slots.length}{" "}

                {slots.length === 1
                  ? "slot"
                  : "slots"}

              </span>
            )}

          </div>


          {loading && (
            <div className="availability-loading">

              <div className="availability-loading-icon">

                <Clock
                  size={24}
                />

              </div>


              <h3>
                Checking availability...
              </h3>


              <p>
                Looking for available
                appointment times.
              </p>

            </div>
          )}


          {!loading &&
            !error &&
            slots.length === 0 && (
              <div className="availability-empty">

                <div className="availability-empty-icon">

                  <Clock
                    size={27}
                  />

                </div>


                <h3>
                  No available times
                </h3>


                <p>
                  There are no available
                  appointment slots for this
                  date. Please choose another
                  date.
                </p>

              </div>
            )}


          {!loading &&
            slots.length > 0 && (
              <div className="availability-slots">

                {slots.map(
                  (slot, index) => {

                    const time =
                      formatSlotTime(
                        slot
                      );


                    const slotKey =
                      typeof slot ===
                      "string"
                        ? slot
                        : slot.id ||
                          `${time}-${index}`;


                    const isSelected =
                      selectedSlot ===
                      slot;


                    return (
                      <button
                        type="button"
                        key={slotKey}
                        className={`availability-slot ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedSlot(
                            slot
                          )
                        }
                      >

                        <Clock
                          size={17}
                        />


                        <span>
                          {time}
                        </span>


                        {isSelected && (
                          <CheckCircle2
                            size={17}
                          />
                        )}

                      </button>
                    );
                  }
                )}

              </div>
            )}

        </section>


        {/* ACTIONS */}

        <div className="availability-actions">

          <button
            type="button"
            className="availability-cancel"
            onClick={handleBack}
          >
            Back
          </button>


          <button
            type="button"
            className="availability-continue"
            onClick={handleContinue}
            disabled={!selectedSlot}
          >

            <CalendarDays
              size={17}
            />

            Continue to Confirmation

          </button>

        </div>

      </main>

    </div>
  );
}


export default AvailabilityPage;
