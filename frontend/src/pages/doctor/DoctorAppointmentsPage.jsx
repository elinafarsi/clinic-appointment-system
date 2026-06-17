import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

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

  // تابع برای تبدیل تاریخ میلادی به شمسی 
  const formatToPersianDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  useEffect(() => {
    fetchAppointments();
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
      ? selectedDate.toDate().toLocaleDateString('sv-SE') 
      : null;

    const payload = {
        start_time: slotData.start_time,
        end_time: slotData.end_time,
        date: formattedDate,
        day_of_week: selectedDate ? null : slotData.day_of_week
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
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <span style={{ fontSize: "26px", marginLeft: "10px" }}>⛑️</span>
          کلینیک نوبت‌دهی آنلاین
        </div>
        <div style={styles.navLinks}>
          <span style={styles.link} onClick={() => navigate("/doctor-dashboard")}>داشبورد</span>
          <span style={styles.activeLink}>نوبت‌ها</span>
          <span style={styles.link} onClick={() => navigate("/doctor-profile")}>پروفایل</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>خروج</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.title}>مدیریت نوبت‌های بیماران</h1>

        <div style={styles.grid}>
          {/* بخش لیست نوبت‌ها  */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📅 لیست نوبت‌ها</h3>
            {loading ? (
              <p style={styles.loading}>در حال دریافت اطلاعات...</p>
            ) : appointments.length === 0 ? (
              <p style={styles.empty}>نوبتی ثبت نشده است.</p>
            ) : (
              <div style={styles.list}>
                {appointments.map((item) => (
                  <div 
                    key={item.id} 
                    style={{
                        ...styles.appointment,
                        opacity: item.status === "cancelled" ? 0.7 : 1,
                        borderRight: item.status === "cancelled" ? "5px solid #ff5252" : "5px solid #00897b"
                    }}
                  >
                    <div>
                      <div style={styles.patient}>
                        👤 {item.patient_name || "بیمار ناشناس"}
                      </div>
                      <div style={styles.time}>
                        <span style={{color: '#00695c', fontWeight: '600'}}>
                            📅 {formatToPersianDate(item.appointment_date)}
                        </span>
                        <br/>
                        <span style={{fontSize: '13px', color: '#666'}}>
                            ⏰ ساعت: {item.appointment_time?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                    <div style={styles.actions}>
                      <span
                        style={{
                          ...styles.status,
                          background: item.status === "cancelled" ? "#ffebee" : "#e0f7fa",
                          color: item.status === "cancelled" ? "#c62828" : "#00796b",
                        }}
                      >
                        {item.status === "pending" ? "در انتظار" : item.status === "confirmed" ? "تایید شده" : "لغو شده"}
                      </span>
                      {item.status !== "cancelled" && (
                        <button style={styles.cancelBtn} onClick={() => cancelAppointment(item.id)}>
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
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>⏰ تعریف زمان خالی</h3>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '10px'}}>
                می‌توانید یک تاریخ خاص انتخاب کنید یا یک روز هفته را برای تکرار مشخص کنید:
            </p>

            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                <Calendar
                    calendar={persian}
                    locale={persian_fa}
                    value={selectedDate}
                    onChange={(date) => {
                        setSelectedDate(date);
                        setSlotData({...slotData, day_of_week: ""});
                    }}
                />
            </div>

            {selectedDate && (
                <div style={styles.selectedDateBadge}>
                    <span>تاریخ انتخاب شده: {selectedDate.format("YYYY/MM/DD")}</span>
                    <button onClick={() => setSelectedDate(null)} style={styles.clearDate}>✖</button>
                </div>
            )}

            <form onSubmit={createSlot} style={styles.form}>
              {!selectedDate && (
                  <select
                    name="day_of_week"
                    value={slotData.day_of_week}
                    onChange={handleChange}
                    style={styles.input}
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

              <div style={{display: 'flex', gap: '10px'}}>
                  <div style={{flex: 1}}>
                      <label style={styles.label}>از ساعت:</label>
                      <input type="time" name="start_time" value={slotData.start_time} onChange={handleChange} required style={styles.input} />
                  </div>
                  <div style={{flex: 1}}>
                      <label style={styles.label}>تا ساعت:</label>
                      <input type="time" name="end_time" value={slotData.end_time} onChange={handleChange} required style={styles.input} />
                  </div>
              </div>

              <button style={styles.primaryBtn}>ثبت در سیستم</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: { minHeight: "100vh", background: "radial-gradient(circle,#f0f9ff 0%,#cbebff 100%)", direction: "rtl", fontFamily: 'Tahoma, Arial' },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 60px", backgroundColor: "rgba(255,255,255,0.9)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", backdropFilter: "blur(10px)" },
  logo: { fontWeight: "bold", fontSize: "22px", color: "#007080", display: "flex", alignItems: "center" },
  navLinks: { display: "flex", gap: "20px", alignItems: "center" },
  link: { cursor: "pointer", color: "#555" },
  activeLink: { color: "#00897b", fontWeight: "bold", borderBottom: "2px solid #00897b" },
  logoutBtn: { backgroundColor: "#e53935", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px", cursor: "pointer" },
  container: { maxWidth: "1100px", margin: "40px auto", padding: '0 20px' },
  title: { textAlign: "center", color: "#007080", marginBottom: "40px" },
  grid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "25px" },
  card: { background: "rgba(255,255,255,0.9)", borderRadius: "25px", padding: "30px", boxShadow: "0 10px 20px rgba(0,0,0,0.04)", backdropFilter: "blur(8px)" },
  cardTitle: { color: "#00695c", marginBottom: "20px" },
  list: { display: "flex", flexDirection: "column", gap: "15px" },
  appointment: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", borderRadius: "14px", background: "#f8ffff", border: "1px solid #d7f0ec", transition: '0.3s' },
  patient: { fontWeight: "bold", color: "#37474f", marginBottom: '5px' },
  time: { fontSize: "14px", lineHeight: '1.6' },
  actions: { display: "flex", flexDirection: 'column', alignItems: 'flex-end', gap: "8px" },
  status: { padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 'bold' },
  cancelBtn: { background: "#ff5252", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: '12px' },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "12px", borderRadius: "10px", border: "1px solid #ddd", width: '100%', boxSizing: 'border-box' },
  label: { fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' },
  primaryBtn: { background: "#00897b", color: "#fff", border: "none", padding: "14px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", marginTop: '10px' },
  selectedDateBadge: { background: '#e0f2f1', padding: '10px 15px', borderRadius: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#00796b', fontWeight: 'bold' },
  clearDate: { border: 'none', background: 'none', color: '#e53935', cursor: 'pointer', fontSize: '18px' },
  empty: { color: "#607d8b", textAlign: 'center' },
  loading: { color: "#607d8b", textAlign: 'center' },
};

export default DoctorAppointments;
