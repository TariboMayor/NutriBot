import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Hospital,
  MapPin,
  Navigation,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./FindHospitalPage.css";

function FindHospitalPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    state: "",
    city: "",
    area: "",
    address: "",
  });

  const [hospitals, setHospitals] = useState([]);
  const [patientLocation, setPatientLocation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");
    setSearched(false);
    setHospitals([]);

    const hasLocation =
      formData.state.trim() ||
      formData.city.trim() ||
      formData.area.trim() ||
      formData.address.trim();

    if (!hasLocation) {
      setError(
        "Please enter at least a state, city, area, or present address."
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("nutribot_token");

      if (!token) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      const params = new URLSearchParams();

      if (formData.state.trim()) {
        params.append("state", formData.state.trim());
      }

      if (formData.city.trim()) {
        params.append("city", formData.city.trim());
      }

      if (formData.area.trim()) {
        params.append("area", formData.area.trim());
      }

      if (formData.address.trim()) {
        params.append("address", formData.address.trim());
      }

      params.append("country", "Nigeria");

      const response = await fetch(
        `/api/hospitals/search?${params.toString()}`,
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
            "Unable to find hospitals near this location."
        );
      }

      setPatientLocation(data.location || null);
      setHospitals(data.hospitals || []);
      setSearched(true);
    } catch (searchError) {
      console.error(
        "Hospital search error:",
        searchError
      );

      setError(
        searchError.message ||
          "Unable to search for hospitals."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewHospital = (hospital) => {
    navigate(`/hospitals/${hospital.id}`, {
      state: {
        hospital,
        patientLocation,
      },
    });
  };

  const handleClear = () => {
    setFormData({
      state: "",
      city: "",
      area: "",
      address: "",
    });

    setHospitals([]);
    setPatientLocation(null);
    setSearched(false);
    setError("");
  };

  const getHospitalAddress = (hospital) => {
    return [
      hospital.address,
      hospital.city,
      hospital.state,
      hospital.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="find-hospital-page">

      <UserSidebar />

      <main className="find-hospital-main">

        {/* ============================================
            PAGE HEADER
        ============================================ */}

        <header className="find-hospital-header">

          <div className="find-hospital-eyebrow">
            <Hospital size={15} />
            Healthcare Directory
          </div>

          <h1>
            Find a Hospital
          </h1>

          <p>
            Search for hospitals and healthcare providers
            near your current location. Results are arranged
            from the closest hospital to the farthest.
          </p>

        </header>


        {/* ============================================
            SEARCH CARD
        ============================================ */}

        <section className="find-hospital-search-card">

          <div className="find-hospital-search-heading">

            <div className="find-hospital-search-icon">
              <Search size={22} />
            </div>

            <div>
              <h2>
                Search Nearby Hospitals
              </h2>

              <p>
                Enter your location so NutriBot can find
                available hospitals near you.
              </p>
            </div>

          </div>


          <form
            className="find-hospital-form"
            onSubmit={handleSearch}
          >

            <div className="find-hospital-field">

              <label htmlFor="state">
                State
              </label>

              <input
                id="state"
                name="state"
                type="text"
                placeholder="e.g. Oyo"
                value={formData.state}
                onChange={handleChange}
              />

            </div>


            <div className="find-hospital-field">

              <label htmlFor="city">
                City
              </label>

              <input
                id="city"
                name="city"
                type="text"
                placeholder="e.g. Ibadan"
                value={formData.city}
                onChange={handleChange}
              />

            </div>


            <div className="find-hospital-field">

              <label htmlFor="area">
                Area
              </label>

              <input
                id="area"
                name="area"
                type="text"
                placeholder="e.g. Samonda"
                value={formData.area}
                onChange={handleChange}
              />

            </div>


            <div className="find-hospital-field">

              <label htmlFor="address">
                Present Address
              </label>

              <input
                id="address"
                name="address"
                type="text"
                placeholder="Street address or landmark"
                value={formData.address}
                onChange={handleChange}
              />

            </div>


            <div className="find-hospital-form-actions">

              <button
                type="button"
                className="find-hospital-clear"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>

              <button
                type="submit"
                className="find-hospital-search-button"
                disabled={loading}
              >
                <Search size={17} />

                {loading
                  ? "Searching..."
                  : "Find Hospitals"}
              </button>

            </div>

          </form>


          {error && (
            <div className="find-hospital-error">

              <AlertCircle size={18} />

              <span>
                {error}
              </span>

            </div>
          )}

        </section>


        {/* ============================================
            SEARCH RESULTS
        ============================================ */}

        {searched && (
          <section className="find-hospital-results">

            <div className="find-hospital-results-header">

              <div>

                <div className="find-hospital-results-title">

                  <Hospital size={19} />

                  <h2>
                    Nearby Hospitals
                  </h2>

                </div>

                <p>
                  {hospitals.length === 0
                    ? "No hospitals were found for this location."
                    : `${hospitals.length} hospital${
                        hospitals.length === 1
                          ? ""
                          : "s"
                      } found near your location.`}
                </p>

              </div>

              {patientLocation?.formattedAddress && (
                <div className="find-hospital-location">

                  <MapPin size={16} />

                  <span>
                    {patientLocation.formattedAddress}
                  </span>

                </div>
              )}

            </div>


            {/* ========================================
                NO RESULTS
            ======================================== */}

            {hospitals.length === 0 ? (
              <div className="find-hospital-empty">

                <div className="find-hospital-empty-icon">
                  <Hospital size={28} />
                </div>

                <h3>
                  No Hospitals Found
                </h3>

                <p>
                  We could not find any registered hospitals
                  with available location information near
                  the location you entered.
                </p>

                <button
                  type="button"
                  onClick={handleClear}
                >
                  Search Another Location
                </button>

              </div>
            ) : (

              /* ======================================
                 HOSPITAL CARDS
              ====================================== */

              <div className="find-hospital-grid">

                {hospitals.map((hospital) => {

                  const hospitalAddress =
                    getHospitalAddress(hospital);

                  return (
                    <article
                      className="hospital-result-card"
                      key={hospital.id}
                    >

                      {/* CARD HEADER */}

                      <div className="hospital-result-card-header">

                        <div className="hospital-result-icon">
                          <Hospital size={25} />
                        </div>

                        <div className="hospital-result-title">

                          <h3>
                            {hospital.name}
                          </h3>

                          <span>
                            Healthcare Provider
                          </span>

                        </div>

                      </div>


                      {/* DISTANCE */}

                      {hospital.distance_text && (
                        <div className="hospital-result-distance">

                          <Navigation size={15} />

                          <strong>
                            {hospital.distance_text}
                          </strong>

                        </div>
                      )}


                      {/* ADDRESS */}

                      {hospitalAddress && (
                        <div className="hospital-result-info">

                          <MapPin size={16} />

                          <span>
                            {hospitalAddress}
                          </span>

                        </div>
                      )}


                      {/* DESCRIPTION */}

                      {hospital.description && (
                        <p className="hospital-result-description">
                          {hospital.description}
                        </p>
                      )}


                      {/* CONTACT INFORMATION */}

                      <div className="hospital-result-contact">

                        {hospital.phone && (
                          <div className="hospital-result-contact-item">

                            <Phone size={15} />

                            <span>
                              {hospital.phone}
                            </span>

                          </div>
                        )}

                        {hospital.email && (
                          <div className="hospital-result-contact-item">

                            <Mail size={15} />

                            <span>
                              {hospital.email}
                            </span>

                          </div>
                        )}

                        {hospital.website && (
                          <div className="hospital-result-contact-item">

                            <Globe size={15} />

                            <span>
                              {hospital.website}
                            </span>

                          </div>
                        )}

                      </div>


                      {/* CARD ACTION */}

                      <button
                        type="button"
                        className="hospital-result-button"
                        onClick={() =>
                          handleViewHospital(hospital)
                        }
                      >
                        View Hospital

                        <ArrowRight size={17} />

                      </button>

                    </article>
                  );
                })}

              </div>
            )}

          </section>
        )}

      </main>

    </div>
  );
}

export default FindHospitalPage;
