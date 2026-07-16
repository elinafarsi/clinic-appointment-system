import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import "react-multi-date-picker/styles/layouts/mobile.css";

function DoctorAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const [slotData, setSlotData] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
  });

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // تابع برای تبدیل تاریخ میلادی به شمسی
  const formatToPersianDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fa-IR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("appointments/appointments/");
      const data = res.data.results ? res.data.results : res.data;
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("خطا در دریافت نوبت‌ها:", err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("از لغو این نوبت مطمئن هستید؟")) return;
    try {
      await api.post(`appointments/appointments/${id}/cancel_by_doctor/`);
      alert("نوبت با موفقیت لغو شد ✅");
      fetchAppointments();
    } catch (err) {
      alert("خطا در لغو نوبت");
    }
  };

  const handleChange = (e) => {
    setSlotData({ ...slotData, [e.target.name]: e.target.value });
  };

  const createSlot = async (e) => {
    e.preventDefault();
    const formattedDate = selectedDate
      ? selectedDate.toDate().toLocaleDateString("sv-SE")
      : null;

    const payload = {
      start_time: slotData.start_time,
      end_time: slotData.end_time,
      date: formattedDate,
      day_of_week: selectedDate ? null : slotData.day_of_week,
    };

    if (!payload.date && !payload.day_of_week) {
      alert("لطفاً یا یک تاریخ از تقویم انتخاب کنید یا یک روز هفته!");
      return;
    }

    try {
      await api.post("appointments/availability/", payload);
      alert("تایم خالی با موفقیت اضافه شد ✅");
      setSlotData({ day_of_week: "", start_time: "", end_time: "" });
      setSelectedDate(null);
    } catch (err) {
      alert("خطا: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <div style={styles.pageBackground}>
      <nav
        style={
          isMobile
            ? {
                ...styles.navbar,
                padding: isSmallMobile ? "8px 10px" : "10px 16px",
              }
            : styles.navbar
        }
      >
        {!isMobile ? (
          <>
            <div style={styles.logo}>
              <span style={{ fontSize: "26px", marginLeft: "10px" }}>⛑️</span>
              کلینیک نوبت‌دهی آنلاین
            </div>
            <div style={styles.navLinks}>
              <span style={styles.link} onClick={() => navigate("/doctor-dashboard")}>
                داشبورد
              </span>
              <span style={styles.activeLink}>نوبت‌ها</span>
              <span style={styles.link} onClick={() => navigate("/doctor-profile")}>
                پروفایل
              </span>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                خروج
              </button>
            </div>
          </>
        ) : (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={styles.navTopRow}>
              <div
                style={{
                  ...styles.logo,
                  fontSize: isSmallMobile ? "14px" : "16px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
                title="کلینیک نوبت‌دهی آنلاین"
              >
                <span style={{ fontSize: isSmallMobile ? 18 : 22, marginLeft: 8 }}>⛑️</span>
                کلینیک نوبت‌دهی آنلاین
              </div>

              <button
                style={{
                  ...styles.logoutBtn,
                  padding: isSmallMobile ? "6px 10px" : "8px 14px",
                  fontSize: isSmallMobile ? "12px" : "13px",
                  borderRadius: isSmallMobile ? "8px" : "12px",
                  flexShrink: 0,
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
                borderTop: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/doctor-dashboard")}
              >
                داشبورد
              </span>
              <span style={{ ...styles.activeLink, fontSize: isSmallMobile ? "12px" : "13px" }}>
                نوبت‌ها
              </span>
              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/doctor-profile")}
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
          margin: isMobile ? "24px auto" : "40px auto",
          padding: isMobile ? "0 14px" : "0 20px",
        }}
      >
        <h1
          style={{
            ...styles.title,
            fontSize: isSmallMobile ? "20px" : isMobile ? "24px" : "32px",
            marginBottom: isMobile ? "22px" : "40px",
            lineHeight: isMobile ? "1.8" : "normal",
          }}
        >
          مدیریت نوبت‌های بیماران
        </h1>

        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr",
            gap: isMobile ? "16px" : "25px",
          }}
        >
          {/* بخش لیست نوبت‌ها */}
          <div
            style={{
              ...styles.card,
              padding: isSmallMobile ? "18px 14px" : isMobile ? "22px 16px" : "30px",
              borderRadius: isMobile ? "18px" : "25px",
            }}
          >
            <h3
              style={{
                ...styles.cardTitle,
                fontSize: isSmallMobile ? "16px" : isMobile ? "17px" : "20px",
                marginBottom: isMobile ? "16px" : "20px",
              }}
            >
              📅 لیست نوبت‌ها
            </h3>

            {loading ? (
              <p style={styles.loading}>در حال دریافت اطلاعات...</p>
            ) : appointments.length === 0 ? (
              <p style={styles.empty}>نوبتی ثبت نشده است.</p>
            ) : (
              <div style={{ ...styles.list, gap: isMobile ? "10px" : "15px" }}>
                {appointments.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      ...styles.appointment,
                      flexDirection: isSmallMobile ? "column" : "row",
                      alignItems: isSmallMobile ? "stretch" : "center",
                      gap: isSmallMobile ? "10px" : 0,
                      padding: isMobile ? "12px" : "15px",
                      opacity: item.status === "cancelled" ? 0.7 : 1,
                      borderRight:
                        item.status === "cancelled"
                          ? "5px solid #ff5252"
                          : "5px solid #00897b",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          ...styles.patient,
                          fontSize: isMobile ? "14px" : "16px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={item.patient_name || "بیمار ناشناس"}
                      >
                        👤 {item.patient_name || "بیمار ناشناس"}
                      </div>

                      <div style={{ ...styles.time, fontSize: isMobile ? "13px" : "14px" }}>
                        <span style={{ color: "#00695c", fontWeight: "600" }}>
                          📅 {formatToPersianDate(item.appointment_date)}
                        </span>
                        <br />
                        <span style={{ fontSize: isMobile ? "12px" : "13px", color: "#666" }}>
                          ⏰ ساعت: {item.appointment_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        ...styles.actions,
                        alignItems: isSmallMobile ? "stretch" : "flex-end",
                        width: isSmallMobile ? "100%" : "auto",
                      }}
                    >
                      <span
                        style={{
                          ...styles.status,
                          background: item.status === "cancelled" ? "#ffebee" : "#e0f7fa",
                          color: item.status === "cancelled" ? "#c62828" : "#00796b",
                          alignSelf: isSmallMobile ? "flex-start" : "auto",
                        }}
                      >
                        {item.status === "pending"
                          ? "در انتظار"
                          : item.status === "confirmed"
                          ? "تایید شده"
                          : "لغو شده"}
                      </span>

                      {item.status !== "cancelled" && (
                        <button
                          style={{
                            ...styles.cancelBtn,
                            width: isSmallMobile ? "100%" : "auto",
                            padding: isMobile ? "9px 12px" : "6px 12px",
                          }}
                          onClick={() => cancelAppointment(item.id)}
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

          {/* بخش تعریف زمان خالی */}
          <div
            style={{
              ...styles.card,
              padding: isSmallMobile ? "18px 14px" : isMobile ? "22px 16px" : "30px",
              borderRadius: isMobile ? "18px" : "25px",
            }}
          >
            <h3
              style={{
                ...styles.cardTitle,
                fontSize: isSmallMobile ? "16px" : isMobile ? "17px" : "20px",
              }}
            >
              ⏰ تعریف زمان خالی
            </h3>

            <p
              style={{
                fontSize: isMobile ? "12.5px" : "13px",
                color: "#666",
                marginBottom: "10px",
                lineHeight: isMobile ? "1.9" : "normal",
              }}
            >
              می‌توانید یک تاریخ خاص انتخاب کنید یا یک روز هفته را برای تکرار مشخص کنید:
            </p>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: isMobile ? "14px" : "20px" }}>
              <div style={{ width: "100%", maxWidth: isMobile ? 340 : 420 }}>
                <Calendar
                  calendar={persian}
                  locale={persian_fa}
                  value={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setSlotData({ ...slotData, day_of_week: "" });
                  }}
                  className={isMobile ? "rmdp-mobile" : ""}
                />
              </div>
            </div>

            {selectedDate && (
              <div
                style={{
                  ...styles.selectedDateBadge,
                  padding: isMobile ? "10px 12px" : "10px 15px",
                  borderRadius: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "12.5px" : "14px",
                }}
              >
                <span>تاریخ انتخاب شده: {selectedDate.format("YYYY/MM/DD")}</span>
                <button onClick={() => setSelectedDate(null)} style={styles.clearDate}>
                  ✖
                </button>
              </div>
            )}

            <form onSubmit={createSlot} style={{ ...styles.form, gap: isMobile ? "12px" : "15px" }}>
              {!selectedDate && (
                <select
                  name="day_of_week"
                  value={slotData.day_of_week}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    padding: isMobile ? "11px" : "12px",
                    borderRadius: isMobile ? "10px" : "10px",
                    fontSize: isMobile ? "13px" : "14px",
                  }}
                  required={!selectedDate}
                >
                  <option value="">انتخاب روز هفته (تکرار شونده)</option>
                  <option value="5">شنبه</option>
                  <option value="6">یکشنبه</option>
                  <option value="0">دوشنبه</option>
                  <option value="1">سه‌شنبه</option>
                  <option value="2">چهارشنبه</option>
                  <option value="3">پنجشنبه</option>
                  <option value="4">جمعه</option>
                </select>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: isSmallMobile ? "column" : "row",
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>از ساعت:</label>
                  <input
                    type="time"
                    name="start_time"
                    value={slotData.start_time}
                    onChange={handleChange}
                    required
                    style={{
                      ...styles.input,
                      padding: isMobile ? "11px" : "12px",
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={styles.label}>تا ساعت:</label>
                  <input
                    type="time"
                    name="end_time"
                    value={slotData.end_time}
                    onChange={handleChange}
                    required
                    style={{
                      ...styles.input,
                      padding: isMobile ? "11px" : "12px",
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  />
                </div>
              </div>

              <button
                style={{
                  ...styles.primaryBtn,
                  padding: isMobile ? "12px" : "14px",
                  borderRadius: isMobile ? "10px" : "12px",
                  fontSize: isMobile ? "14px" : "15px",
                }}
              >
                ثبت در سیستم
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    minHeight: "100vh",
    background: "radial-gradient(circle,#f0f9ff 0%,#cbebff 100%)",
    direction: "rtl",
    fontFamily: "Tahoma, Arial",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 60px",
    backgroundColor: "rgba(255,255,255,0.9)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  logo: {
    fontWeight: "bold",
    fontSize: "22px",
    color: "#007080",
    display: "flex",
    alignItems: "center",
    minWidth: 0,
  },

  navLinks: { display: "flex", gap: "20px", alignItems: "center" },

  navTopRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  navLinksRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  link: { cursor: "pointer", color: "#555", whiteSpace: "nowrap" },

  activeLink: {
    color: "#00897b",
    fontWeight: "bold",
    borderBottom: "2px solid #00897b",
    whiteSpace: "nowrap",
  },

  logoutBtn: {
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
  },

  container: { maxWidth: "1100px", margin: "40px auto", padding: "0 20px" },

  title: { textAlign: "center", color: "#007080", marginBottom: "40px" },

  grid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "25px" },

  card: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "25px",
    padding: "30px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.04)",
    backdropFilter: "blur(8px)",
  },

  cardTitle: { color: "#00695c", marginBottom: "20px" },

  list: { display: "flex", flexDirection: "column", gap: "15px" },

  appointment: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderRadius: "14px",
    background: "#f8ffff",
    border: "1px solid #d7f0ec",
    transition: "0.3s",
  },

  patient: { fontWeight: "bold", color: "#37474f", marginBottom: "5px" },

  time: { fontSize: "14px", lineHeight: "1.6" },

  actions: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" },

  status: { padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "bold" },

  cancelBtn: {
    background: "#ff5252",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "12px",
  },

  form: { display: "flex", flexDirection: "column", gap: "15px" },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    width: "100%",
    boxSizing: "border-box",
  },

  label: { fontSize: "12px", color: "#666", display: "block", marginBottom: "5px" },

  primaryBtn: {
    background: "#00897b",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },

  selectedDateBadge: {
    background: "#e0f2f1",
    padding: "10px 15px",
    borderRadius: "12px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#00796b",
    fontWeight: "bold",
  },

  clearDate: {
    border: "none",
    background: "none",
    color: "#e53935",
    cursor: "pointer",
    fontSize: "18px",
  },

  empty: { color: "#607d8b", textAlign: "center" },

  loading: { color: "#607d8b", textAlign: "center" },
};

export default DoctorAppointments;
