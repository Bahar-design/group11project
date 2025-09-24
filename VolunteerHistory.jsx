import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Status options
const STATUS_OPTIONS = ["Registered", "Attended", "Cancelled", "No-Show"];

const initialData = [
  {
    id: "EVT-001",
    eventName: "Community Clean-up",
    eventDate: "2025-08-02",
    location: "Bay Park",
    role: "Volunteer",
    hours: 4,
    participationStatus: "Attended",
    notes: "Helped with trash pickup and sorting recyclables.",
  },
  {
    id: "EVT-002",
    eventName: "Food Drive",
    eventDate: "2025-09-10",
    location: "Community Center",
    role: "Shift Lead",
    hours: 3.5,
    participationStatus: "Registered",
    notes: "Signed up but could not attend due to illness.",
  },
];

// Validation function
function validateRecord(record) {
  const errors = {};

  if (!record.id || record.id.trim() === "") {
    errors.id = "Event ID is required.";
  } else if (record.id.length > 30) {
    errors.id = "Event ID must be 30 characters or fewer.";
  }

  if (!record.eventName || record.eventName.trim() === "") {
    errors.eventName = "Event name is required.";
  } else if (record.eventName.length > 100) {
    errors.eventName = "Event name must be 100 characters or fewer.";
  }

  if (!record.eventDate || isNaN(Date.parse(record.eventDate))) {
    errors.eventDate = "Valid event date is required (YYYY-MM-DD).";
  }

  if (!record.location || record.location.trim() === "") {
    errors.location = "Location is required.";
  } else if (record.location.length > 100) {
    errors.location = "Location must be 100 characters or fewer.";
  }

  if (!record.role || record.role.trim() === "") {
    errors.role = "Role is required.";
  } else if (record.role.length > 50) {
    errors.role = "Role must be 50 characters or fewer.";
  }

  if (record.hours === "" || record.hours === null) {
    errors.hours = "Hours is required.";
  } else if (isNaN(record.hours)) {
    errors.hours = "Hours must be a number.";
  }

  if (!record.participationStatus || !STATUS_OPTIONS.includes(record.participationStatus)) {
    errors.participationStatus = "Valid participation status is required.";
  }

  if (record.notes && record.notes.length > 500) {
    errors.notes = "Notes must be 500 characters or fewer.";
  }

  return errors;
}

export default function VolunteerHistory() {
  const [data, setData] = useState(initialData);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    const v = validateRecord(form);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    if (editing) {
      setData((prev) => prev.map((r) => (r.id === editing ? form : r)));
    } else {
      if (data.some((r) => r.id === form.id)) {
        setErrors({ id: "Event ID already exists." });
        return;
      }
      setData([form, ...data]);
    }

    setForm({});
    setErrors({});
    setEditing(null);
  };

  const handleEdit = (record) => {
    setEditing(record.id);
    setForm(record);
    setErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setData((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="volunteer-history-container">
  <h2>Volunteer History</h2>

  <form className="volunteer-form-card" onSubmit={handleSave}>
    <h5>{editing ? "Edit Record" : "Add Record"}</h5>

    <div className="row">
      {[
        { name: "id", label: "Event ID" },
        { name: "eventName", label: "Event Name" },
        { name: "eventDate", label: "Date", type: "date" },
        { name: "location", label: "Location" },
        { name: "role", label: "Role" },
        { name: "hours", label: "Hours", type: "number" },
      ].map((f) => (
        <div className="col-md-4 mb-3" key={f.name}>
          <label className="form-label">{f.label}</label>
          <input
            type={f.type || "text"}
            name={f.name}
            value={form[f.name] || ""}
            onChange={handleChange}
            className={`form-control ${errors[f.name] ? "is-invalid" : ""}`}
          />
          {errors[f.name] && <div className="invalid-feedback">{errors[f.name]}</div>}
        </div>
      ))}

      <div className="col-md-4 mb-3">
        <label className="form-label">Status</label>
        <select
          name="participationStatus"
          value={form.participationStatus || ""}
          onChange={handleChange}
          className={`form-select ${errors.participationStatus ? "is-invalid" : ""}`}
        >
          <option value="">-- Select --</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {errors.participationStatus && (
          <div className="invalid-feedback">{errors.participationStatus}</div>
        )}
      </div>

      <div className="col-12 mb-3">
        <label className="form-label">Notes</label>
        <textarea
          name="notes"
          value={form.notes || ""}
          onChange={handleChange}
          className={`form-control ${errors.notes ? "is-invalid" : ""}`}
          rows={2}
        />
        {errors.notes && <div className="invalid-feedback">{errors.notes}</div>}
      </div>
    </div>

    <button type="submit" className="btn btn-primary me-2">
      Save
    </button>
    {editing && (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setForm({});
          setEditing(null);
          setErrors({});
        }}
      >
        Cancel
      </button>
    )}
  </form>

  <table className="volunteer-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Event</th>
        <th>Date</th>
        <th>Location</th>
        <th>Role</th>
        <th>Hours</th>
        <th>Status</th>
        <th>Notes</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {data.length === 0 && (
        <tr>
          <td colSpan="9" className="text-center text-muted">
            No records found
          </td>
        </tr>
      )}
      {data.map((r) => (
        <tr key={r.id}>
          <td>{r.id}</td>
          <td>{r.eventName}</td>
          <td>{r.eventDate}</td>
          <td>{r.location}</td>
          <td>{r.role}</td>
          <td>{r.hours}</td>
          <td>{r.participationStatus}</td>
          <td>{r.notes}</td>
          <td>
            <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(r)}>
              Edit
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
}
