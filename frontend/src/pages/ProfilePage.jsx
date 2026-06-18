// import React, { useState, useRef, useEffect } from "react";
// import { motion } from "motion/react";
// import {
//   Camera,
//   ArrowLeft,
//   Globe,
//   Phone,
//   Mail,
//   User,
//   FileText,
//   Save,
//   Loader2,
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { setUserData } from "../redux/userSlice";
// import { serverUrl } from "../App";

// const InputRow = ({ label, icon: Icon, required, children }) => (
//   <div>
//     <label className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] mb-1.5">
//       {Icon && <Icon size={12} />}
//       {label}
//       {required && <span className="text-red-400">*</span>}
//     </label>
//     {children}
//   </div>
// );

// const Field = ({ value, onChange, placeholder, type = "text", disabled }) => (
//   <input
//     type={type}
//     value={value}
//     onChange={onChange}
//     placeholder={placeholder}
//     disabled={disabled}
//     className="w-full px-3 py-2.5 rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none disabled:opacity-50 bg-[var(--bg-base)] border border-[var(--border)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:border-[var(--accent)]"
//   />
// );

// const ProfilePage = () => {
//   const { userData } = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const fileRef = useRef(null);

//   const [form, setForm] = useState({
//     name: userData?.name || "",
//     username: userData?.username || "",
//     email: userData?.email || "",
//     phone: userData?.phone || "",
//     country: userData?.country || "",
//     bio: userData?.bio || "",
//     twitter: userData?.socials?.twitter || "",
//     github: userData?.socials?.github || "",
//     linkedin: userData?.socials?.linkedin || "",
//   });
//   const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || null);
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // FIX: Sync avatar preview if userData updates (e.g. after login re-fetch)
//   useEffect(() => {
//     if (userData?.avatar && !avatarFile) {
//       setAvatarPreview(userData.avatar);
//     }
//   }, [userData?.avatar]);

//   // FIX: Revoke blob URL on unmount to prevent memory leak
//   useEffect(() => {
//     return () => {
//       if (avatarPreview?.startsWith("blob:")) {
//         URL.revokeObjectURL(avatarPreview);
//       }
//     };
//   }, [avatarPreview]);

//   const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

//   const handleAvatarChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image must be under 5MB");
//       return;
//     }
//     // FIX: Revoke previous blob URL before creating a new one
//     if (avatarPreview?.startsWith("blob:")) {
//       URL.revokeObjectURL(avatarPreview);
//     }
//     setAvatarFile(file);
//     setAvatarPreview(URL.createObjectURL(file));
//   };

//   const handleSave = async () => {
//     if (!form.name.trim()) {
//       toast.error("Name is required");
//       return;
//     }
//     setSaving(true);
//     try {
//       let avatarUrl = userData?.avatar;

//       if (avatarFile) {
//         const fd = new FormData();
//         fd.append("avatar", avatarFile);
//         const { data } = await axios.post(`${serverUrl}/api/user/avatar`, fd, {
//           withCredentials: true,
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         avatarUrl = data.avatar;
//         // FIX: Dispatch updated user from avatar response immediately
//         dispatch(setUserData(data.user));
//       }

//       const { data } = await axios.put(
//         `${serverUrl}/api/user/profile`,
//         { ...form, avatar: avatarUrl },
//         { withCredentials: true },
//       );
//       dispatch(setUserData(data.user));
//       toast.success("Profile updated!");
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const initials = form.name
//     ? form.name
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .toUpperCase()
//         .slice(0, 2)
//     : "U";

//   return (
//     <div className="min-h-screen bg-[var(--bg-base)]">
//       {/* Header */}
//       <header className="sticky top-0 z-40 h-14 flex items-center px-5 sm:px-8 bg-[var(--bg-elevated)] border-b border-[var(--border)] backdrop-blur-[20px]">
//         <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
//           <button
//             onClick={() => navigate(-1)}
//             className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//           >
//             <ArrowLeft size={16} />
//           </button>
//           <h1 className="text-[15px] font-semibold">My Profile</h1>
//         </div>
//       </header>

