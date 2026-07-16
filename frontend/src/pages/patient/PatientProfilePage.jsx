import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function PatientProfile() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: ""
  });

  const [profileImage, setProfileImage] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    api
      .get("accounts/me/")
      .then((res) => {
        setPatient(res.data);

        setFormData({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          phone_number: res.data.phone_number || ""
        });

        if (res.data.profile_image) {
          setProfileImage(
            res.data.profile_image.startsWith("http")
              ? res.data.profile_image
              : `http://127.0.0.1:8000${res.data.profile_image}`
          );
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("خطا در دریافت پروفایل:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImage = (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    setProfileImage(e.target.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    data.append("phone_number", formData.phone_number);

    if (profileImage instanceof File) {
      data.append("profile_image", profileImage);
    }

    try {
      await api.put("accounts/me/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("✅ اطلاعات با موفقیت ذخیره شد");
    } catch (err) {
      console.error(err);
      alert("خطا در ذخیره اطلاعات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>در حال بارگذاری...</div>;
  }

  return (
    <div style={styles.pageBackground}>
      <nav
        style={{
          ...styles.navbar,
          padding: isSmallMobile ? "8px 10px" : isMobile ? "10px 16px" : "15px 60px"
        }}
      >
        {/* DESKTOP */}
        {!isMobile && (
          <>
            <div style={styles.logo}>
              <span style={{ fontSize: "26px", marginLeft: "10px" }}>⛑️</span>
              کلینیک نوبت‌دهی آنلاین
            </div>

            <div style={styles.navLinks}>
              <span style={styles.link} onClick={() => navigate("/patient-dashboard")}>
                داشبورد
              </span>

              <span style={styles.link} onClick={() => navigate("/doctors-list")}>
                پزشکان
              </span>

              <span style={styles.link} onClick={() => navigate("/patient-appointments")}>
                نوبت‌های من
              </span>

              <span style={styles.activeLink}>پروفایل</span>

              <button style={styles.logoutBtn} onClick={handleLogout}>
                خروج
              </button>
            </div>
          </>
        )}

        {/* MOBILE / TABLET */}
        {isMobile && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={styles.navTopRow}>
              <div
                style={{
                  ...styles.logo,
                  fontSize: isSmallMobile ? "14px" : "16px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0
                }}
                title="کلینیک نوبت‌دهی آنلاین"
              >
                <span style={{ fontSize: isSmallMobile ? "18px" : "22px", marginLeft: "8px" }}>
                  ⛑️
                </span>
                کلینیک نوبت‌دهی آنلاین
              </div>

              <button
                style={{
                  ...styles.logoutBtn,
                  padding: isSmallMobile ? "6px 10px" : "8px 14px",
                  fontSize: isSmallMobile ? "12px" : "13px",
                  borderRadius: isSmallMobile ? "8px" : "12px"
                }}
                onClick={handleLogout}
              >
                خروج
              </button>
            </div>

            <div
              style={{
                ...styles.navLinksRow,
                gap: isSmallMobile ? "8px" : "12px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(0,0,0,0.06)"
              }}
            >
              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/patient-dashboard")}
              >
                داشبورد
              </span>

              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/doctors-list")}
              >
                پزشکان
              </span>

              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/patient-appointments")}
              >
                نوبت‌های من
              </span>

              <span
                style={{
                  ...styles.activeLink,
                  fontSize: isSmallMobile ? "12px" : "13px",
                  paddingBottom: isSmallMobile ? "2px" : "4px",
                  borderBottomWidth: isSmallMobile ? "2px" : "3px"
                }}
              >
                پروفایل
              </span>
            </div>
          </div>
        )}
      </nav>

      <div
        style={{
          ...styles.container,
          margin: isMobile ? "25px auto" : "40px auto",
          padding: isMobile ? "0 14px" : "0 20px"
        }}
      >
        <div
          style={{
            ...styles.card,
            padding: isSmallMobile ? "18px 14px" : isMobile ? "24px 18px" : "40px"
          }}
        >
          <h2
            style={{
              ...styles.title,
              fontSize: isSmallMobile ? "18px" : isMobile ? "20px" : "22px",
              marginBottom: isMobile ? "18px" : "30px"
            }}
          >
            پروفایل بیمار
          </h2>

          <form onSubmit={handleSave} style={{ ...styles.form, gap: isMobile ? "12px" : "15px" }}>
            <div style={{ ...styles.avatarWrapper, marginBottom: isMobile ? "12px" : "20px" }}>
              {profileImage && !(profileImage instanceof File) && (
                <img src={profileImage} style={styles.avatarImg} alt="profile" />
              )}

              {profileImage instanceof File && (
                <img src={URL.createObjectURL(profileImage)} style={styles.avatarImg} alt="profile" />
              )}

              <input
                type="file"
                onChange={handleImage}
                style={{
                  ...styles.fileInput,
                  fontSize: isSmallMobile ? "12px" : "13px",
                  width: "100%"
                }}
              />
            </div>

            <label style={{ ...styles.label, fontSize: isMobile ? "13px" : "14px" }}>نام</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              style={{
                ...styles.input,
                padding: isMobile ? "9px 10px" : "10px 12px",
                fontSize: isMobile ? "13px" : "14px"
              }}
            />

            <label style={{ ...styles.label, fontSize: isMobile ? "13px" : "14px" }}>
              نام خانوادگی
            </label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              style={{
                ...styles.input,
                padding: isMobile ? "9px 10px" : "10px 12px",
                fontSize: isMobile ? "13px" : "14px"
              }}
            />

            <label style={{ ...styles.label, fontSize: isMobile ? "13px" : "14px" }}>
              شماره تلفن
            </label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              style={{
                ...styles.input,
                padding: isMobile ? "9px 10px" : "10px 12px",
                fontSize: isMobile ? "13px" : "14px"
              }}
            />

            <label style={{ ...styles.label, fontSize: isMobile ? "13px" : "14px" }}>کد ملی</label>
            <input value={patient?.national_id || ""} disabled style={styles.inputDisabled} />

            <label style={{ ...styles.label, fontSize: isMobile ? "13px" : "14px" }}>
              شماره پرونده
            </label>
            <input value={patient?.id || ""} disabled style={styles.inputDisabled} />

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.saveBtn,
                padding: isMobile ? "10px" : "12px",
                fontSize: isMobile ? "13px" : "14px",
                marginTop: isMobile ? "10px" : "20px"
              }}
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    minHeight: "100vh",
    background: "radial-gradient(circle,#f0f9ff,#cbebff)",
    direction: "rtl",
    fontFamily: "Tahoma, Arial"
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.85)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 1000
  },

  logo: {
    fontWeight: "bold",
    fontSize: "22px",
    color: "#007080",
    display: "flex",
    alignItems: "center",
    minWidth: 0
  },

  navLinks: {
    display: "flex",
    gap: "20px",
    alignItems: "center"
  },

  navTopRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px"
  },

  navLinksRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap"
  },

  link: {
    cursor: "pointer",
    color: "#555",
    transition: "0.3s",
    whiteSpace: "nowrap"
  },

  activeLink: {
    color: "#00897b",
    fontWeight: "bold",
    borderBottom: "3px solid #00897b",
    paddingBottom: "5px",
    whiteSpace: "nowrap"
  },

  logoutBtn: {
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0
  },

  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "0 20px"
  },

  card: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    border: "1px solid rgba(255,255,255,0.8)"
  },

  title: {
    textAlign: "center",
    color: "#007080",
    marginBottom: "30px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  label: {
    color: "#333",
    fontWeight: "bold"
  },

  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    outline: "none"
  },

  inputDisabled: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    background: "#f5f5f5",
    color: "#666"
  },

  avatarWrapper: {
    textAlign: "center"
  },

  avatarImg: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "10px",
    border: "2px solid #b2dfdb"
  },

  fileInput: {
    padding: "8px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer"
  },

  saveBtn: {
    marginTop: "20px",
    padding: "12px",
    background: "#00897b",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default PatientProfile;
