import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function DoctorsList() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // استیت‌های مربوط به صفحه‌بندی (هر صفحه حداکثر ۱۲ پزشک)
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 12;

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

  // هربار که مقدار search تغییر می‌کنه، با یک تاخیر ۵۰۰ میلی‌ثانیه‌ای (Debounce) سرچ بک‌اند صدا زده می‌شه
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDoctors(search);
      setCurrentPage(1); // وقتی سرچ جدید انجام میشه، برگردیم به صفحه اول
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // تابع دریافت پزشکان از بک‌اند با فیلتر سرچ
  const fetchDoctors = async (searchQuery = "") => {
    setLoading(true);
    try {
      const response = await api.get(`/accounts/doctors/`, {
        params: { search: searchQuery }
      });
      console.log("Doctors API (Filtered):", response.data);

      const data = response.data.results ? response.data.results : response.data;
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("خطا در دریافت لیست پزشکان:", error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;

  // محاسبات مربوط به صفحه‌بندی
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // اسکرول نرم به بالای صفحه برای کاربری راحت‌تر هنگام تعویض صفحه
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
              <span style={{ fontSize: "28px", marginLeft: "10px" }}>⛑️</span>
              کلینیک نوبت‌دهی آنلاین
            </div>

            <div style={styles.navLinks}>
              <span style={styles.link} onClick={() => navigate("/patient-dashboard")}>
                داشبورد
              </span>

              <span style={styles.activeLink}>پزشکان</span>

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
          </>
        )}

        {/* MOBILE / TABLET */}
        {isMobile && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Row 1 */}
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

            {/* Row 2 */}
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
                style={{
                  ...styles.activeLink,
                  fontSize: isSmallMobile ? "12px" : "13px",
                  paddingBottom: isSmallMobile ? "2px" : "4px",
                  borderBottomWidth: isSmallMobile ? "2px" : "3px"
                }}
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
          ...styles.mainContainer,
          margin: isMobile ? "25px auto" : "40px auto",
          padding: isMobile ? "0 14px" : "0 20px"
        }}
      >
        <h2
          style={{
            ...styles.title,
            fontSize: isSmallMobile ? "22px" : isMobile ? "26px" : "30px",
            marginBottom: isMobile ? "22px" : "30px"
          }}
        >
          لیست پزشکان
        </h2>

        <div
          style={{
            ...styles.searchWrapper,
            marginBottom: isMobile ? "22px" : "30px"
          }}
        >
          <input
            placeholder="جستجوی نام، فامیل یا تخصص پزشک..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...styles.searchInput,
              width: isSmallMobile ? "100%" : isMobile ? "100%" : "320px",
              maxWidth: "100%",
              fontSize: isSmallMobile ? "13px" : "14px",
              padding: isSmallMobile ? "10px" : "12px"
            }}
          />
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#007080" }}>
            در حال بارگذاری پزشکان...
          </p>
        ) : doctors.length === 0 ? (
          <p style={{ textAlign: "center", color: "#607d8b" }}>پزشکی یافت نشد</p>
        ) : (
          <>
            <div
              style={{
                ...styles.grid3,
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(280px, 1fr))",
                gap: isMobile ? "18px" : "25px"
              }}
            >
              {currentDoctors.map((doctor) => (
                <div key={doctor.id} style={styles.doctorCard}>
                  <div style={styles.avatarWrapper}>
                    {doctor.profile_image ? (
                      <img
                        src={
                          doctor.profile_image.startsWith("http")
                            ? doctor.profile_image
                            : `http://127.0.0.1:8000${doctor.profile_image}`
                        }
                        alt="doctor"
                        style={styles.avatarImg}
                      />
                    ) : (
                      <span style={{ fontSize: isMobile ? "32px" : "40px" }}>👤</span>
                    )}
                  </div>

                  <h4
                    style={{
                      ...styles.doctorName,
                      fontSize: isMobile ? "17px" : "18px"
                    }}
                  >
                    دکتر {doctor.user?.first_name || doctor.first_name || "نامشخص"}{" "}
                    {doctor.user?.last_name || doctor.last_name || ""}
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

            {/* کنترلرهای صفحه‌بندی */}
            {doctors.length > doctorsPerPage && (
              <div style={styles.paginationWrapper}>
                <button
                  style={{
                    ...styles.paginationBtn,
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer"
                  }}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  قبلی
                </button>

                <div style={styles.pageInfo}>
                  صفحه {currentPage} از {totalPages}
                </div>

                <button
                  style={{
                    ...styles.paginationBtn,
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                  }}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  بعدی
                </button>
              </div>
            )}
          </>
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
    fontFamily: "Tahoma, Arial",
    paddingBottom: "40px"
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
    fontWeight: "500",
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
    boxSizing: "border-box",
    outline: "none",
    boxShadow: "0 4px 10px rgba(0,0,0,0.02)"
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
    backdropFilter: "blur(5px)",
    border: "1px solid #fff",
    transition: "0.3s"
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

  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },

  doctorName: {
    color: "#004d40",
    fontSize: "18px",
    margin: "10px 0 5px 0"
  },

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
    fontWeight: "bold",
    transition: "0.3s"
  },

  // استایل‌های صفحه‌بندی
  paginationWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "36px",
    flexWrap: "wrap"
  },

  paginationBtn: {
    backgroundColor: "#007080",
    color: "#fff",
    border: "none",
    padding: "10px 22px",
    borderRadius: "12px",
    fontWeight: "bold",
    transition: "0.2s"
  },

  pageInfo: {
    color: "#004d40",
    fontWeight: "bold",
    fontSize: "16px"
  }
};

export default DoctorsList;