//       <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           {/* Avatar Section */}
//           <div className="flex items-center gap-5 mb-8">
//             <div className="relative">
//               <div
//                 className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold text-white ${
//                   avatarPreview
//                     ? "bg-transparent"
//                     : "bg-[linear-gradient(135deg,var(--accent),#3b82f6)]"
//                 }`}
//               >
//                 {avatarPreview ? (
//                   <img
//                     src={avatarPreview}
//                     alt="avatar"
//                     className="w-full h-full object-cover"
//                     // FIX: Fallback to initials if image fails to load
//                     onError={(e) => {
//                       e.target.style.display = "none";
//                       setAvatarPreview(null);
//                     }}
//                   />
//                 ) : (
//                   initials
//                 )}
//               </div>
//               <button
//                 onClick={() => fileRef.current?.click()}
//                 className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 bg-[var(--accent)]"
//                 aria-label="Change avatar"
//               >
//                 <Camera size={13} />
//               </button>
//               <input
//                 ref={fileRef}
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleAvatarChange}
//               />
//             </div>
//             <div>
//               <p className="text-[15px] font-semibold text-[var(--text-primary)]">
//                 {form.name || "Your Name"}
//               </p>
//               <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
//                 {form.email}
//               </p>
//               <button
//                 onClick={() => fileRef.current?.click()}
//                 className="mt-2 text-[11px] font-medium text-[var(--accent)] hover:underline"
//               >
//                 Change photo
//               </button>
//             </div>
//           </div>

//           {/* Form Card */}
//           <div className="rounded-2xl p-6 bg-[var(--bg-elevated)] border border-[var(--border)]">
//             <h2 className="text-[14px] font-semibold mb-5 text-[var(--text-primary)]">
//               Personal Information
//             </h2>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <InputRow label="Full Name" icon={User} required>
//                 <Field
//                   value={form.name}
//                   onChange={set("name")}
//                   placeholder="John Doe"
//                 />
//               </InputRow>

//               <InputRow label="Username" icon={User}>
//                 <Field
//                   value={form.username}
//                   onChange={set("username")}
//                   placeholder="johndoe"
//                 />
//               </InputRow>

//               <InputRow label="Email" icon={Mail} required>
//                 <Field
//                   value={form.email}
//                   onChange={set("email")}
//                   placeholder="john@email.com"
//                   type="email"
//                   disabled
//                 />
//               </InputRow>

//               <InputRow label="Phone" icon={Phone}>
//                 <Field
//                   value={form.phone}
//                   onChange={set("phone")}
//                   placeholder="+1 234 567 8900"
//                   type="tel"
//                 />
//               </InputRow>

//               <InputRow label="Country" icon={Globe}>
//                 <Field
//                   value={form.country}
//                   onChange={set("country")}
//                   placeholder="India"
//                 />
//               </InputRow>
//             </div>

//             <div className="mt-4">
//               <InputRow label="Bio" icon={FileText}>
//                 <textarea
//                   value={form.bio}
//                   onChange={set("bio")}
//                   placeholder="Tell us a little about yourself..."
//                   rows={3}
//                   className="w-full px-3 py-2.5 rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none transition-all duration-200 focus:outline-none bg-[var(--bg-base)] border border-[var(--border)] focus:border-[var(--accent)]"
//                 />
//               </InputRow>
//             </div>
//           </div>

//           {/* FIX: Save button restored (was commented out) */}
//           <div className="mt-5 flex justify-end">
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={handleSave}
//               disabled={saving}
//               className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold disabled:opacity-60 transition-all bg-gradient-to-br from-[var(--accent)] to-[#3b82f6]"
//             >
//               {saving ? (
//                 <Loader2 size={14} className="animate-spin" />
//               ) : (
//                 <Save size={14} />
//               )}
//               {saving ? "Saving…" : "Save Changes"}
//             </motion.button>
//           </div>
//         </motion.div>
//       </main>
//     </div>
//   );
// };

// export default ProfilePage;

import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import {
  Camera,
  ArrowLeft,
  Globe,
  Phone,
  Mail,
  User,
  FileText,
  Save,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { setUserData } from "../redux/userSlice";
import { serverUrl } from "../App";

const InputRow = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] mb-1.5">
      {Icon && <Icon size={12} />}
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const Field = ({ value, onChange, placeholder, type = "text", disabled }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    className="w-full px-3 py-2.5 rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none disabled:opacity-50 bg-[var(--bg-base)] border border-[var(--border)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:border-[var(--accent)]"
  />
);

