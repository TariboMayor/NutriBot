import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";


import {
  ArrowLeft,
  Edit3,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  X,
  XCircle,
} from "lucide-react";


import {
  createDoctor,
  getHospitalDoctors,
  updateDoctor,
  deactivateDoctor,
} from "../../services/doctorService";


import "./HospitalDoctorsPage.css";


function HospitalDoctorsPage() {

  const location =
    useLocation();

  const navigate =
    useNavigate();


  const hospital =
    location.state?.hospital ||
    null;


  const hospitalId =
    hospital?.id ||
    hospital?.hospital_id ||
    null;


  const [doctors, setDoctors] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [searchTerm, setSearchTerm] =
    useState("");


  const [showForm, setShowForm] =
    useState(false);


  const [editingDoctor, setEditingDoctor] =
    useState(null);


  const [saving, setSaving] =
    useState(false);


  const [formError, setFormError] =
    useState("");


  const [formData, setFormData] =
    useState({
      first_name: "",
      last_name: "",
      specialty: "",
      license_number: "",
      phone: "",
      email: "",
      bio: "",
    });


  // ======================================================
  // LOAD DOCTORS
  // ======================================================

  const loadDoctors =
    async () => {

      if (!hospitalId) {

        setLoading(false);

        setError(
          "Hospital information is unavailable. Please return to the hospital dashboard and try again."
        );

        return;

      }


      try {

        setLoading(true);

        setError("");


        const data =
          await getHospitalDoctors(
            hospitalId
          );


        if (
          Array.isArray(data)
        ) {

          setDoctors(data);

        } else {

          setDoctors(
            Array.isArray(
              data?.doctors
            )
              ? data.doctors
              : []
          );

        }

      } catch (
        requestError
      ) {

        console.error(
          "Hospital doctors error:",
          requestError
        );


        setError(
          requestError.message ||
            "Unable to load hospital doctors."
        );

      } finally {

        setLoading(false);

      }

    };


  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {

    const timer =
      setTimeout(() => {
        loadDoctors();
      }, 0);


    return () => {
      clearTimeout(timer);
    };

  }, [hospitalId]);


  // ======================================================
  // FILTER DOCTORS
  // ======================================================

  const filteredDoctors =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      if (!search) {
        return doctors;
      }


      return doctors.filter(
        (doctor) => {

          const fullName =
            `${doctor.first_name || ""} ${
              doctor.last_name || ""
            }`.toLowerCase();


          return (
            fullName.includes(
              search
            ) ||

            String(
              doctor.specialty || ""
            )
              .toLowerCase()
              .includes(search) ||

            String(
              doctor.license_number || ""
            )
              .toLowerCase()
              .includes(search) ||

            String(
              doctor.email || ""
            )
              .toLowerCase()
              .includes(search)
          );

        }
      );

    }, [
      doctors,
      searchTerm,
    ]);


  // ======================================================
  // ADD DOCTOR
  // ======================================================

  const handleAddDoctor =
    () => {

      setEditingDoctor(
        null
      );


      setFormData({
        first_name: "",
        last_name: "",
        specialty: "",
        license_number: "",
        phone: "",
        email: "",
        bio: "",
      });


      setFormError("");

      setShowForm(true);

    };


  // ======================================================
  // EDIT DOCTOR
  // ======================================================

  const handleEditDoctor =
    (doctor) => {

      setEditingDoctor(
        doctor
      );


      setFormData({

        first_name:
          doctor.first_name ||
          "",

        last_name:
          doctor.last_name ||
          "",

        specialty:
          doctor.specialty ||
          "",

        license_number:
          doctor.license_number ||
          "",

        phone:
          doctor.phone ||
          "",

        email:
          doctor.email ||
          "",

        bio:
          doctor.bio ||
          "",

      });


      setFormError("");

      setShowForm(true);

    };


  // ======================================================
  // CLOSE FORM
  // ======================================================

  const handleCloseForm =
    () => {

      if (saving) {
        return;
      }


      setShowForm(false);

      setEditingDoctor(
        null
      );

      setFormError("");

    };


  // ======================================================
  // HANDLE FORM INPUT
  // ======================================================

  const handleChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setFormData(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

    };


  // ======================================================
  // SAVE DOCTOR
  // ======================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setFormError("");


      if (
        !formData.first_name.trim() ||
        !formData.last_name.trim() ||
        !formData.specialty.trim()
      ) {

        setFormError(
          "First name, last name and specialty are required."
        );

        return;

      }


      if (!hospitalId) {

        setFormError(
          "Hospital information is unavailable."
        );

        return;

      }


      try {

        setSaving(true);


        const doctorData = {

          first_name:
            formData.first_name.trim(),

          last_name:
            formData.last_name.trim(),

          specialty:
            formData.specialty.trim(),

          license_number:
            formData.license_number.trim() ||
            null,

          phone:
            formData.phone.trim() ||
            null,

          email:
            formData.email.trim() ||
            null,

          bio:
            formData.bio.trim() ||
            null,

        };


        if (editingDoctor) {

          await updateDoctor(
            editingDoctor.id,
            doctorData
          );

        } else {

          await createDoctor({
            hospital_id:
              hospitalId,

            ...doctorData,
          });

        }


        setShowForm(false);

        setEditingDoctor(
          null
        );


        await loadDoctors();

      } catch (
        requestError
      ) {

        console.error(
          "Save doctor error:",
          requestError
        );


        setFormError(
          requestError.message ||
            "Unable to save doctor."
        );

      } finally {

        setSaving(false);

      }

    };


  // ======================================================
  // DEACTIVATE DOCTOR
  // ======================================================

  const handleDeactivate =
    async (doctor) => {

      const doctorName =
        `${doctor.first_name || ""} ${
          doctor.last_name || ""
        }`.trim();


      const confirmed =
        window.confirm(
          `Deactivate Dr. ${doctorName}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setError("");


        await deactivateDoctor(
          doctor.id
        );


        await loadDoctors();

      } catch (
        requestError
      ) {

        console.error(
          "Deactivate doctor error:",
          requestError
        );


        setError(
          requestError.message ||
            "Unable to deactivate doctor."
        );

      }

    };


  // ======================================================
  // BACK
  // ======================================================

  const handleBack =
    () => {

      navigate(
        "/hospital/dashboard"
      );

    };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {

    return (
      <div className="hospital-doctors-page">

        <main className="hospital-doctors-main">

          <div className="hospital-doctors-loading">

            <Stethoscope size={30} />

            <h2>
              Loading Doctors
            </h2>

            <p>
              Getting your hospital's doctors...
            </p>

          </div>

        </main>

      </div>
    );

  }


  // ======================================================
  // HOSPITAL ID ERROR
  // ======================================================

  if (!hospitalId) {

    return (
      <div className="hospital-doctors-page">

        <main className="hospital-doctors-main">

          <button
            type="button"
            className="hospital-doctors-back"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>


          <section className="hospital-doctors-error">

            <XCircle size={32} />

            <h2>
              Hospital Information Unavailable
            </h2>

            <p>
              Please return to the hospital
              dashboard and open Doctors from
              there.
            </p>

          </section>

        </main>

      </div>
    );

  }


  return (
    <div className="hospital-doctors-page">

      <main className="hospital-doctors-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="hospital-doctors-header">

          <div>

            <button
              type="button"
              className="hospital-doctors-back"
              onClick={handleBack}
            >
              <ArrowLeft size={17} />
              Dashboard
            </button>


            <div className="hospital-doctors-eyebrow">

              <Stethoscope size={16} />

              Doctor Management

            </div>


            <h1>
              Doctors
            </h1>


            <p>

              Manage the doctors who provide
              services at{" "}

              <strong>
                {hospital?.name ||
                  "your hospital"}
              </strong>.

            </p>

          </div>


          <div className="hospital-doctors-header-actions">

            <button
              type="button"
              className="hospital-doctors-refresh"
              onClick={loadDoctors}
            >
              <RefreshCw size={16} />
              Refresh
            </button>


            <button
              type="button"
              className="hospital-doctors-add"
              onClick={
                handleAddDoctor
              }
            >
              <Plus size={17} />
              Add Doctor
            </button>

          </div>

        </header>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="hospital-doctors-inline-error">

            <XCircle size={18} />

            <span>
              {error}
            </span>

          </div>
        )}


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="hospital-doctors-toolbar">

          <div className="hospital-doctors-summary">

            <div className="hospital-doctors-summary-icon">

              <Stethoscope size={20} />

            </div>


            <div>

              <strong>
                {doctors.length}
              </strong>

              <span>
                {doctors.length === 1
                  ? "Doctor"
                  : "Doctors"}
              </span>

            </div>

          </div>


          <div className="hospital-doctors-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search doctors..."
              value={
                searchTerm
              }
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />

          </div>

        </section>


        {/* =================================================
            DOCTORS
        ================================================= */}

        {filteredDoctors.length === 0 ? (

          <section className="hospital-doctors-empty">

            <div className="hospital-doctors-empty-icon">

              <Stethoscope size={28} />

            </div>


            <h2>

              {doctors.length === 0
                ? "No doctors yet"
                : "No doctors found"}

            </h2>


            <p>

              {doctors.length === 0
                ? "Add your first doctor to begin managing doctors and their services."
                : "Try a different search term."}

            </p>


            {doctors.length === 0 && (

              <button
                type="button"
                className="hospital-doctors-add"
                onClick={
                  handleAddDoctor
                }
              >
                <Plus size={17} />
                Add Doctor
              </button>

            )}

          </section>

        ) : (

          <section className="hospital-doctors-grid">

            {filteredDoctors.map(
              (doctor) => {

                const doctorName =
                  `${doctor.first_name || ""} ${
                    doctor.last_name || ""
                  }`.trim() ||
                  "Doctor";


                return (

                  <article
                    className="hospital-doctor-card"
                    key={
                      doctor.id
                    }
                  >

                    <div className="hospital-doctor-card-top">

                      <div className="hospital-doctor-avatar">

                        {doctor.first_name
                          ?.charAt(0)
                          .toUpperCase() ||
                          "D"}

                      </div>


                      <span
                        className={`hospital-doctor-status ${
                          doctor.status ===
                          "ACTIVE"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {doctor.status ||
                          "ACTIVE"}
                      </span>

                    </div>


                    <div className="hospital-doctor-card-body">

                      <h2>
                        Dr. {doctorName}
                      </h2>


                      <p className="hospital-doctor-specialty">

                        {doctor.specialty ||
                          "Medical Doctor"}

                      </p>


                      {doctor.license_number && (

                        <div className="hospital-doctor-detail">

                          <UserRound size={15} />

                          <span>
                            License:{" "}
                            {
                              doctor.license_number
                            }
                          </span>

                        </div>

                      )}


                      {doctor.phone && (

                        <div className="hospital-doctor-detail">

                          <Phone size={15} />

                          <span>
                            {doctor.phone}
                          </span>

                        </div>

                      )}


                      {doctor.email && (

                        <div className="hospital-doctor-detail">

                          <Mail size={15} />

                          <span>
                            {doctor.email}
                          </span>

                        </div>

                      )}

                    </div>


                    <div className="hospital-doctor-card-actions">

                      <button
                        type="button"
                        className="hospital-doctor-edit"
                        onClick={() =>
                          handleEditDoctor(
                            doctor
                          )
                        }
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>


                      {doctor.status ===
                        "ACTIVE" && (

                        <button
                          type="button"
                          className="hospital-doctor-deactivate"
                          onClick={() =>
                            handleDeactivate(
                              doctor
                            )
                          }
                        >
                          <X size={16} />
                          Deactivate
                        </button>

                      )}

                    </div>

                  </article>

                );

              }
            )}

          </section>

        )}


        {/* =================================================
            DOCTOR FORM MODAL
        ================================================= */}

        {showForm && (

          <div className="hospital-doctor-modal-overlay">

            <div
              className="hospital-doctor-modal"
              role="dialog"
              aria-modal="true"
            >

              <div className="hospital-doctor-modal-header">

                <div>

                  <div className="hospital-doctor-modal-icon">

                    <Stethoscope size={21} />

                  </div>


                  <h2>

                    {editingDoctor
                      ? "Edit Doctor"
                      : "Add Doctor"}

                  </h2>


                  <p>

                    {editingDoctor
                      ? "Update this doctor's information."
                      : "Add a doctor to your hospital."}

                  </p>

                </div>


                <button
                  type="button"
                  className="hospital-doctor-modal-close"
                  onClick={
                    handleCloseForm
                  }
                  disabled={saving}
                >
                  <X size={19} />
                </button>

              </div>


              {formError && (

                <div className="hospital-doctor-form-error">

                  <XCircle size={17} />

                  <span>
                    {formError}
                  </span>

                </div>

              )}


              <form
                className="hospital-doctor-form"
                onSubmit={
                  handleSubmit
                }
              >

                <div className="hospital-doctor-form-row">

                  <div className="hospital-doctor-field">

                    <label htmlFor="first_name">
                      First name *
                    </label>

                    <input
                      id="first_name"
                      name="first_name"
                      value={
                        formData.first_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. John"
                      disabled={saving}
                    />

                  </div>


                  <div className="hospital-doctor-field">

                    <label htmlFor="last_name">
                      Last name *
                    </label>

                    <input
                      id="last_name"
                      name="last_name"
                      value={
                        formData.last_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Smith"
                      disabled={saving}
                    />

                  </div>

                </div>


                <div className="hospital-doctor-field">

                  <label htmlFor="specialty">
                    Specialty *
                  </label>

                  <input
                    id="specialty"
                    name="specialty"
                    value={
                      formData.specialty
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Cardiology"
                    disabled={saving}
                  />

                </div>


                <div className="hospital-doctor-field">

                  <label htmlFor="license_number">
                    Medical license number
                  </label>

                  <input
                    id="license_number"
                    name="license_number"
                    value={
                      formData.license_number
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter license number"
                    disabled={saving}
                  />

                </div>


                <div className="hospital-doctor-form-row">

                  <div className="hospital-doctor-field">

                    <label htmlFor="phone">
                      Phone
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 08012345678"
                      disabled={saving}
                    />

                  </div>


                  <div className="hospital-doctor-field">

                    <label htmlFor="email">
                      Email
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="doctor@example.com"
                      disabled={saving}
                    />

                  </div>

                </div>


                <div className="hospital-doctor-field">

                  <label htmlFor="bio">
                    Bio
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    value={
                      formData.bio
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Short professional biography..."
                    rows={4}
                    disabled={saving}
                  />

                </div>


                <div className="hospital-doctor-form-actions">

                  <button
                    type="button"
                    className="hospital-doctor-cancel"
                    onClick={
                      handleCloseForm
                    }
                    disabled={saving}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="hospital-doctor-save"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingDoctor
                        ? "Save Changes"
                        : "Add Doctor"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}


export default HospitalDoctorsPage;
