import { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import "./Profile.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitialForm(user, displayName) {
  return {
    fullName: displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
  };
}

export default function Profile() {
  useScrollAnimations();

  const { user, displayName, updateUser } = useUser();
  const [form, setForm] = useState(() => getInitialForm(user, displayName));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    setForm(getInitialForm(user, displayName));
  }, [user, displayName]);

  const initials = useMemo(
    () => (form.fullName || "U").trim().charAt(0).toUpperCase(),
    [form.fullName],
  );

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.phone && form.phone.replace(/\D/g, "").length < 7) {
      nextErrors.phone = "Phone number looks too short.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(false);

    if (!validate()) return;

    const [firstName = "", ...rest] = form.fullName.trim().split(" ");
    const lastName = rest.join(" ");

    updateUser({
      name: form.fullName.trim(),
      username: form.fullName.trim(),
      first_name: firstName,
      last_name: lastName,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const onPasswordChange = (field) => (event) => {
    setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validatePasswordForm = () => {
    const nextErrors = {};
    const current = passwordForm.currentPassword;
    const next = passwordForm.newPassword;
    const confirm = passwordForm.confirmPassword;

    if (!current) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!next) {
      nextErrors.newPassword = "New password is required.";
    } else if (next.length < 8) {
      nextErrors.newPassword = "Use at least 8 characters.";
    } else if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) {
      nextErrors.newPassword = "Include at least one letter and one number.";
    }

    if (!confirm) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (next !== confirm) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (current && next && current === next) {
      nextErrors.newPassword = "New password must be different.";
    }

    setPasswordErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePasswordSave = (event) => {
    event.preventDefault();
    setPasswordSaved(false);

    if (!validatePasswordForm()) return;

    // Frontend-only password update state for now.
    setPasswordSaved(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTimeout(() => setPasswordSaved(false), 1800);
  };

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="container profile-hero__inner">
          <span className="section-label">Account</span>
          <h1>My Profile</h1>
          <p>
            Keep your details up to date for faster checkout and a personalized
            experience.
          </p>
        </div>
      </section>

      <section className="profile-content container">
        <aside className="profile-identity-card reveal">
          <div className="profile-identity-avatar">{initials}</div>
          <h2>{form.fullName || "Adventurer"}</h2>
          <p>{form.email || "no-email@shikhar.local"}</p>
          <dl>
            <div>
              <dt>Phone</dt>
              <dd>{form.phone || "Not set"}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{form.location || "Not set"}</dd>
            </div>
          </dl>
        </aside>

        <div className="profile-main-column">
          <form
            className="profile-form-card reveal"
            onSubmit={handleSave}
            noValidate
          >
            <div className="profile-form-card__header">
              <h3>Edit Details</h3>
              <span>Frontend-only save for now</span>
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
                  placeholder="Tell us about your favorite adventure style..."
                />
              </label>
            </div>

            <div className="profile-form-actions">
              {saved && <p className="profile-saved">Profile updated.</p>}
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>

          <form
            className="profile-password-card reveal"
            onSubmit={handlePasswordSave}
            noValidate
          >
            <div className="profile-form-card__header">
              <h3>Change Password</h3>
              <span>Frontend-only save for now</span>
            </div>

            <div className="profile-password-grid">
              <label>
                Current Password
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={onPasswordChange("currentPassword")}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
                {passwordErrors.currentPassword && (
                  <small>{passwordErrors.currentPassword}</small>
                )}
              </label>

              <label>
                New Password
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={onPasswordChange("newPassword")}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                {passwordErrors.newPassword && (
                  <small>{passwordErrors.newPassword}</small>
                )}
              </label>

              <label>
                Confirm New Password
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={onPasswordChange("confirmPassword")}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                {passwordErrors.confirmPassword && (
                  <small>{passwordErrors.confirmPassword}</small>
                )}
              </label>
            </div>

            <div className="profile-form-actions">
              {passwordSaved && (
                <p className="profile-saved">Password changed successfully.</p>
              )}
              <button type="submit" className="btn btn-primary">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
