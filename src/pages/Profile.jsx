// src\pages\Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import api from "../utils/api";
import "./Profile.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitialForm(user, displayName) {
  return {
    fullName:  displayName || "",
    email:     user?.email    || "",
    phone:     user?.phone    || "",
    location:  user?.location || "",
    bio:       user?.bio      || "",
  };
}

export default function Profile() {
  useScrollAnimations();

  const { user, displayName, updateUser } = useUser();

  const [form, setForm]     = useState(() => getInitialForm(user, displayName));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [saveError, setSaveError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    old_password:     "",
    new_password:     "",
    confirm_password: "",
  });
  const [passwordErrors, setPasswordErrors]   = useState({});
  const [passwordSaving, setPasswordSaving]   = useState(false);
  const [passwordSaved, setPasswordSaved]     = useState(false);
  const [passwordApiError, setPasswordApiError] = useState("");

  // Keep form in sync when user loads from API
  useEffect(() => {
    setForm(getInitialForm(user, displayName));
  }, [user, displayName]);

  const initials = useMemo(
    () => (form.fullName || "U").trim().charAt(0).toUpperCase(),
    [form.fullName],
  );

  // ── Profile form ────────────────────────────────────────

  const validate = () => {
    const next = {};
    if (!form.fullName.trim())                              next.fullName = "Full name is required.";
    if (!form.email.trim())                                 next.email    = "Email is required.";
    else if (!emailPattern.test(form.email.trim()))         next.email    = "Enter a valid email address.";
    if (form.phone && form.phone.replace(/\D/g, "").length < 7) next.phone = "Phone number looks too short.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaved(false);
    setSaveError("");
    if (!validate()) return;

    const [firstName = "", ...rest] = form.fullName.trim().split(" ");
    const lastName = rest.join(" ");

    setSaving(true);
    try {
      const res = await api.patch("profile/", {
        username:   form.fullName.trim().replace(/\s+/g, "_").toLowerCase(),
        first_name: firstName,
        last_name:  lastName,
        email:      form.email.trim().toLowerCase(),
      });

      // Merge API response back into UserContext + localStorage
      updateUser({
        ...res.data,
        phone:    form.phone.trim(),
        location: form.location.trim(),
        bio:      form.bio.trim(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const first = Object.values(data)[0];
        setSaveError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setSaveError("Failed to save profile. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Password form ────────────────────────────────────────

  const validatePasswordForm = () => {
    const next = {};
    const { old_password, new_password, confirm_password } = passwordForm;

    if (!old_password)                                                next.old_password     = "Current password is required.";
    if (!new_password)                                                next.new_password     = "New password is required.";
    else if (new_password.length < 8)                                 next.new_password     = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(new_password) || !/\d/.test(new_password)) next.new_password = "Include at least one letter and one number.";
    if (!confirm_password)                                            next.confirm_password = "Please confirm your new password.";
    else if (new_password !== confirm_password)                       next.confirm_password = "Passwords do not match.";
    if (old_password && new_password && old_password === new_password) next.new_password   = "New password must be different.";

    setPasswordErrors(next);
    return Object.keys(next).length === 0;
  };

  const onPasswordChange = (field) => (event) => {
    setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (passwordErrors[field]) setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    if (passwordApiError) setPasswordApiError("");
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    setPasswordSaved(false);
    setPasswordApiError("");
    if (!validatePasswordForm()) return;

    setPasswordSaving(true);
    try {
      await api.post("change-password/", {
        old_password:     passwordForm.old_password,
        new_password:     passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      });

      setPasswordSaved(true);
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setPasswordSaved(false), 1800);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.old_password) {
        setPasswordErrors((prev) => ({ ...prev, old_password: data.old_password[0] || "Incorrect password." }));
      } else if (data?.detail) {
        setPasswordApiError(data.detail);
      } else if (data && typeof data === "object") {
        const first = Object.values(data)[0];
        setPasswordApiError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setPasswordApiError("Failed to update password. Please try again.");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="container profile-hero__inner">
          <span className="section-label">Account</span>
          <h1>My Profile</h1>
          <p>Keep your details up to date for faster checkout and a personalised experience.</p>
        </div>
      </section>

      <section className="profile-content container">
        <aside className="profile-identity-card reveal">
          <div className="profile-identity-avatar">{initials}</div>
          <h2>{form.fullName || "Adventurer"}</h2>
          <p>{form.email || "no-email@shikhar.local"}</p>
          <dl>
            <div><dt>Phone</dt><dd>{form.phone || "Not set"}</dd></div>
            <div><dt>Location</dt><dd>{form.location || "Not set"}</dd></div>
          </dl>
        </aside>

        <div className="profile-main-column">
          {/* ── Edit Details ── */}
          <form className="profile-form-card reveal" onSubmit={handleSave} noValidate>
            <div className="profile-form-card__header">
              <h3>Edit Details</h3>
              <span>Saved to your account</span>
            </div>

            <div className="profile-form-grid">
              <label>
                Full Name
                <input
                  type="text"
                  value={form.fullName}
                  onChange={onChange("fullName")}
                  placeholder="Your full name"
                />
                {errors.fullName && <small>{errors.fullName}</small>}
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  placeholder="you@example.com"
                />
                {errors.email && <small>{errors.email}</small>}
              </label>

              <label>
                Phone
                <input
                  type="tel"
                  value={form.phone}
                  onChange={onChange("phone")}
                  placeholder="+977 98XXXXXXXX"
                />
                {errors.phone && <small>{errors.phone}</small>}
              </label>

              <label>
                Location
                <input
                  type="text"
                  value={form.location}
                  onChange={onChange("location")}
                  placeholder="Kathmandu, Nepal"
                />
              </label>

              <label className="profile-form-grid__full">
                Bio
                <textarea
                  rows="4"
                  value={form.bio}
                  onChange={onChange("bio")}
                  placeholder="Tell us about your favourite adventure style..."
                />
              </label>
            </div>

            <div className="profile-form-actions">
              {saved     && <p className="profile-saved">Profile updated.</p>}
              {saveError && <p className="profile-error">{saveError}</p>}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>

          {/* ── Change Password ── */}
          <form className="profile-password-card reveal" onSubmit={handlePasswordSave} noValidate>
            <div className="profile-form-card__header">
              <h3>Change Password</h3>
              <span>Saved to your account</span>
            </div>

            <div className="profile-password-grid">
              <label>
                Current Password
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={onPasswordChange("old_password")}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                {passwordErrors.old_password && <small>{passwordErrors.old_password}</small>}
              </label>

              <label>
                New Password
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={onPasswordChange("new_password")}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                {passwordErrors.new_password && <small>{passwordErrors.new_password}</small>}
              </label>

              <label>
                Confirm New Password
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={onPasswordChange("confirm_password")}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                {passwordErrors.confirm_password && <small>{passwordErrors.confirm_password}</small>}
              </label>
            </div>

            <div className="profile-form-actions">
              {passwordSaved    && <p className="profile-saved">Password changed successfully.</p>}
              {passwordApiError && <p className="profile-error">{passwordApiError}</p>}
              <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                {passwordSaving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}