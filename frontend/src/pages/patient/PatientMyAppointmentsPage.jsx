import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const defaultDoctorIcon = "🧑‍⚕️";

function PatientMyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const formatToPersianDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("appointments/appointments/");
      const data = res.data?.results ? res.data.results : res.data;
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("خطا در دریافت نوبت‌ها:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelByPatient = async (id) => {
    if (!window.confirm("آیا از لغو این نوبت مطمئن هستید؟")) return;
    try {
      await api.post(`appointments/appointments/${id}/cancel/`);
      alert("نوبت شما با موفقیت لغو شد.");
      fetchAppointments();
    } catch (err) {
      console.error("خطا در لغو نوبت:", err);
      const errorMessage =
        err.response?.data?.detail || "خطا در لغو نوبت. لطفاً دوباره امتحان کنید.";
      alert(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;

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
              <span style={styles.activeLink}>نوبت‌های من</span>
              <span style={styles.link} onClick={() => navigate("/patient-profile")}>
                پروفایل
              </span>
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
                style={{
                  ...styles.activeLink,
                  fontSize: isSmallMobile ? "12px" : "13px",
                  paddingBottom: isSmallMobile ? "2px" : "4px",
                  borderBottomWidth: isSmallMobile ? "2px" : "3px"
                }}
              >
                نوبت‌های من
              </span>

              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/patient-profile")}
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
        <h1
          style={{
            ...styles.title,
            fontSize: isSmallMobile ? "22px" : isMobile ? "25px" : "28px",
            marginBottom: isMobile ? "22px" : "40px"
          }}
        >
          📅 تاریخچه نوبت‌های من
        </h1>

        {loading ? (
          <p style={styles.loading}>در حال بارگذاری نوبت‌ها...</p>
        ) : appointments.length === 0 ? (
          <div
            style={{
              ...styles.emptyState,
              padding: isMobile ? "30px 18px" : "50px"
            }}
          >
            <p>هنوز هیچ نوبتی رزرو نکرده‌اید.</p>
            <button style={styles.primaryBtn} onClick={() => navigate("/doctors-list")}>
              رزرو اولین نوبت
            </button>
          </div>
        ) : (
          <div style={{ ...styles.list, gap: isMobile ? "12px" : "20px" }}>
            {appointments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  ...styles.appointmentCard,

                  borderRight:
                    apt.status === "cancelled"
                      ? "6px solid #ff5252"
                      : "6px solid #00c853",

                  // موبایل: جمع‌وجور
                  padding: isSmallMobile
                    ? "12px 12px"
                    : isMobile
                    ? "14px 14px"
                    : "20px 30px",

                  flexDirection: isMobile ? "column" : "row",

                  // مهم: تو موبایل دیگه "space-between" نزن که وسط خالی نسازه
                  justifyContent: isMobile ? "flex-start" : "space-between",

                  alignItems: isMobile ? "stretch" : "center",
                  gap: isMobile ? "10px" : "20px",

                  // مهم: قد نکشه
                  height: "auto",
                  minHeight: "unset"
                }}
              >
                {/* Top row (doctor) */}
                <div
                  style={{
                    ...styles.doctorInfo,
                    flex: isMobile ? "0 0 auto" : styles.doctorInfo.flex,
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{
                      ...styles.avatarWrapper,
                      width: isMobile ? "54px" : "70px",
                      height: isMobile ? "54px" : "70px"
                    }}
                  >
                    {apt.doctor_profile_image ? (
                      <img
                        src={apt.doctor_profile_image}
                        alt={`پروفایل دکتر ${apt.doctor_name || "نامشخص"}`}
                        style={styles.doctorImage}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: isMobile ? "24px" : "30px",
                          lineHeight: isMobile ? "54px" : "70px",
                          textAlign: "center"
                        }}
                      >
                        {defaultDoctorIcon}
                      </span>
                    )}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h4
                      style={{
                        ...styles.drName,
                        fontSize: isMobile ? "15px" : "18px",
                        marginBottom: "2px"
                      }}
                    >
                      {apt.doctor_name ? `دکتر ${apt.doctor_name}` : "پزشک نامشخص"}
                    </h4>
                    <p
                      style={{
                        ...styles.spec,
                        fontSize: isMobile ? "12.5px" : "14px"
                      }}
                    >
                      {apt.doctor_specialty || "تخصص نامشخص"}
                    </p>
                  </div>
                </div>

                {/* Middle row (date & time) */}
                <div
                  style={{
                    ...styles.dateTimeBox,
                    flex: isMobile ? "0 0 auto" : styles.dateTimeBox.flex,
                    gap: isMobile ? "6px" : "8px"
                  }}
                >
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📅 تاریخ:</span>
                    <span style={{ ...styles.value, fontSize: isMobile ? "13.5px" : "15px" }}>
                      {formatToPersianDate(apt.appointment_date)}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.label}>🕒 ساعت:</span>
                    <span style={{ ...styles.value, fontSize: isMobile ? "13.5px" : "15px" }}>
                      {apt.appointment_time?.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {/* Bottom row (status + actions) */}
                <div
                  style={{
                    ...styles.bottomRow,
                    flexDirection: isMobile ? "row" : "column",
                    alignItems: isMobile ? "center" : "center",
                    justifyContent: "space-between",
                    gap: isMobile ? "10px" : "10px"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          apt.status === "cancelled"
                            ? "#ffebee"
                            : apt.status === "confirmed"
                            ? "#e8f5e9"
                            : "#fff3e0",
                        color:
                          apt.status === "cancelled"
                            ? "#c62828"
                            : apt.status === "confirmed"
                            ? "#2e7d32"
                            : "#ef6c00",
                        fontSize: isMobile ? "11px" : "12px",
                        alignSelf: isMobile ? "flex-start" : "center"
                      }}
                    >
                      {apt.status === "pending"
                        ? "در انتظار تایید"
                        : apt.status === "confirmed"
                        ? "تایید شده"
                        : "لغو شده"}
                    </span>

                    {apt.status === "cancelled" &&
                      apt.cancellation_reason === "doctor_or_system" && (
                        <p
                          style={{
                            ...styles.cancelNotice,
                            textAlign: "right",
                            maxWidth: isMobile ? "100%" : "260px"
                          }}
                        >
                          ⚠️ این نوبت توسط پزشک یا سیستم لغو شده است.
                        </p>
                      )}
                  </div>

                  {apt.status !== "cancelled" && (
                    <button
                      style={{
                        ...styles.cancelBtn,
                        fontSize: isMobile ? "11px" : "12px",
                        padding: isMobile ? "6px 12px" : "5px 12px",
                        whiteSpace: "nowrap",
                        alignSelf: isMobile ? "flex-end" : "center"
                      }}
                      onClick={() => cancelByPatient(apt.id)}
                    >
                      لغو نوبت
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    background: "radial-gradient(circle at top right, #f0f9ff, #cbebff, #f0faff)",
    minHeight: "100vh",
    direction: "rtl",
    fontFamily: "Tahoma, Arial"
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
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
    alignItems: "center"
  },

  navLinks: {
    display: "flex",
    gap: "25px",
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
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "0 20px"
  },

  title: {
    textAlign: "center",
    color: "#007080",
    marginBottom: "40px",
    fontSize: "28px"
  },

  loading: {
    textAlign: "center",
    marginTop: "50px",
    color: "#007080"
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  appointmentCard: {
    background: "rgba(255,255,255,0.8)",
    borderRadius: "22px",
    padding: "20px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
    backdropFilter: "blur(10px)",
    border: "1px solid #fff",
    flexWrap: "wrap",
    gap: "20px",

    // جلوگیری از قد کشیدن ناخواسته
    height: "auto",
    minHeight: "unset"
  },

  doctorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: "1 1 250px",
    minWidth: 0
  },

  avatarWrapper: {
    width: "70px",
    height: "70px",
    background: "#e0f2f1",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    overflow: "hidden",
    border: "2px solid #b2dfdb",
    flexShrink: 0
  },

  doctorImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%"
  },

  drName: {
    margin: 0,
    color: "#004d40",
    fontSize: "18px"
  },

  spec: {
    margin: "2px 0 0 0",
    color: "#00acc1",
    fontSize: "14px",
    fontWeight: "bold"
  },

  dateTimeBox: {
    flex: "1 1 200px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },

  label: {
    color: "#00796b",
    fontWeight: "bold",
    fontSize: "13px"
  },

  value: {
    color: "#333",
    fontSize: "15px"
  },

  bottomRow: {
    flex: "1 1 180px",
    display: "flex",
    gap: "10px"
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    width: "fit-content"
  },

  cancelNotice: {
    color: "#d32f2f",
    fontSize: "11px",
    margin: 0,
    fontWeight: "bold"
  },

  cancelBtn: {
    background: "none",
    border: "1px solid #ff5252",
    color: "#ff5252",
    padding: "5px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px"
  },

  emptyState: {
    textAlign: "center",
    padding: "50px",
    background: "rgba(255,255,255,0.5)",
    borderRadius: "20px"
  },

  primaryBtn: {
    background: "#00897b",
    color: "#fff",
    border: "none",
    padding: "12px 25px",
    borderRadius: "12px",
    cursor: "pointer",
    marginTop: "20px"
  }
};

export default PatientMyAppointments;