const ProfilePage = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: userData?.name || "",
    username: userData?.username || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    country: userData?.country || "",
    bio: userData?.bio || "",
    twitter: userData?.socials?.twitter || "",
    github: userData?.socials?.github || "",
    linkedin: userData?.socials?.linkedin || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData?.avatar && !avatarFile) {
      setAvatarPreview(userData.avatar);
    }
  }, [userData?.avatar]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = userData?.avatar;

      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        const { data } = await axios.post(`${serverUrl}/api/user/avatar`, fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        avatarUrl = data.avatar;
        dispatch(setUserData(data.user));
      }

      const { data } = await axios.put(
        `${serverUrl}/api/user/profile`,
        { ...form, avatar: avatarUrl },
        { withCredentials: true },
      );
      dispatch(setUserData(data.user));
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 flex items-center px-5 sm:px-8 bg-[var(--bg-elevated)] border-b border-[var(--border)] backdrop-blur-[20px]">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-[15px] font-semibold">My Profile</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Avatar Section */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative">
              <div
                className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold text-white ${
                  avatarPreview
                    ? "bg-transparent"
                    : "bg-[linear-gradient(135deg,var(--accent),#3b82f6)]"
                }`}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      setAvatarPreview(null);
                    }}
                  />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110 bg-[var(--accent)]"
                aria-label="Change avatar"
              >
                <Camera size={13} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                {form.name || "Your Name"}
              </p>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                {form.email}
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-[11px] font-medium text-[var(--accent)] hover:underline"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl p-6 bg-[var(--bg-elevated)] border border-[var(--border)]">
            <h2 className="text-[14px] font-semibold mb-5 text-[var(--text-primary)]">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputRow label="Full Name" icon={User} required>
                <Field
                  value={form.name}
                  onChange={set("name")}
                  placeholder="John Doe"
                />
              </InputRow>

              <InputRow label="Username" icon={User}>
                <Field
                  value={form.username}
                  onChange={set("username")}
                  placeholder="johndoe"
                />
              </InputRow>

              <InputRow label="Email" icon={Mail} required>
                <Field
                  value={form.email}
                  onChange={set("email")}
                  placeholder="john@email.com"
                  type="email"
                  disabled
                />
              </InputRow>

              <InputRow label="Phone" icon={Phone}>
                <Field
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+1 234 567 8900"
                  type="tel"
                />
              </InputRow>

              <InputRow label="Country" icon={Globe}>
                <Field
                  value={form.country}
                  onChange={set("country")}
                  placeholder="India"
                />
              </InputRow>
            </div>

            <div className="mt-4">
              <InputRow label="Bio" icon={FileText}>
                <textarea
                  value={form.bio}
                  onChange={set("bio")}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none transition-all duration-200 focus:outline-none bg-[var(--bg-base)] border border-[var(--border)] focus:border-[var(--accent)]"
                />
              </InputRow>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-5 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold disabled:opacity-60 transition-all bg-gradient-to-br from-[var(--accent)] to-[#3b82f6]"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfilePage;

// import React, { useState, useRef } from "react";
// import { motion } from "motion/react";
// import {
//   Camera,
//   ArrowLeft,
//   Globe,
//   Phone,
//   Mail,
//   User,
//   FileText,
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { setUserData } from "../redux/userSlice";
// import { serverUrl } from "../App";

// const InputRow = ({ label, icon: Icon, required, children }) => (
//   <div>
//     <label className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-muted)] mb-1.5">
//       {Icon && <Icon size={12} />}
//       {label}
//       {required && <span className="text-red-400">*</span>}
//     </label>
//     {children}
//   </div>
// );

// const Field = ({ value, onChange, placeholder, type = "text", disabled }) => (
//   <input
//     type={type}
//     value={value}
//     onChange={onChange}
//     placeholder={placeholder}
//     disabled={disabled}
//     className="w-full px-3 py-2.5 rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none disabled:opacity-50"
//     style={{
//       background: "var(--bg-base)",
//       border: "1px solid var(--border)",
//       boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)",
//     }}
//     onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
//     onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
//   />
// );

// const ProfilePage = () => {
//   const { userData } = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const fileRef = useRef(null);

//   const [form, setForm] = useState({
//     name: userData?.name || "",
//     username: userData?.username || "",
//     email: userData?.email || "",
//     phone: userData?.phone || "",
//     country: userData?.country || "",
//     bio: userData?.bio || "",
//     twitter: userData?.socials?.twitter || "",
//     github: userData?.socials?.github || "",
//     linkedin: userData?.socials?.linkedin || "",
//   });
//   const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || null);
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [saving, setSaving] = useState(false);

//   const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

//   const handleAvatarChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image must be under 5MB");
//       return;
//     }
//     setAvatarFile(file);
//     setAvatarPreview(URL.createObjectURL(file));
//   };

//   const handleSave = async () => {
//     if (!form.name.trim()) {
//       toast.error("Name is required");
//       return;
//     }
//     setSaving(true);
//     try {
//       // Upload avatar first if changed
//       let avatarUrl = userData?.avatar;
//       if (avatarFile) {
//         const fd = new FormData();
//         fd.append("avatar", avatarFile);
//         const { data } = await axios.post(`${serverUrl}/api/user/avatar`, fd, {
//           withCredentials: true,
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//         avatarUrl = data.avatar;
//       }

//       const { data } = await axios.put(
//         `${serverUrl}/api/user/profile`,
//         { ...form, avatar: avatarUrl },
//         { withCredentials: true },
//       );
//       dispatch(setUserData(data.user));
//       toast.success("Profile updated!");
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to save profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const initials = form.name
//     ? form.name
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .toUpperCase()
//         .slice(0, 2)
//     : "U";

//   return (
//     <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
//       {/* Header */}
//       <header
//         className="sticky top-0 z-40 h-14 flex items-center px-5 sm:px-8"
//         style={{
//           background: "var(--bg-elevated)",
//           borderBottom: "1px solid var(--border)",
//           backdropFilter: "blur(20px)",
//         }}
//       >
//         <div className="max-w-3xl mx-auto w-full flex items-center gap-3">
//           <button
//             onClick={() => navigate(-1)}
//             className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
//           >
//             <ArrowLeft size={16} />
//           </button>
//           <h1 className="text-[15px] font-semibold">My Profile</h1>
//         </div>
//       </header>

//       <main className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
//         <motion.div
//           initial={{ opacity: 0, y: 16 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           {/* Avatar Section */}
//           <div className="flex items-center gap-5 mb-8">
//             <div className="relative">
//               <div
//                 className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-xl font-bold text-white"
//                 style={{
//                   background: avatarPreview
//                     ? "transparent"
//                     : "linear-gradient(135deg, var(--accent), #3b82f6)",
//                 }}
//               >
//                 {avatarPreview ? (
//                   <img
//                     src={avatarPreview}
//                     alt="avatar"
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   initials
//                 )}
//               </div>
//               <button
//                 onClick={() => fileRef.current?.click()}
//                 className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110"
//                 style={{ background: "var(--accent)" }}
//                 aria-label="Change avatar"
//               >
//                 <Camera size={13} />
//               </button>
//               <input
//                 ref={fileRef}
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleAvatarChange}
//               />
//             </div>
//             <div>
//               <p className="text-[15px] font-semibold text-[var(--text-primary)]">
//                 {form.name || "Your Name"}
//               </p>
//               <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
//                 {form.email}
//               </p>
//               <button
//                 onClick={() => fileRef.current?.click()}
//                 className="mt-2 text-[11px] font-medium text-[var(--accent)] hover:underline"
//               >
//                 Change photo
//               </button>
//             </div>
//           </div>

//           {/* Form Card */}
//           <div
//             className="rounded-2xl p-6"
//             style={{
//               background: "var(--bg-elevated)",
//               border: "1px solid var(--border)",
//             }}
//           >
//             <h2 className="text-[14px] font-semibold mb-5 text-[var(--text-primary)]">
//               Personal Information
//             </h2>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <InputRow label="Full Name" icon={User} required>
//                 <Field
//                   value={form.name}
//                   onChange={set("name")}
//                   placeholder="John Doe"
//                 />
//               </InputRow>

//               <InputRow label="Username" icon={User}>
//                 <Field
//                   value={form.username}
//                   onChange={set("username")}
//                   placeholder="johndoe"
//                 />
//               </InputRow>

//               <InputRow label="Email" icon={Mail} required>
//                 <Field
//                   value={form.email}
//                   onChange={set("email")}
//                   placeholder="john@email.com"
//                   type="email"
//                   disabled
//                 />
//               </InputRow>

//               <InputRow label="Phone" icon={Phone}>
//                 <Field
//                   value={form.phone}
//                   onChange={set("phone")}
//                   placeholder="+1 234 567 8900"
//                   type="tel"
//                 />
//               </InputRow>

//               <InputRow label="Country" icon={Globe}>
//                 <Field
//                   value={form.country}
//                   onChange={set("country")}
//                   placeholder="India"
//                 />
//               </InputRow>
//             </div>

//             <div className="mt-4">
//               <InputRow label="Bio" icon={FileText}>
//                 <textarea
//                   value={form.bio}
//                   onChange={set("bio")}
//                   placeholder="Tell us a little about yourself..."
//                   rows={3}
//                   className="w-full px-3 py-2.5 rounded-xl text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none transition-all duration-200 focus:outline-none"
//                   style={{
//                     background: "var(--bg-base)",
//                     border: "1px solid var(--border)",
//                   }}
//                   onFocus={(e) =>
//                     (e.target.style.borderColor = "var(--accent)")
//                   }
//                   onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
//                 />
//               </InputRow>
//             </div>
//           </div>

//           {/* Save Button */}
//           {/* <div className="mt-5 flex justify-end">
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={handleSave}
//               disabled={saving}
//               className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold disabled:opacity-60 transition-all"
//               style={{
//                 background: "linear-gradient(135deg, var(--accent), #3b82f6)",
//               }}
//             >
//               {saving ? (
//                 <Loader2 size={14} className="animate-spin" />
//               ) : (
//                 <Save size={14} />
//               )}
//               {saving ? "Saving…" : "Save Changes"}
//             </motion.button>
//           </div> */}
//         </motion.div>
//       </main>
//     </div>
//   );
// };
