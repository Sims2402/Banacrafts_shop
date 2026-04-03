import { useState } from "react";
import { useAuth, normalizeUserFromPayload } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("banacrafts_user") || "{}");
    } catch {
      return {};
    }
  };
  const getUserId = (u: any) => String(u?.id || u?._id || "");
  const persistNormalizedUser = (apiUser: Record<string, unknown>) => {
    const current = getStoredUser();
    const merged = { ...current, ...apiUser };
    const normalized = normalizeUserFromPayload(merged);
    if (normalized) {
      updateUser(normalized);
    }
  };
  const [phoneError, setPhoneError] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setPhoneError("Phone number must contain exactly 10 digits.");
      return;
    }
    try {
  const userData = getStoredUser();
  const userId = getUserId(userData);
  if (!userId) {
    alert("User not found. Please login again.");
    return;
  }

  const res = await fetch(
    `http://localhost:5000/seller/profile/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        name,
        phone,
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
  alert(data.message || "Update failed");
  return;
}
  // ✅ keep storage/context shape consistent
  persistNormalizedUser(data);

  alert("Profile updated successfully");

} catch (err) {
  console.error(err);
  alert("Something went wrong");
  }
};
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const userData = getStoredUser();
  const userId = getUserId(userData);
  if (!userId) {
    alert("User not found. Please login again.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file); // ✅ MUST MATCH BACKEND

  try {
    const res = await fetch(
      `http://localhost:5000/seller/profile/upload/${userId}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Upload failed");
      return;
    }

    // ✅ show uploaded image (REAL URL from cloudinary)
    setAvatarPreview(data.profilePicture || "");
    persistNormalizedUser(data);

  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
};

  const handlePasswordUpdate = async () => {
  if (newPassword.length < 6) {
    setPasswordError("Password must be at least 6 characters long.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError("Passwords do not match.");
    return;
  }

  try {
    const userData = getStoredUser();
    const userId = getUserId(userData);
    if (!userId) {
      setPasswordError("User not found. Please login again.");
      return;
    }

    const res = await fetch(
      `http://localhost:5000/seller/profile/password/${userId}`,
      {
        method: "PATCH", // ✅ IMPORTANT (matches your backend)
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setPasswordError(data.message);
      return;
    }

    alert("Password updated successfully");

    // clear fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

  } catch (err) {
    console.error(err);
    setPasswordError("Something went wrong");
  }
};
  return (
    <div className="container mx-auto py-10 max-w-2xl">

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      {/* PROFILE CARD */}
      <div className="bg-white border rounded-lg p-6 space-y-6">

      {/* PROFILE PHOTO */}
      <div className="flex items-center gap-4">

      <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        {avatarPreview || user?.avatar ? (
  <img
    src={avatarPreview || user?.avatar}
    alt="Avatar"
    className="h-full w-full object-cover"
  />
) : (
  <span className="text-xl font-bold">
    {user?.name?.charAt(0)}
  </span>
)}
      </div>

      <div>
        <p className="text-sm font-medium">Profile Picture</p>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="text-sm mt-1"
        />
      </div>
      </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              disabled
              className="w-full border rounded-md p-2 bg-gray-100"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                // allow only digits
                if (/^\d*$/.test(value) && value.length <= 10) {
                    setPhone(value);
                    setPhoneError("");
                }
              }}
              placeholder="Enter 10 digit phone number"
              className="w-full border rounded-md p-2"
            />
            {phoneError && (
            <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>

          {/* SAVE BUTTON */}
          <Button type="submit" className="mt-4">
            Save Changes
          </Button>

        </form>
      </div>

      {/* PASSWORD SECTION */}
      <div className="bg-white border rounded-lg p-6 mt-8 space-y-4">

        <h2 className="text-lg font-semibold">
          Change Password
        </h2>

        <div>
          <label className="block text-sm mb-1">
            Current Password
          </label>
          <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border rounded-md p-2 pr-10"
          />

          <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-2.5 text-gray-500"
          >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">
            New Password
          </label>
          <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError("");
            }}
            className="w-full border rounded-md p-2 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-2.5 text-gray-500"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Confirm Password
          </label>
          <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordError("");
            }}
            className="w-full border rounded-md p-2 pr-10"
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-2.5 text-gray-500"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        </div>
        {passwordError && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}
        <Button variant="outline" onClick={handlePasswordUpdate}>
  Update Password
</Button>

      </div>
    </div>
  );
};

export default EditProfile;