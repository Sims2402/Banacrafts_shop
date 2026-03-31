import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { fetchWithAuth } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Camera, Check, X, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

const ProfileEdit = () => {
  const { user, setUser } = useAuth();  // make sure setUser is exposed in AuthContext
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<string | null>(null); // base64 to send

  const [passwords, setPasswords] = useState({
    current: "", newPass: "", confirm: "",
  });
  const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });

  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [toast, setToast]       = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── avatar pick ── */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatar(result);
      setAvatarFile(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ── save profile ── */
  const saveProfile = async () => {
    if (!form.name.trim()) { showToast("Name cannot be empty.", "err"); return; }
    setSaving(true);
    try {
      const updated = await fetchWithAuth("/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, address: form.address, avatar: avatarFile }),
      });
      // update auth context so navbar reflects changes immediately
      if (setUser) setUser((prev: any) => ({ ...prev, name: updated.name, avatar: updated.avatar }));
      showToast("Profile updated successfully!");
    } catch { showToast("Failed to save profile.", "err"); }
    finally { setSaving(false); }
  };

  /* ── change password ── */
  const changePassword = async () => {
    if (!passwords.current || !passwords.newPass) { showToast("Fill in all password fields.", "err"); return; }
    if (passwords.newPass !== passwords.confirm) { showToast("New passwords don't match.", "err"); return; }
    if (passwords.newPass.length < 6) { showToast("Password must be at least 6 characters.", "err"); return; }
    setSavingPw(true);
    try {
      await fetchWithAuth("/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      setPasswords({ current: "", newPass: "", confirm: "" });
      showToast("Password changed successfully!");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Incorrect current password.", "err");
    }
    finally { setSavingPw(false); }
  };

  /* ── display name initial ── */
  const initials = (name: string) =>
    name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-10 max-w-3xl space-y-8">

        {/* ── back ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-[#722F37] text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* ── page title ── */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#3d1a11]">Edit Profile</h1>
          <p className="text-gray-400 text-sm mt-1 italic">Update your personal details and avatar</p>
        </div>

        {/* ── AVATAR SECTION ── */}
        <div className="bg-white rounded-3xl border border-[#E8DCCF] p-8 shadow-sm">
          <SectionLabel>Profile Picture</SectionLabel>
          <div className="flex items-center gap-7 mt-4">
            {/* avatar preview */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#E8DCCF] shadow-md">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#722F37] to-[#c9856b] flex items-center justify-center text-white text-2xl font-black">
                    {initials(form.name || user?.name || "U")}
                  </div>
                )}
              </div>
              {/* camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#722F37] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#5a252c] transition-colors"
              >
                <Camera size={14} />
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-[#3d1a11] mb-1">Upload a new photo</p>
              <p className="text-xs text-gray-400 mb-3">JPG, PNG or WEBP · Max 2MB</p>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold uppercase tracking-widest border border-[#722F37] text-[#722F37] rounded-xl px-4 py-2 hover:bg-[#722F37] hover:text-white transition-all"
                >
                  Choose Photo
                </button>
                {avatar && (
                  <button
                    onClick={() => { setAvatar(null); setAvatarFile(null); }}
                    className="text-[11px] font-bold uppercase tracking-widest border border-gray-200 text-gray-400 rounded-xl px-4 py-2 hover:bg-gray-50 transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        {/* ── PERSONAL INFO ── */}
        <div className="bg-white rounded-3xl border border-[#E8DCCF] p-8 shadow-sm space-y-5">
          <SectionLabel>Personal Information</SectionLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            <FormField label="Full Name" icon={<User size={14} />}>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full bg-[#FDF8F4] border border-[#E8DCCF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all"
              />
            </FormField>

            {/* email — read only */}
            <FormField label="Email Address" icon={<Mail size={14} />}>
              <input
                value={user?.email || ""}
                disabled
                className="w-full bg-gray-50 border border-[#E8DCCF] rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Email cannot be changed</p>
            </FormField>

            {/* role — read only */}
            <FormField label="Account Type" icon={<User size={14} />}>
              <input
                value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                disabled
                className="w-full bg-gray-50 border border-[#E8DCCF] rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed capitalize"
              />
              <p className="text-[10px] text-gray-400 mt-1 ml-1">Role cannot be changed</p>
            </FormField>

            <FormField label="Phone Number" icon={<Phone size={14} />}>
              <input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 99999 00000"
                className="w-full bg-[#FDF8F4] border border-[#E8DCCF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all"
              />
            </FormField>
          </div>

          <FormField label="Address" icon={<MapPin size={14} />}>
            <textarea
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Street, City, State, PIN"
              rows={3}
              className="w-full bg-[#FDF8F4] border border-[#E8DCCF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all resize-none"
            />
          </FormField>

          <div className="flex justify-end pt-2">
            <SaveButton loading={saving} onClick={saveProfile} label="Save Changes" />
          </div>
        </div>

        {/* ── CHANGE PASSWORD ── */}
        <div className="bg-white rounded-3xl border border-[#E8DCCF] p-8 shadow-sm space-y-5">
          <SectionLabel>Change Password</SectionLabel>

          <div className="space-y-4 mt-4">
            <PasswordField
              label="Current Password"
              value={passwords.current}
              show={showPw.current}
              onChange={v => setPasswords(p => ({ ...p, current: v }))}
              onToggle={() => setShowPw(p => ({ ...p, current: !p.current }))}
            />
            <PasswordField
              label="New Password"
              value={passwords.newPass}
              show={showPw.newPass}
              onChange={v => setPasswords(p => ({ ...p, newPass: v }))}
              onToggle={() => setShowPw(p => ({ ...p, newPass: !p.newPass }))}
            />
            <PasswordField
              label="Confirm New Password"
              value={passwords.confirm}
              show={showPw.confirm}
              onChange={v => setPasswords(p => ({ ...p, confirm: v }))}
              onToggle={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
            />

            {/* strength hint */}
            {passwords.newPass && (
              <div className="flex gap-1.5 items-center mt-1">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                    passwords.newPass.length >= i * 3 ? "bg-[#722F37]" : "bg-gray-200"
                  }`} />
                ))}
                <span className="text-[10px] text-gray-400 ml-2">
                  {passwords.newPass.length < 6 ? "Too short" : passwords.newPass.length < 10 ? "Fair" : "Strong"}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <SaveButton loading={savingPw} onClick={changePassword} label="Update Password" />
          </div>
        </div>

      </main>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold transition-all animate-in fade-in slide-in-from-bottom-4 ${
          toast.type === "ok"
            ? "bg-[#3d1a11] text-white"
            : "bg-red-600 text-white"
        }`}>
          {toast.type === "ok" ? <Check size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      <Footer />
    </div>
  );
};

/* ── helpers ── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">{children}</p>
    <div className="flex-1 h-px bg-[#E8DCCF]" />
  </div>
);

const FormField = ({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-500">
      <span className="text-gray-400">{icon}</span> {label}
    </label>
    {children}
  </div>
);

const PasswordField = ({ label, value, show, onChange, onToggle }: {
  label: string; value: string; show: boolean;
  onChange: (v: string) => void; onToggle: () => void;
}) => (
  <FormField label={label} icon={<Lock size={14} />}>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="••••••••"
        className="w-full bg-[#FDF8F4] border border-[#E8DCCF] rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10 transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  </FormField>
);

const SaveButton = ({ loading, onClick, label }: { loading: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="inline-flex items-center gap-2 bg-[#722F37] hover:bg-[#5a252c] text-white rounded-xl px-7 py-3 text-[12px] font-bold uppercase tracking-widest shadow-md transition-all disabled:opacity-50"
  >
    {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
    {loading ? "Saving…" : label}
  </button>
);

export default ProfileEdit;