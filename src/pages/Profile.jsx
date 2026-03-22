import { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import api from "../utils/api";
import "./Profile.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dataImagePattern = /^data:image\//i;
const maxAvatarBytes = 2 * 1024 * 1024;
const profileSections = [
  {
    key: "personal",
    label: "Personal Details",
    title: "Personal Details",
    description: "Update your basic profile details.",
  },
  {
    key: "contact",
    label: "Contact",
    title: "Contact Information",
    description: "Manage your email and phone number.",
  },
  {
    key: "address",
    label: "Address",
    title: "Address Details",
    description: "Keep your delivery address accurate.",
  },
  {
    key: "security",
    label: "Change Password",
    title: "Change Password",
    description: "Set a stronger password for account safety.",
  },
];

function getInitialForm(user, displayName) {
  return {
    fullName: displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatar || user?.profile_photo || "",
    bio: user?.bio || "",
    addressLine: user?.address_line || user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    postalCode: user?.postal_code || "",
    country: user?.country || "",
    location: user?.location || "",
  };
}

export default function Profile() {
  useScrollAnimations();

  const { user, displayName, updateUser, isAdmin } = useUser();
  const [form, setForm] = useState(() => getInitialForm(user, displayName));
  const avatarInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState("personal");
  const [errors, setErrors] = useState({});
  const [savedSection, setSavedSection] = useState("");
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

  const selectedSection = useMemo(
    () =>
      profileSections.find((section) => section.key === activeSection) ||
      profileSections[0],
    [activeSection],
  );

  const accountType = isAdmin ? "Admin" : "User";

  const validate = (section) => {
    const nextErrors = {};

    if (section === "personal") {
      if (!form.fullName.trim()) {
        nextErrors.fullName = "Full name is required.";
      }

      if (
        form.avatarUrl &&
        !/^https?:\/\//i.test(form.avatarUrl.trim()) &&
        !dataImagePattern.test(form.avatarUrl.trim())
      ) {
        nextErrors.avatarUrl = "Use a valid image URL or upload an image file.";
      }
    }

    if (section === "contact") {
      if (!form.email.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!emailPattern.test(form.email.trim())) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (form.phone && form.phone.replace(/\D/g, "").length < 7) {
        nextErrors.phone = "Phone number looks too short.";
      }
    }

  const validate = () => {
    const next = {};
    if (!form.fullName.trim())                              next.fullName = "Full name is required.";
    if (!form.email.trim())                                 next.email    = "Email is required.";
    else if (!emailPattern.test(form.email.trim()))         next.email    = "Enter a valid email address.";
    if (form.phone && form.phone.replace(/\D/g, "").length < 7) next.phone = "Phone number looks too short.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleProfileSave = (event) => {
    event.preventDefault();
    setSavedSection("");

    if (!validate(activeSection)) return;

    const [firstName = "", ...rest] = form.fullName.trim().split(" ");
    const lastName = rest.join(" ");

    updateUser({
      name: form.fullName.trim(),
      username: form.fullName.trim(),
      first_name: firstName,
      last_name: lastName,
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      avatar: form.avatarUrl.trim(),
      profile_photo: form.avatarUrl.trim(),
      location: form.location.trim(),
      address_line: form.addressLine.trim(),
      address: form.addressLine.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postalCode.trim(),
      country: form.country.trim(),
      bio: form.bio.trim(),
    });

    setSavedSection(activeSection);
    setTimeout(() => setSavedSection(""), 1800);
  };

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Password form ────────────────────────────────────────

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatarUrl: "Please select a valid image file.",
      }));
      event.target.value = "";
      return;
    }

    if (file.size > maxAvatarBytes) {
      setErrors((prev) => ({
        ...prev,
        avatarUrl: "Image must be 2MB or smaller.",
      }));
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fileData = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, avatarUrl: fileData }));
      setErrors((prev) => ({ ...prev, avatarUrl: undefined }));
    };

    reader.onerror = () => {
      setErrors((prev) => ({
        ...prev,
        avatarUrl: "We could not read this image. Try another file.",
      }));
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const clearAvatar = () => {
    setForm((prev) => ({ ...prev, avatarUrl: "" }));
    setErrors((prev) => ({ ...prev, avatarUrl: undefined }));
  };

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
          <p>
            Manage your personal details, contact information, address, and
            security settings from one place.
          </p>
        </div>
      </section>

      <section className="profile-shell container">
        <aside className="profile-sidebar reveal">
          <div className="profile-identity-card">
            <div
              className="profile-identity-avatar"
              aria-hidden={Boolean(form.avatarUrl)}
            >
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Profile" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <h2>{form.fullName || "Adventurer"}</h2>
            <p>{form.email || "no-email@shikhar.local"}</p>
            <strong className="profile-role-chip">{accountType}</strong>
            <dl>
              <div>
                <dt>Phone</dt>
                <dd>{form.phone || "Not set"}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{form.location || form.city || "Not set"}</dd>
              </div>
            </dl>
          </div>

          <nav className="profile-nav" aria-label="Profile sections">
            {profileSections.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`profile-nav__item ${
                  activeSection === section.key ? "is-active" : ""
                }`}
                onClick={() => {
                  setActiveSection(section.key);
                  setErrors({});
                }}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="profile-main-column reveal">
          <div className="profile-form-card">
            <div className="profile-form-card__header">
              <h3>{selectedSection.title}</h3>
              <span>{selectedSection.description}</span>
            </div>

            {activeSection !== "security" && (
              <form onSubmit={handleProfileSave} noValidate>
                {activeSection === "personal" && (
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
                      Profile Photo URL (optional)
                      <div className="profile-avatar-input-row">
                        <input
                          type="url"
                          value={form.avatarUrl}
                          onChange={onChange("avatarUrl")}
                          placeholder="https://example.com/photo.jpg"
                        />
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="profile-avatar-file-input"
                          onChange={handleAvatarUpload}
                        />
                        <button
                          type="button"
                          className="btn profile-upload-btn"
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          Upload
                        </button>
                        {form.avatarUrl && (
                          <button
                            type="button"
                            className="btn profile-upload-btn profile-upload-btn--ghost"
                            onClick={clearAvatar}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {errors.avatarUrl && <small>{errors.avatarUrl}</small>}
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
                )}

                {activeSection === "contact" && (
                  <div className="profile-form-grid">
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
                  </div>
                )}

                {activeSection === "address" && (
                  <div className="profile-form-grid">
                    <label className="profile-form-grid__full">
                      Address Line
                      <input
                        type="text"
                        value={form.addressLine}
                        onChange={onChange("addressLine")}
                        placeholder="Street, house number"
                      />
                    </label>

                    <label>
                      City
                      <input
                        type="text"
                        value={form.city}
                        onChange={onChange("city")}
                        placeholder="Kathmandu"
                      />
                    </label>

                    <label>
                      State / Province
                      <input
                        type="text"
                        value={form.state}
                        onChange={onChange("state")}
                        placeholder="Bagmati"
                      />
                    </label>

                    <label>
                      Postal Code
                      <input
                        type="text"
                        value={form.postalCode}
                        onChange={onChange("postalCode")}
                        placeholder="44600"
                      />
                    </label>

                    <label>
                      Country
                      <input
                        type="text"
                        value={form.country}
                        onChange={onChange("country")}
                        placeholder="Nepal"
                      />
                    </label>

                    <label className="profile-form-grid__full">
                      Display Location
                      <input
                        type="text"
                        value={form.location}
                        onChange={onChange("location")}
                        placeholder="Kathmandu, Nepal"
                      />
                    </label>
                  </div>
                )}

                <div className="profile-form-actions">
                  {savedSection === activeSection && (
                    <p className="profile-saved">
                      {selectedSection.title} updated.
                    </p>
                  )}
                  <button type="submit" className="btn btn-primary">
                    Save {selectedSection.label}
                  </button>
                </div>
              </form>
            )}

            {activeSection === "security" && (
              <form
                className="profile-password-card"
                onSubmit={handlePasswordSave}
                noValidate
              >
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
                    <p className="profile-saved">
                      Password changed successfully.
                    </p>
                  )}
                  <button type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}