"use client";
import { useEffect, useRef, useState } from "react";
import { useBooks } from "@/lib/context/BooksContext";

function inputCls(hasError?: boolean) {
  return (
    `w-full bg-bs-bg border ${hasError ? "border-red-400" : "border-bs-border"} ` +
    "rounded-[9px] py-[10px] px-[13px] text-[13px] text-bs-text outline-none " +
    "transition-colors placeholder:text-bs-faint " +
    "focus:border-bs-accent focus:shadow-[0_0_0_3px_rgba(193,68,14,0.12)]"
  );
}
const labelCls = "block text-[12px] font-medium text-bs-muted mb-[6px]";

interface FieldErrors {
  first_name?: string;
  email?: string;
  username?: string;
  avatar?: string;
}

export default function ProfileModal() {
  const { profileOpen, setProfileOpen, showToast, updateProfileCache } = useBooks();

  const [first,     setFirst]     = useState("");
  const [last,      setLast]      = useState("");
  const [email,     setEmail]     = useState("");
  const [username,  setUsername]  = useState("");
  const [bio,       setBio]       = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [saving,    setSaving]    = useState(false);
  const [errors,    setErrors]    = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setFirst(d.first_name ?? "");
        setLast(d.last_name   ?? "");
        setEmail(d.email      ?? "");
        setUsername(d.username ?? "");
        setBio(d.bio          ?? "");
        setAvatarUrl(d.avatar_url ?? "");
      })
      .catch(() => {});
  }, [profileOpen]);

  if (!profileOpen) return null;

  const initials = ((first[0] ?? "") + (last[0] ?? "")).toUpperCase() || "?";

  function close() {
    setSaveError("");
    setErrors({});
    setProfileOpen(false);
  }

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (!first.trim()) {
      errs.first_name = "First name is required.";
    }
    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid email address.";
    }
    if (username.trim() && !/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      errs.username = "3–20 characters: letters, numbers, and underscores only.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: "Only JPG and PNG files are allowed." }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "File must be under 2MB." }));
      return;
    }
    setErrors((prev) => ({ ...prev, avatar: undefined }));

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setErrors((prev) => ({ ...prev, avatar: json.error ?? "Upload failed." }));
      } else {
        setAvatarUrl(json.avatar_url);
        updateProfileCache({ avatarUrl: json.avatar_url });
      }
    } catch {
      setErrors((prev) => ({ ...prev, avatar: "Upload failed." }));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: first.trim(),
          last_name:  last.trim()     || null,
          email:      email.trim(),
          username:   username.trim() || null,
          bio:        bio.trim()      || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error ?? "Failed to save profile.";
        setSaveError(msg);
        console.error("[ProfileModal] save error:", msg);
        return;
      }
      updateProfileCache({ firstName: first.trim(), lastName: last.trim() });
      showToast("Profile updated");
      close();
    } catch (err) {
      const msg = "Unexpected error. Please try again.";
      setSaveError(msg);
      console.error("[ProfileModal] save error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-[1.5rem]"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-bs-panel rounded-[16px] w-full max-w-[540px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] max-h-[calc(100vh-3rem)] overflow-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-[1.75rem] py-[1.5rem] border-b border-bs-border flex-shrink-0">
          <div className="font-fraunces text-[20px] font-semibold">Edit Profile</div>
          <button
            onClick={close}
            className="text-bs-muted hover:text-bs-text hover:bg-bs-tag rounded-lg p-1 transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-[1.75rem] py-[1.5rem] overflow-y-auto flex-1">

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-[22px] pb-[22px] border-b border-bs-border">
            <div className="w-16 h-16 bg-bs-accent rounded-full flex items-center justify-center text-white font-fraunces text-[22px] font-semibold flex-shrink-0 overflow-hidden">
              {avatarUrl
                ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="flex flex-col gap-[6px]">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={saving}
                className="text-[12px] text-bs-accent border border-bs-border rounded-md px-3 py-[5px] cursor-pointer hover:bg-bs-accent/[0.08] transition-colors text-left disabled:opacity-50"
              >
                Change Photo
              </button>
              <div className="text-[11px] text-bs-faint">JPG or PNG · max 2MB</div>
              {errors.avatar && (
                <div className="text-[11px] text-red-400">{errors.avatar}</div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelCls}>
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                className={inputCls(!!errors.first_name)}
                value={first}
                onChange={(e) => setFirst(e.target.value)}
              />
              {errors.first_name && (
                <div className="text-[11px] text-red-400 mt-1">{errors.first_name}</div>
              )}
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input
                className={inputCls()}
                value={last}
                onChange={(e) => setLast(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={labelCls}>
              Email <span className="text-red-400">*</span>
            </label>
            <input
              className={inputCls(!!errors.email)}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <div className="text-[11px] text-red-400 mt-1">{errors.email}</div>
            )}
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className={labelCls}>Username</label>
            <input
              className={inputCls(!!errors.username)}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3–20 chars, letters / numbers / _"
            />
            {errors.username && (
              <div className="text-[11px] text-red-400 mt-1">{errors.username}</div>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className={labelCls}>Bio</label>
            <input
              className={inputCls()}
              placeholder="A short bio about yourself…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Save-level error */}
          {saveError && (
            <div className="mt-4 text-[12px] text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              {saveError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-[10px] px-[1.75rem] py-[1.5rem] border-t border-bs-border flex-shrink-0">
          <button
            onClick={close}
            disabled={saving}
            className="bg-transparent border border-bs-border rounded-[9px] px-[18px] py-[9px] text-[13px] text-bs-muted hover:bg-bs-tag transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-bs-accent text-white rounded-[9px] px-[18px] py-[9px] text-[13px] font-medium hover:bg-bs-accent-hover transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}
