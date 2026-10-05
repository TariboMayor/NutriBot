import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Globe,
  Hospital,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Stethoscope,
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

  const patientLocation =
    location.state?.patientLocation || null;

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

  const handleBack = () => {
    navigate("/hospitals");
  };

  if (loading) {
    return (
      <div className="hospital-details-page">
        <UserSidebar />

        <main className="hospital-details-main">
          <div className="hospital-details-loading">
            <div className="hospital-details-loading-icon">
              <Hospital size={28} />
            </div>

            <h2>Loading Hospital</h2>

            <p>
              Please wait while we load the hospital information.
            </p>
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
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to Hospitals
          </button>

          <section className="hospital-details-error">
            <div className="hospital-details-error-icon">
              <Hospital size={28} />
            </div>

            <h2>
              Unable to Load Hospital
            </h2>

            <p>{error}</p>
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
            onClick={handleBack}
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

  const website =
    hospital.website
      ? hospital.website.startsWith("http")
        ? hospital.website
        : `https://${hospital.website}`
      : null;

  return (
    <div className="hospital-details-page">

      <UserSidebar />

      <main className="hospital-details-main">

        <button
          type="button"
          className="hospital-details-back"
          onClick={handleBack}
        >
          <ArrowLeft size={18} />
          Back to Hospitals
        </button>

        {/* =========================================
            HOSPITAL HERO
        ========================================= */}

        <section className="hospital-hero">

          <div className="hospital-hero-icon">
            <Hospital size={34} />
          </div>

          <div className="hospital-hero-content">

            <div className="hospital-hero-top">

              <div className="hospital-hero-eyebrow">
                <ShieldCheck size={15} />
                Healthcare Provider
              </div>

              {hospital.status && (
                <span className="hospital-status">
                  {hospital.status}
                </span>
              )}

            </div>

            <h1>
              {hospital.name}
            </h1>

            {hospitalAddress && (
              <div className="hospital-hero-address">
                <MapPin size={17} />
                <span>{hospitalAddress}</span>
              </div>
            )}

            {hospital.distance_text && (
              <div className="hospital-hero-distance">
                <Navigation size={16} />
                {hospital.distance_text}
              </div>
            )}

          </div>

        </section>

        {/* =========================================
            MAIN CONTENT
        ========================================= */}

        <div className="hospital-details-layout">

          {/* LEFT COLUMN */}

          <div className="hospital-details-left">

            <section className="hospital-info-card">

              <div className="hospital-card-heading">

                <div className="hospital-card-heading-icon">
                  <Hospital size={19} />
                </div>

                <div>
                  <h2>
                    About This Hospital
                  </h2>

                  <p>
                    Hospital information and contact details
                  </p>
                </div>

              </div>

              {hospital.description && (
                <div className="hospital-about">
                  <p>
                    {hospital.description}
                  </p>
                </div>
              )}

              {!hospital.description && (
                <div className="hospital-about">
                  <p>
                    Hospital information is available through
                    NutriBot. You can contact the healthcare
                    provider directly using the details below.
                  </p>
                </div>
              )}

            </section>

            <section className="hospital-info-card">

              <div className="hospital-card-heading">

                <div className="hospital-card-heading-icon">
                  <MapPin size={19} />
                </div>

                <div>
                  <h2>
                    Contact & Location
                  </h2>

                  <p>
                    How to reach this healthcare provider
                  </p>
                </div>

              </div>

              <div className="hospital-contact-grid">

                {hospital.phone && (
                  <div className="hospital-contact-item">

                    <div className="hospital-contact-icon">
                      <Phone size={18} />
                    </div>

                    <div>
                      <span>Phone</span>

                      <strong>
                        {hospital.phone}
                      </strong>
                    </div>

                  </div>
                )}

                {hospital.email && (
                  <div className="hospital-contact-item">

                    <div className="hospital-contact-icon">
                      <Mail size={18} />
                    </div>

                    <div>
                      <span>Email</span>

                      <strong>
                        {hospital.email}
                      </strong>
                    </div>

                  </div>
                )}

                {website && (
                  <div className="hospital-contact-item">

                    <div className="hospital-contact-icon">
                      <Globe size={18} />
                    </div>

                    <div>
                      <span>Website</span>

                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Website
                      </a>
                    </div>

                  </div>
                )}

                {hospitalAddress && (
                  <div className="hospital-contact-item hospital-contact-item-full">

                    <div className="hospital-contact-icon">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <span>Address</span>

                      <strong>
                        {hospitalAddress}
                      </strong>
                    </div>

                  </div>
                )}

              </div>

            </section>

          </div>

          {/* RIGHT COLUMN */}

          <aside className="hospital-booking-panel">

            <div className="hospital-booking-panel-icon">
              <CalendarDays size={28} />
            </div>

            <div className="hospital-booking-label">
              Appointment Booking
            </div>

            <h2>
              Book an Appointment
            </h2>

            <p>
              Find a doctor at this hospital, choose
              a medical service and select an available
              appointment time.
            </p>

            <div className="hospital-booking-steps">

              <div className="hospital-booking-step">
                <span>1</span>
                <div>
                  <strong>Choose a Doctor</strong>
                  <small>
                    View doctors available at this hospital
                  </small>
                </div>
              </div>

              <div className="hospital-booking-step">
                <span>2</span>
                <div>
                  <strong>Select a Service</strong>
                  <small>
                    Choose the service you need
                  </small>
                </div>
              </div>

              <div className="hospital-booking-step">
                <span>3</span>
                <div>
                  <strong>Choose a Time</strong>
                  <small>
                    Select an available appointment slot
                  </small>
                </div>
              </div>

            </div>

            <button
              type="button"
              className="hospital-booking-button"
              onClick={handleBookAppointment}
            >
              <Stethoscope size={19} />
              Find a Doctor
            </button>

            <div className="hospital-booking-note">
              <ShieldCheck size={16} />
              <span>
                Appointment booking is handled securely
                inside NutriBot.
              </span>
            </div>

          </aside>

        </div>

      </main>
    </div>
  );
}

export default HospitalDetailsPage;
