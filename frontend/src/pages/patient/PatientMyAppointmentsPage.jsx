import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const defaultDoctorIcon = "🧑‍⚕️"; 

function PatientMyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("appointments/appointments/");
      const data = res.data.results ? res.data.results : res.data;
      // اطمینان از اینکه داده دریافتی حتماً آرایه است
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("خطا در دریافت نوبت‌ها:", err);
      // در صورت بروز خطا، لیست خالی نمایش داده می‌شود
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelByPatient = async (id) => {
    // نمایش پنجره تایید قبل از لغو
    if (!window.confirm("آیا از لغو این نوبت مطمئن هستید؟")) return;
    try {
      // فرض بر این است که بک‌اند، لغو توسط بیمار را به درستی پردازش می‌کند.
      await api.post(`appointments/appointments/${id}/cancel/`);
      alert("نوبت شما با موفقیت لغو شد.");
      // بارگذاری مجدد لیست نوبت‌ها پس از موفقیت آمیز بودن لغو
      fetchAppointments(); 
    } catch (err) {
      console.error("خطا در لغو نوبت:", err); 
      // نمایش پیام خطای دقیق‌تر به کاربر در صورت بروز مشکل
      const errorMessage = err.response?.data?.detail || "خطا در لغو نوبت. لطفاً دوباره امتحان کنید.";
      alert(errorMessage);
    }
  };

  // تابع خروج از حساب کاربری
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };
  

  return (
    <div style={styles.pageBackground}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <span style={{ fontSize: "26px", marginLeft: "10px" }}>⛑️</span>
          کلینیک نوبت‌دهی آنلاین
        </div>
        <div style={styles.navLinks}>
          <span style={styles.link} onClick={() => navigate("/patient-dashboard")}>داشبورد</span>
          <span style={styles.link} onClick={() => navigate("/doctors-list")}>پزشکان</span>
          <span style={styles.activeLink}>نوبت‌های من</span>
          <span style={styles.link} onClick={() => navigate("/patient-profile")}>پروفایل</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>خروج</button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div style={styles.container}>
        <h1 style={styles.title}>📅 تاریخچه نوبت‌های من</h1>

        {loading ? (
          // نمایش وضعیت بارگذاری
          <p style={styles.loading}>در حال بارگذاری نوبت‌ها...</p>
        ) : appointments.length === 0 ? (
          // حالت نمایش زمانی که هیچ نوبتی وجود ندارد
          <div style={styles.emptyState}>
            <p>هنوز هیچ نوبتی رزرو نکرده‌اید.</p>
            <button style={styles.primaryBtn} onClick={() => navigate("/doctors-list")}>
              رزرو اولین نوبت
            </button>
          </div>
        ) : (
          // نمایش لیست نوبت‌ها
          <div style={styles.list}>
            {appointments.map((apt) => (
              <div
                key={apt.id}
                // اعمال استایل لبه کارت بر اساس وضعیت نوبت (سبز برای فعال، قرمز برای لغو شده)
                style={{
                  ...styles.appointmentCard,
                  borderRight: apt.status === 'cancelled' ? '6px solid #ff5252' : '6px solid #00c853'
                }}
              >
                {/* بخش اطلاعات پزشک */}
                <div style={styles.doctorInfo}>
                  <div style={styles.avatarWrapper}>
                    {apt.doctor_profile_image ? (
                      <img
                        src={apt.doctor_profile_image}
                        alt={`پروفایل دکتر ${apt.doctor_name || 'نامشخص'}`}
                        style={styles.doctorImage}
                        // مدیریت خطا در بارگذاری عکس: در صورت خطا، اموجی نمایش داده می‌شود
                        onError={(e) => {
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      // اگر عکس پزشک موجود نبود، اموجی دکتر را نمایش بده
                      <span style={{ fontSize: '30px', lineHeight: '70px', textAlign: 'center' }}>{defaultDoctorIcon}</span>
                    )}
                  </div>
                  <div>
                    <h4 style={styles.drName}>
                       {apt.doctor_name ? `دکتر ${apt.doctor_name}` : 'پزشک نامشخص'}
                    </h4>
                    <p style={styles.spec}>{apt.doctor_specialty || 'تخصص نامشخص'}</p>
                  </div>
                </div>

                <div style={styles.dateTimeBox}>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📅 تاریخ:</span>
                    <span style={styles.value}>{formatToPersianDate(apt.appointment_date)}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>🕒 ساعت:</span>
                    <span style={styles.value}>{apt.appointment_time?.slice(0, 5)}</span>
                  </div>
                </div>

                <div style={styles.statusBox}>
                  {/* نمایش وضعیت نوبت با رنگ‌بندی مناسب */}
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: apt.status === 'cancelled' ? '#ffebee' : (apt.status === 'confirmed' ? '#e8f5e9' : '#fff3e0'),
                    color: apt.status === 'cancelled' ? '#c62828' : (apt.status === 'confirmed' ? '#2e7d32' : '#ef6c00'),
                  }}>
                    {apt.status === 'pending' ? 'در انتظار تایید' :
                     apt.status === 'confirmed' ? 'تایید شده' :
                     'لغو شده'}
                  </span>

                  {/* نمایش پیام هشدار در صورت لغو نوبت توسط پزشک یا سیستم */}
                  {apt.status === 'cancelled' && apt.cancellation_reason === 'doctor_or_system' && (
                    <p style={styles.cancelNotice}>⚠️ این نوبت توسط پزشک یا سیستم لغو شده است.</p>
                  )}

                  {/* نمایش دکمه لغو نوبت، فقط در صورتی که نوبت لغو نشده باشد */}
                  {apt.status !== 'cancelled' && (
                    <button style={styles.cancelBtn} onClick={() => cancelByPatient(apt.id)}>
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
    background: 'radial-gradient(circle at top right, #f0f9ff, #cbebff, #f0faff)',
    minHeight: '100vh',
    direction: 'rtl', 
    fontFamily: 'Tahoma, Arial'
  },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 60px', backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)' 
  },
  logo: { fontWeight: 'bold', fontSize: '22px', color: '#007080', display: 'flex', alignItems: 'center' },
  navLinks: { display: 'flex', gap: '25px', alignItems: 'center' },
  link: { cursor: 'pointer', color: '#555', transition: '0.3s' }, 
  activeLink: { color: '#00897b', fontWeight: 'bold', borderBottom: '3px solid #00897b', paddingBottom: '5px' }, 
  logoutBtn: {
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },  container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }, 
  title: { textAlign: 'center', color: '#007080', marginBottom: '40px', fontSize: '28px' }, 
  loading: { textAlign: 'center', marginTop: '50px', color: '#007080' }, 
  list: { display: 'flex', flexDirection: 'column', gap: '20px' }, 
  appointmentCard: {
    background: "rgba(255,255,255,0.8)", 
    borderRadius: "22px",
    padding: "20px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)", 
    backdropFilter: "blur(10px)", 
    border: '1px solid #fff',
    flexWrap: 'wrap', 
    gap: '20px' 
  },
  doctorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flex: '1 1 250px',
  },
  avatarWrapper: {
    width: '70px', height: '70px', background: '#e0f2f1', 
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden', 
    border: '2px solid #b2dfdb', 
    flexShrink: 0 
  },
  doctorImage: { 
    width: '100%',
    height: '100%',
    objectFit: 'cover', 
    borderRadius: '50%',
  },
  drName: { margin: 0, color: "#004d40", fontSize: '18px' }, 
  spec: { margin: "5px 0 0 0", color: "#00acc1", fontSize: '14px', fontWeight: 'bold' }, 
  dateTimeBox: {
    flex: '1 1 200px',
    display: 'flex', flexDirection: 'column', gap: '8px'
  },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px' }, 
  label: { color: "#00796b", fontWeight: 'bold', fontSize: '13px' }, 
  value: { color: "#333", fontSize: '15px' }, 
  statusBox: {
    flex: '1 1 180px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
  },
  statusBadge: { padding: "6px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" },
  cancelNotice: { color: '#d32f2f', fontSize: '11px', margin: 0, textAlign: 'center', fontWeight: 'bold' }, 
  cancelBtn: { background: "none", border: "1px solid #ff5252", color: "#ff5252", padding: "5px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }, 
  emptyState: { textAlign: 'center', padding: '50px', background: 'rgba(255,255,255,0.5)', borderRadius: '20px' },
  primaryBtn: { background: "#00897b", color: "#fff", border: "none", padding: "12px 25px", borderRadius: "12px", cursor: "pointer", marginTop: '20px' } 
};

export default PatientMyAppointments;
