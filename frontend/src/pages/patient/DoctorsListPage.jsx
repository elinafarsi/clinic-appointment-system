import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function DoctorsList() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };
  

  // هربار که مقدار search تغییر می‌کنه، با یک تاخیر ۵۰۰ میلی‌ثانیه‌ای (Debounce) سرچ بک‌اند صدا زده می‌شه
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDoctors(search);
    }, 500); // ۵۰۰ میلی‌ثانیه صبر می‌کنه تا کاربر تایپش تموم بشه

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // تابع دریافت پزشکان از بک‌اند با فیلتر سرچ
  const fetchDoctors = async (searchQuery = "") => {
    setLoading(true);
    try {
      // ارسال مقدار جستجو به بک‌اند
      const response = await api.get(`/accounts/doctors/`, {
        params: { search: searchQuery }
      });
      console.log("Doctors API (Filtered):", response.data);

      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("خطا در دریافت لیست پزشکان:", error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <span style={{ fontSize: "28px", marginLeft: "10px" }}>⛑️</span>
          کلینیک نوبت‌دهی آنلاین
        </div>

        <div style={styles.navLinks}>
          <span style={styles.link} onClick={() => navigate("/patient-dashboard")}>
            داشبورد
          </span>

          <span style={styles.activeLink}>
            پزشکان
          </span>

          <span style={styles.link} onClick={() => navigate("/patient-appointments")}>
            نوبت‌های من
          </span>

          <span style={styles.link} onClick={() => navigate("/patient-profile")}>
            پروفایل
          </span>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            خروج
          </button>
        </div>
      </nav>

      <div style={styles.mainContainer}>

        <h2 style={styles.title}>لیست پزشکان</h2>

        <div style={styles.searchWrapper}>
          <input
            placeholder="جستجوی نام، فامیل یا تخصص پزشک..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#007080" }}>
            در حال بارگذاری پزشکان...
          </p>
        ) : doctors.length === 0 ? (
          <p style={{ textAlign: "center" }}>پزشکی یافت نشد</p>
        ) : (
          <div style={styles.grid3}>
            {doctors.map((doctor) => (
              <div key={doctor.id} style={styles.doctorCard}>
                <div style={styles.avatarWrapper}>
                  {doctor.profile_image ? (
                    <img
                      src={doctor.profile_image}
                      alt="doctor"
                      style={styles.avatarImg}
                    />
                  ) : (
                    <span style={{ fontSize: "40px" }}>👤</span>
                  )}
                </div>

                <h4 style={styles.doctorName}>
                  دکتر {doctor.first_name} {doctor.last_name}
                </h4>

                <p style={styles.doctorSpecialty}>
                  {doctor.specialty || "متخصص عمومی"}
                </p>

                <button
                  onClick={() => navigate(`/doctor/${doctor.id}`)}
                  style={styles.viewProfileBtn}
                >
                  مشاهده پروفایل و رزرو
                </button>
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
    padding: "15px 60px",
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

  link: {
    cursor: "pointer",
    color: "#555",
    fontWeight: "500"
  },

  activeLink: {
    color: "#00897b",
    fontWeight: "bold",
    borderBottom: "3px solid #00897b",
    paddingBottom: "5px"
  },

  logoutBtn: {
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer"
  },

  mainContainer: {
    maxWidth: "1100px",
    margin: "40px auto",
    padding: "0 20px"
  },

  title: {
    textAlign: "center",
    color: "#007080",
    marginBottom: "30px"
  },

  searchWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px"
  },

  searchInput: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    width: "260px"
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "25px"
  },

  doctorCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: "22px",
    textAlign: "center",
    padding: "25px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.03)",
    backdropFilter: "blur(5px)"
  },

  avatarWrapper: {
    width: "100px",
    height: "100px",
    background: "#fff",
    borderRadius: "50%",
    margin: "0 auto 15px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    border: "3px solid #e0f2f1"
  },

  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },

  doctorName: { color: "#004d40", fontSize: "18px", margin: "10px 0 5px 0" },

  doctorSpecialty: {
    color: "#00acc1",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "15px"
  },

  viewProfileBtn: {
    backgroundColor: "#007080",
    color: "#fff",
    border: "none",
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};

export default DoctorsList;
