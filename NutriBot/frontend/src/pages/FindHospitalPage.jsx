import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapPin,
  Search,
  Hospital,
  Navigation,
  X,
} from "lucide-react";

import UserSidebar from "../components/navigation/UserSidebar";

import "./FindHospitalPage.css";

function FindHospitalPage() {
  const navigate = useNavigate();

  const [showLocationForm, setShowLocationForm] =
    useState(false);

  const [location, setLocation] = useState({
    state: "",
    city: "",
    area: "",
    address: "",
  });

  const [hospitals, setHospitals] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [searched, setSearched] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setLocation((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);
    setSearched(false);

    try {
      const token =
        localStorage.getItem("nutribot_token");

      if (!token) {
        setError(
          "Your session has expired. Please log in again."
        );

        return;
      }

      const params = new URLSearchParams();

      if (location.state.trim()) {
        params.append(
          "state",
          location.state.trim()
        );
      }

      if (location.city.trim()) {
        params.append(
          "city",
          location.city.trim()
        );
      }

      if (location.area.trim()) {
        params.append(
          "area",
          location.area.trim()
        );
      }

      if (location.address.trim()) {
        params.append(
          "address",
          location.address.trim()
        );
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
            "Unable to search for hospitals."
        );
      }

      setHospitals(
        Array.isArray(data.hospitals)
          ? data.hospitals
          : []
      );

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

      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHospital = (hospital) => {
    navigate(`/hospitals/${hospital.id}`, {
      state: {
        hospital,
        patientLocation: location,
      },
    });
  };

  return (
    <div className="find-hospital-page">
      <UserSidebar />

      <main className="find-hospital-main">

        <section className="find-hospital-header">

          <div className="find-hospital-eyebrow">
            <Hospital size={16} />
            Healthcare
          </div>

          <h1>
            Find a Hospital
          </h1>

          <p>
            Find hospitals and clinics around your
            present location and continue with your
            appointment booking.
          </p>

        </section>

        <section className="find-hospital-card">

          <div className="find-hospital-card-icon">
            <MapPin size={28} />
          </div>

          <div className="find-hospital-card-content">

            <h2>
              Find Hospitals Near You
            </h2>

            <p>
              Enter your present location so we can
              find hospitals and clinics available
              around your area.
            </p>

            <button
              type="button"
              className="find-hospital-button"
              onClick={() =>
                setShowLocationForm(true)
              }
            >
              <Search size={17} />
              Find Hospital
            </button>

          </div>

        </section>

        {showLocationForm && (

          <section className="hospital-location-card">

            <div className="hospital-location-header">

              <div>
                <div className="hospital-location-title">
                  <Navigation size={18} />

                  <h2>
                    Your Present Location
                  </h2>
                </div>

                <p>
                  Enter where you are currently
                  located so we can search for nearby
                  hospitals and clinics.
                </p>
              </div>

              <button
                type="button"
                className="hospital-location-close"
                onClick={() =>
                  setShowLocationForm(false)
                }
                aria-label="Close location form"
              >
                <X size={20} />
              </button>

            </div>

            <form
              className="hospital-location-form"
              onSubmit={handleSearch}
            >

              <div className="hospital-form-group">

                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="e.g. Lagos"
                  value={location.state}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="hospital-form-group">

                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="e.g. Ikeja"
                  value={location.city}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="hospital-form-group">

                <label htmlFor="area">
                  Area / Community
                </label>

                <input
                  id="area"
                  name="area"
                  type="text"
                  placeholder="e.g. Allen Avenue"
                  value={location.area}
                  onChange={handleChange}
                />

              </div>

              <div className="hospital-form-group hospital-form-full">

                <label htmlFor="address">
                  Present Address / Location
                </label>

                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your current address or location"
                  value={location.address}
                  onChange={handleChange}
                  rows="3"
                  required
                />

              </div>

              <div className="hospital-location-actions">

                <button
                  type="button"
                  className="hospital-location-cancel"
                  onClick={() =>
                    setShowLocationForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="hospital-location-search"
                  disabled={loading}
                >
                  <Search size={17} />

                  {loading
                    ? "Searching..."
                    : "Search Hospitals"}
                </button>

              </div>

            </form>

          </section>

        )}

        {error && (

          <section className="hospital-search-message hospital-search-error">
            {error}
          </section>

        )}

        {searched && !loading && !error && (

          <section className="hospital-results-section">

            <div className="hospital-results-header">

              <div>
                <h2>
                  Hospitals Near You
                </h2>

                <p>
                  {hospitals.length === 0
                    ? "No registered hospitals were found for this location."
                    : `${hospitals.length} hospital${
                        hospitals.length === 1
                          ? ""
                          : "s"
                      } found`}
                </p>
              </div>

            </div>

            {hospitals.length > 0 ? (

              <div className="hospital-results-list">

                {hospitals.map((hospital) => (

                  <article
                    key={hospital.id}
                    className="hospital-result-card"
                  >

                    <div className="hospital-result-icon">
                      <Hospital size={22} />
                    </div>

                    <div className="hospital-result-content">

                      <h3>
                        {hospital.name}
                      </h3>

                      <p className="hospital-result-location">
                        <MapPin size={15} />

                        {[
                          hospital.address,
                          hospital.city,
                          hospital.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      {hospital.distance_text && (

                        <p className="hospital-result-distance">
                          <Navigation size={15} />

                          {hospital.distance_text}
                        </p>

                      )}

                      {hospital.description && (

                        <p className="hospital-result-description">
                          {hospital.description}
                        </p>

                      )}

                      {hospital.phone && (

                        <p className="hospital-result-contact">
                          {hospital.phone}
                        </p>

                      )}

                    </div>

                    <button
                      type="button"
                      className="hospital-result-button"
                      onClick={() =>
                        handleSelectHospital(hospital)
                      }
                    >
                      Select Hospital
                    </button>

                  </article>

                ))}

              </div>

            ) : (

              <div className="hospital-search-empty">

                <div className="hospital-search-empty-icon">
                  <Hospital size={28} />
                </div>

                <h3>
                  No hospitals found
                </h3>

                <p>
                  We could not find a registered
                  hospital matching the location you
                  entered.
                </p>

              </div>

            )}

          </section>

        )}

      </main>
    </div>
  );
}

export default FindHospitalPage;
