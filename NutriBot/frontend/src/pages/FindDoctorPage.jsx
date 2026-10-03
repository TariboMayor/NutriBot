import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Hospital,
  Search,
  Stethoscope,
  UserRound,
  AlertCircle,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./FindDoctorPage.css";

function FindDoctorPage() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const hospital = location.state?.hospital || null;
  const patientLocation =
    location.state?.patientLocation || null;

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("nutribot_token");

        if (!token) {
          setError(
            "Your session has expired. Please log in again."
          );
          return;
        }

        const response = await fetch(
          `/api/doctors/hospital/${hospitalId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load doctors."
          );
        }

        /*
          The existing backend may return either:
          { doctors: [...] }
          or the array directly.
        */
        const doctorList = Array.isArray(data)
          ? data
          : Array.isArray(data.doctors)
          ? data.doctors
          : [];

        setDoctors(doctorList);
      } catch (fetchError) {
        console.error(
          "Find doctors error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load doctors."
        );
      } finally {
        setLoading(false);
      }
    };

    if (hospitalId) {
      fetchDoctors();
    }
  }, [hospitalId]);

  const handleSelectDoctor = (doctor) => {
    navigate(
      `/appointments/book?hospitalId=${hospitalId}&doctorId=${doctor.id}`,
      {
        state: {
          hospital,
          doctor,
          patientLocation,
        },
      }
    );
  };

  const handleBack = () => {
    if (hospital) {
      navigate(`/hospitals/${hospitalId}`, {
        state: {
          hospital,
          patientLocation,
        },
      });
      return;
    }

    navigate("/hospitals");
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return true;
    }

    const name =
      doctor.name ||
      doctor.full_name ||
      doctor.doctor_name ||
      "";

    const specialty =
      doctor.specialty ||
      doctor.specialisation ||
      doctor.specialization ||
      "";

    return (
      String(name)
        .toLowerCase()
        .includes(search) ||
      String(specialty)
        .toLowerCase()
        .includes(search)
    );
  });

  return (
    <div className="find-doctor-page">
      <UserSidebar />

      <main className="find-doctor-main">
        <button
          type="button"
          className="find-doctor-back"
          onClick={handleBack}
        >
          <ArrowLeft size={18} />
          Back to Hospital
        </button>

        <section className="find-doctor-header">
          <div className="find-doctor-eyebrow">
            <Stethoscope size={16} />
            Appointment Booking
          </div>

          <h1>Find a Doctor</h1>

          <p>
            Choose a doctor at{" "}
            <strong>
              {hospital?.name || "this hospital"}
            </strong>{" "}
            to continue with your appointment.
          </p>
        </section>

        {hospital && (
          <section className="find-doctor-hospital">
            <div className="find-doctor-hospital-icon">
              <Hospital size={23} />
            </div>

            <div>
              <span>Selected Hospital</span>
              <strong>{hospital.name}</strong>

              {(hospital.city || hospital.state) && (
                <small>
                  {[
                    hospital.city,
                    hospital.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </small>
              )}
            </div>
          </section>
        )}

        {!loading && !error && doctors.length > 0 && (
          <div className="find-doctor-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>
        )}

        {loading && (
          <section className="find-doctor-status">
            <div className="find-doctor-loading-icon">
              <Stethoscope size={27} />
            </div>

            <h2>Finding Doctors</h2>

            <p>
              Loading doctors available at this
              hospital...
            </p>
          </section>
        )}

        {!loading && error && (
          <section className="find-doctor-status find-doctor-error">
            <div className="find-doctor-error-icon">
              <AlertCircle size={27} />
            </div>

            <h2>Unable to Load Doctors</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </section>
        )}

        {!loading &&
          !error &&
          doctors.length === 0 && (
            <section className="find-doctor-status">
              <div className="find-doctor-loading-icon">
                <UserRound size={27} />
              </div>

              <h2>No Doctors Available</h2>

              <p>
                There are currently no active doctors
                available for appointment booking at
                this hospital.
              </p>
            </section>
          )}

        {!loading &&
          !error &&
          doctors.length > 0 &&
          filteredDoctors.length === 0 && (
            <section className="find-doctor-status">
              <div className="find-doctor-loading-icon">
                <Search size={27} />
              </div>

              <h2>No Matching Doctor</h2>

              <p>
                No doctor or specialty matches your
                search.
              </p>
            </section>
          )}

        {!loading &&
          !error &&
          filteredDoctors.length > 0 && (
            <section className="find-doctor-results">
              <div className="find-doctor-results-header">
                <div>
                  <h2>Available Doctors</h2>

                  <p>
                    {filteredDoctors.length} doctor
                    {filteredDoctors.length === 1
                      ? ""
                      : "s"}{" "}
                    available
                  </p>
                </div>
              </div>

              <div className="find-doctor-list">
                {filteredDoctors.map((doctor) => {
                  const doctorName =
                    doctor.name ||
                    doctor.full_name ||
                    doctor.doctor_name ||
                    "Doctor";

                  const specialty =
                    doctor.specialty ||
                    doctor.specialisation ||
                    doctor.specialization ||
                    "Medical Doctor";

                  return (
                    <article
                      key={doctor.id}
                      className="doctor-card"
                    >
                      <div className="doctor-card-icon">
                        <UserRound size={27} />
                      </div>

                      <div className="doctor-card-content">
                        <h3>
                          Dr. {doctorName}
                        </h3>

                        <p className="doctor-specialty">
                          <Stethoscope size={16} />
                          {specialty}
                        </p>

                        {doctor.license_number && (
                          <p className="doctor-license">
                            License:{" "}
                            {doctor.license_number}
                          </p>
                        )}

                        {doctor.license && (
                          <p className="doctor-license">
                            License: {doctor.license}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="doctor-select-button"
                        onClick={() =>
                          handleSelectDoctor(doctor)
                        }
                      >
                        <CalendarDays size={17} />
                        Select Doctor
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
      </main>
    </div>
  );
}

export default FindDoctorPage;
