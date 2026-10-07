import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Hospital,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  addHospitalService,
  deactivateHospitalService,
  getMedicalServiceCatalogue,
  getMyHospitalServices,
  updateHospitalService,
} from "../../services/hospitalService";

import "./ServicesManagementPage.css";

const EMPTY_FORM = {
  service_id: "",
  duration_minutes: "30",
  price: "",
  status: "ACTIVE",
};

function ServicesManagementPage() {
  const navigate = useNavigate();

  const [hospital, setHospital] = useState(null);
  const [services, setServices] = useState([]);
  const [catalogue, setCatalogue] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [hospitalData, catalogueData] = await Promise.all([
        getMyHospitalServices(),
        getMedicalServiceCatalogue(),
      ]);

      setHospital(hospitalData.hospital || null);
      setServices(
        Array.isArray(hospitalData.services)
          ? hospitalData.services
          : []
      );

      setCatalogue(
        Array.isArray(catalogueData.services)
          ? catalogueData.services
          : Array.isArray(catalogueData)
            ? catalogueData
            : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load hospital services."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const activeCount = services.filter(
    (service) => service.status === "ACTIVE"
  ).length;

  const inactiveCount = services.filter(
    (service) => service.status !== "ACTIVE"
  ).length;

  const filteredServices = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !searchText ||
        [
          service.service_name,
          service.description,
          service.category,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(searchText)
          );

      const matchesStatus =
        statusFilter === "ALL" ||
        service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [services, search, statusFilter]);

  const openAddForm = () => {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEditForm = (service) => {
    setEditingService(service);
    setForm({
      service_id: String(service.service_id),
      duration_minutes: String(service.duration_minutes ?? 30),
      price: service.price == null ? "" : String(service.price),
      status: service.status || "ACTIVE",
    });
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingService(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const duration = Number(form.duration_minutes);
    const price =
      form.price.trim() === "" ? null : Number(form.price);

    if (!editingService && !form.service_id) {
      setError("Please select a medical service.");
      return;
    }

    if (!Number.isInteger(duration) || duration < 1) {
      setError("Duration must be a positive whole number of minutes.");
      return;
    }

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setError("Enter a valid price that is zero or greater.");
      return;
    }

    const payload = {
      duration_minutes: duration,
      price,
    };

    try {
      setSaving(true);

      if (editingService) {
        payload.status = form.status;

        await updateHospitalService(editingService.id, payload);
        setSuccess("Service updated successfully.");
      } else {
        await addHospitalService({
          service_id: Number(form.service_id),
          ...payload,
        });
        setSuccess("Service added successfully.");
      }

      setFormOpen(false);
      setEditingService(null);
      setForm(EMPTY_FORM);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save this service."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (service) => {
    const confirmed = window.confirm(
      `Deactivate "${service.service_name}"? Patients will no longer be able to book this service if your booking flow filters inactive services.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deactivateHospitalService(service.id);
      setSuccess(`${service.service_name} has been deactivated.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to deactivate this service."
      );
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "Not set";
    }

    return `₦${Number(price).toLocaleString("en-NG", {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="services-management-page">
      <main className="services-management-main">
        <button
          type="button"
          className="services-back-button"
          onClick={() => navigate("/hospital/dashboard")}
        >
          <ArrowLeft size={17} />
          Back to Hospital Dashboard
        </button>

        <header className="services-page-header">
          <div>
            <div className="services-eyebrow">
              <Stethoscope size={16} />
              HOSPITAL MANAGEMENT
            </div>

            <h1>Services Management</h1>

            <p>
              Manage the medical services your hospital offers,
              including their prices and appointment durations.
            </p>

            {hospital?.name && (
              <div className="services-hospital-name">
                <Hospital size={17} />
                {hospital.name}
              </div>
            )}
          </div>

          <button
            type="button"
            className="services-primary-button"
            onClick={openAddForm}
          >
            <Plus size={18} />
            Add Service
          </button>
        </header>

        {error && (
          <div className="services-alert services-alert-error" role="alert">
            <XCircle size={18} />
            <span>{error}</span>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="services-alert services-alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>{success}</span>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setSuccess("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="services-stats">
          <article className="services-stat-card">
            <span className="services-stat-icon">
              <Stethoscope size={20} />
            </span>
            <div>
              <p>Total services</p>
              <strong>{services.length}</strong>
            </div>
          </article>

          <article className="services-stat-card">
            <span className="services-stat-icon services-stat-active">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <p>Active services</p>
              <strong>{activeCount}</strong>
            </div>
          </article>

          <article className="services-stat-card">
            <span className="services-stat-icon services-stat-inactive">
              <XCircle size={20} />
            </span>
            <div>
              <p>Inactive services</p>
              <strong>{inactiveCount}</strong>
            </div>
          </article>
        </section>

        {formOpen && (
          <section className="services-form-card">
            <div className="services-form-header">
              <div>
                <h2>
                  {editingService ? "Edit Service" : "Add Hospital Service"}
                </h2>
                <p>
                  {editingService
                    ? "Update this service's price, duration or status."
                    : "Choose a service from the existing medical services catalogue."}
                </p>
              </div>

              <button
                type="button"
                className="services-icon-button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={19} />
              </button>
            </div>

            <form className="services-form" onSubmit={handleSubmit}>
              {!editingService && (
                <div className="services-form-field services-form-full">
                  <label htmlFor="service_id">Medical service</label>
                  <select
                    id="service_id"
                    name="service_id"
                    value={form.service_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a medical service</option>
                    {catalogue.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                        {item.category ? ` — ${item.category}` : ""}
                      </option>
                    ))}
                  </select>

                  {catalogue.length === 0 && (
                    <small>
                      No catalogue services were returned. Check that the
                      medical services catalogue endpoint is working.
                    </small>
                  )}
                </div>
              )}

              {editingService && (
                <div className="services-selected-name services-form-full">
                  <span>Medical service</span>
                  <strong>{editingService.service_name}</strong>
                  {editingService.category && (
                    <small>{editingService.category}</small>
                  )}
                </div>
              )}

              <div className="services-form-field">
                <label htmlFor="duration_minutes">
                  Duration (minutes)
                </label>
                <input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  min="1"
                  step="1"
                  value={form.duration_minutes}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="services-form-field">
                <label htmlFor="price">Price (₦)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Leave blank if not set"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              {editingService && (
                <div className="services-form-field services-form-full">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              )}

              <div className="services-form-actions services-form-full">
                <button
                  type="button"
                  className="services-secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="services-primary-button"
                  disabled={saving || (!editingService && catalogue.length === 0)}
                >
                  {saving ? (
                    <>
                      <LoaderCircle className="services-spin" size={17} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      {editingService ? "Save Changes" : "Add Service"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="services-list-card">
          <div className="services-list-header">
            <div>
              <h2>Hospital Services</h2>
              <p>Services currently registered for your hospital.</p>
            </div>

            <button
              type="button"
              className="services-refresh-button"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={loading ? "services-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="services-toolbar">
            <div className="services-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search services or categories..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div className="services-loading">
              <LoaderCircle className="services-spin" size={30} />
              <h3>Loading hospital services...</h3>
              <p>Getting your current service list.</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="services-empty">
              <span>
                <Stethoscope size={27} />
              </span>
              <h3>
                {services.length === 0
                  ? "No services added yet"
                  : "No matching services"}
              </h3>
              <p>
                {services.length === 0
                  ? "Add a service from the medical services catalogue to get started."
                  : "Try changing your search or status filter."}
              </p>

              {services.length === 0 && (
                <button
                  type="button"
                  className="services-primary-button"
                  onClick={openAddForm}
                >
                  <Plus size={17} />
                  Add Your First Service
                </button>
              )}
            </div>
          ) : (
            <div className="services-table-wrap">
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredServices.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <div className="services-name-cell">
                          <span className="services-row-icon">
                            <Stethoscope size={18} />
                          </span>
                          <div>
                            <strong>{service.service_name}</strong>
                            {service.description && (
                              <small>{service.description}</small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>{service.category || "Uncategorised"}</td>

                      <td>
                        <span className="services-duration">
                          <Clock3 size={15} />
                          {service.duration_minutes ?? 30} min
                        </span>
                      </td>

                      <td className="services-price">
                        {formatPrice(service.price)}
                      </td>

                      <td>
                        <span
                          className={`services-status ${
                            service.status === "ACTIVE"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          {service.status === "ACTIVE"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="services-row-actions">
                          <button
                            type="button"
                            className="services-edit-button"
                            onClick={() => openEditForm(service)}
                            title="Edit service"
                            aria-label={`Edit ${service.service_name}`}
                          >
                            <Pencil size={16} />
                          </button>

                          {service.status === "ACTIVE" && (
                            <button
                              type="button"
                              className="services-deactivate-button"
                              onClick={() => handleDeactivate(service)}
                              title="Deactivate service"
                              aria-label={`Deactivate ${service.service_name}`}
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ServicesManagementPage;
