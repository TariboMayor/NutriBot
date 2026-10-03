import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Hospital,
  MapPin,
  Navigation,
  Phone,
  Mail,
  Globe,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./HospitalDetailsPage.css";

function HospitalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [hospital, setHospital] = useState(
    location.state?.hospital || null
  );

  const [patientLocation] = useState(
    location.state?.patientLocation || null
  );

  const [loading, setLoading] = useState(
    !location.state?.hospital
  );

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const token =
          localStorage.getItem("nutribot_token");

        if (!token) {
          setError(
            "Your session has expired. Please log in again."
          );

          setLoading(false);
          return;
        }

        // Hospital was already supplied from Find Hospital.
        if (location.state?.hospital) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/hospitals/${id}`,
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
              "Unable to load hospital details."
          );
        }

        setHospital(
          data.hospital || data
        );
      } catch (fetchError) {
        console.error(
          "Hospital details error:",
          fetchError
        );

        setError(
          fetchError.message ||
            "Unable to load hospital details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [id, location.state]);
const handleBookAppointment = () => {
  navigate(`/hospitals/${id}/doctors`, {
    state: {
      hospital,
      patientLocation,
    },
  });
};
  if (loading) {
    return (
      <div className="hospital-details-page">
        <UserSidebar />

        <main className="hospital-details-main">
          <div className="hospital-details-loading">
            Loading hospital details...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hospital-details-page">
        <UserSidebar />

        <main className="hospital-details-main">

          <button
            type="button"
            className="hospital-details-back"
            onClick={() => navigate("/hospitals")}
          >
            <ArrowLeft size={18} />
            Back to Hospitals
          </button>

          <section className="hospital-details-error">

            <div className="hospital-details-error-icon">
              <AlertCircle size={28} />
            </div>

            <h2>
              Unable to Load Hospital
            </h2>

            <p>
              {error}
            </p>

          </section>

        </main>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="hospital-details-page">
        <UserSidebar />

        <main className="hospital-details-main">

          <button
            type="button"
            className="hospital-details-back"
            onClick={() => navigate("/hospitals")}
          >
            <ArrowLeft size={18} />
            Back to Hospitals
          </button>

          <section className="hospital-details-error">

            <div className="hospital-details-error-icon">
              <Hospital size={28} />
            </div>

            <h2>
              Hospital Not Found
            </h2>

            <p>
              We could not find the hospital you selected.
            </p>

          </section>

        </main>
      </div>
    );
  }

  const hospitalAddress = [
    hospital.address,
    hospital.city,
    hospital.state,
    hospital.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="hospital-details-page">

      <UserSidebar />

      <main className="hospital-details-main">

        <button
          type="button"
          className="hospital-details-back"
          onClick={() => navigate("/hospitals")}
        >
          <ArrowLeft size={18} />
          Back to Hospitals
        </button>

        <section className="hospital-details-header">

          <div className="hospital-details-icon">
            <Hospital size={34} />
          </div>

          <div className="hospital-details-header-content">

            <div className="hospital-details-eyebrow">
              <Hospital size={15} />
              Healthcare Provider
            </div>

            <h1>
              {hospital.name}
            </h1>

            {hospitalAddress && (
              <p className="hospital-details-location">
                <MapPin size={17} />
                {hospitalAddress}
              </p>
            )}

            {hospital.distance_text && (
              <p className="hospital-details-distance">
                <Navigation size={16} />
                {hospital.distance_text}
              </p>
            )}

          </div>

        </section>

        <section className="hospital-details-grid">

          <div className="hospital-details-card">

            <div className="hospital-details-card-header">
              <h2>
                Hospital Information
              </h2>
            </div>

            {hospital.description && (
              <div className="hospital-details-description">

                <h3>
                  About this Hospital
                </h3>

                <p>
                  {hospital.description}
                </p>

              </div>
            )}

            <div className="hospital-details-contact-list">

              {hospital.phone && (
                <div className="hospital-details-contact">

                  <div className="hospital-details-contact-icon">
                    <Phone size={18} />
                  </div>

                  <div>
                    <span>
                      Phone
                    </span>

                    <strong>
                      {hospital.phone}
                    </strong>
                  </div>

                </div>
              )}

              {hospital.email && (
                <div className="hospital-details-contact">

                  <div className="hospital-details-contact-icon">
                    <Mail size={18} />
                  </div>

                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      {hospital.email}
                    </strong>
                  </div>

                </div>
              )}

              {hospital.website && (
                <div className="hospital-details-contact">

                  <div className="hospital-details-contact-icon">
                    <Globe size={18} />
                  </div>

                  <div>
                    <span>
                      Website
                    </span>

                    <a
                      href={
                        hospital.website.startsWith("http")
                          ? hospital.website
                          : `https://${hospital.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {hospital.website}
                    </a>
                  </div>

                </div>
              )}

              {hospitalAddress && (
                <div className="hospital-details-contact">

                  <div className="hospital-details-contact-icon">
                    <MapPin size={18} />
                  </div>

                  <div>
                    <span>
                      Address
                    </span>

                    <strong>
                      {hospitalAddress}
                    </strong>
                  </div>

                </div>
              )}

            </div>

          </div>

          <aside className="hospital-booking-card">

            <div className="hospital-booking-icon">
              <CalendarDays size={27} />
            </div>

            <h2>
              Book an Appointment
            </h2>

            <p>
              Choose a doctor, select a service,
              view available appointment times and
              book your appointment directly through
              NutriBot.
            </p>

            <button
              type="button"
              className="hospital-booking-button"
              onClick={handleBookAppointment}
            >
              <CalendarDays size={18} />
              Find a Doctor
            </button>

          </aside>

        </section>

      </main>
    </div>
  );
}

export default HospitalDetailsPage;