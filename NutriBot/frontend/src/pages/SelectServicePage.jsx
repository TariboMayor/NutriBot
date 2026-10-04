import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Hospital,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import UserSidebar from "../components/navigation/UserSidebar";

import "./SelectServicePage.css";

function SelectServicePage() {
  const { doctorId } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const hospital = location.state?.hospital || null;
  const doctor = location.state?.doctor || null;
  const patientLocation =
    location.state?.patientLocation || null;

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDoctorServices = async () => {
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
          `/api/doctor-services/doctor/${doctorId}`,
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
              "Unable to load doctor services."
          );
        }

        const serviceList = Array.isArray(data)
          ? data
          : Array.isArray(data.services)
          ? data.services
          : [];

        const activeServices = serviceList.filter(
          (service) =>
            !service.status ||
            service.status === "ACTIVE"
        );

        setServices(activeServices);
      } catch (fetchError) {
        console.error(
          "Doctor services error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load available services."
        );

        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorServices();
    }
  }, [doctorId]);

  const handleBack = () => {
    if (hospital) {
      navigate(`/hospitals/${hospital.id}/doctors`, {
        state: {
          hospital,
          patientLocation,
        },
      });

      return;
    }

    navigate(-1);
  };

  const handleContinue = () => {
    if (!selectedServiceId) {
      return;
    }

    const selectedService = services.find(
      (service) =>
        String(service.id) ===
        String(selectedServiceId)
    );

    if (!selectedService) {
      return;
    }

    navigate(
      `/appointments/availability?doctorId=${doctorId}&doctorServiceId=${selectedService.id}`,
      {
        state: {
          hospital,
          doctor,
          service: selectedService,
          patientLocation,
        },
      }
    );
  };

  const doctorName =
    doctor?.name ||
    doctor?.full_name ||
    doctor?.doctor_name ||
    "Doctor";

  const doctorSpecialty =
    doctor?.specialty ||
    doctor?.specialisation ||
    doctor?.specialization ||
    "Medical Doctor";

  return (
    <div className="select-service-page">
      <UserSidebar />

      <main className="select-service-main">

        <button
          type="button"
          className="select-service-back"
          onClick={handleBack}
        >
          <ArrowLeft size={18} />
          Back to Doctors
        </button>

        <section className="select-service-header">
          <div className="select-service-eyebrow">
            <CalendarDays size={16} />
            Appointment Booking
          </div>

          <h1>Select a Service</h1>

          <p>
            Choose the medical service you want to
            book with your selected doctor.
          </p>
        </section>

        <section className="select-service-doctor-card">

          <div className="select-service-doctor-icon">
            <Stethoscope size={25} />
          </div>

          <div className="select-service-doctor-info">
            <h2>Dr. {doctorName}</h2>

            <p>{doctorSpecialty}</p>

            {hospital?.name && (
              <div className="select-service-hospital">
                <Hospital size={15} />
                <span>{hospital.name}</span>
              </div>
            )}
          </div>

        </section>

        {error && (
          <section className="select-service-message select-service-error">
            <AlertCircle size={19} />
            <span>{error}</span>
          </section>
        )}

        {loading && (
          <section className="select-service-loading">
            <div className="select-service-loading-icon">
              <Stethoscope size={25} />
            </div>

            <h3>Loading services...</h3>

            <p>
              Checking the services available with
              this doctor.
            </p>
          </section>
        )}

        {!loading && !error && services.length === 0 && (
          <section className="select-service-empty">
            <div className="select-service-empty-icon">
              <Stethoscope size={28} />
            </div>

            <h3>No services available</h3>

            <p>
              This doctor currently has no active
              services available for appointment
              booking.
            </p>
          </section>
        )}

        {!loading && !error && services.length > 0 && (
          <section className="select-service-section">

            <div className="select-service-section-header">
              <div>
                <h2>Available Services</h2>

                <p>
                  Select one service to continue.
                </p>
              </div>

              <span className="select-service-count">
                {services.length}{" "}
                {services.length === 1
                  ? "service"
                  : "services"}
              </span>
            </div>

            <div className="select-service-list">
              {services.map((service) => {
                const isSelected =
                  String(selectedServiceId) ===
                  String(service.id);

                return (
                  <button
                    type="button"
                    key={service.id}
                    className={`service-card ${
                      isSelected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedServiceId(
                        service.id
                      )
                    }
                  >
                    <div className="service-card-icon">
                      <Stethoscope size={22} />
                    </div>

                    <div className="service-card-content">
                      <div className="service-card-title-row">
                        <h3>
                          {service.service_name}
                        </h3>

                        {isSelected && (
                          <CheckCircle2
                            size={20}
                            className="service-card-check"
                          />
                        )}
                      </div>

                      {service.category && (
                        <span className="service-card-category">
                          {service.category}
                        </span>
                      )}

                      {service.description && (
                        <p className="service-card-description">
                          {service.description}
                        </p>
                      )}

                      <div className="service-card-meta">
                        {service.duration_minutes && (
                          <span>
                            <Clock size={15} />
                            {
                              service.duration_minutes
                            }{" "}
                            minutes
                          </span>
                        )}

                        {service.price !== null &&
                          service.price !==
                            undefined && (
                            <span>
                              ₦
                              {Number(
                                service.price
                              ).toLocaleString()}
                            </span>
                          )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="select-service-actions">
              <button
                type="button"
                className="select-service-cancel"
                onClick={handleBack}
              >
                Back
              </button>

              <button
                type="button"
                className="select-service-continue"
                onClick={handleContinue}
                disabled={!selectedServiceId}
              >
                <CalendarDays size={17} />
                Continue to Date & Time
              </button>
            </div>

          </section>
        )}

      </main>
    </div>
  );
}

export default SelectServicePage;
