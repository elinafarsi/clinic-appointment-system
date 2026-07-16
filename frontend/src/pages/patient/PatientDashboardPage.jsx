import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function PatientDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDoctors = async () => {
      try {
        const response = await api.get('accounts/doctors/');
        setDoctors(response.data.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error("خطا در دریافت لیست پزشکان:", error);
        setLoading(false);
      }
    };

    const fetchPatient = async () => {
      try {
        const res = await api.get('accounts/me/');
        setPatient(res.data);
      } catch (error) {
        console.error("خطا در دریافت پروفایل:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate('/login');
        }
      }
    };

    fetchDoctors();
    fetchPatient();
  }, [navigate]);

  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;

  return (
    <div style={styles.pageBackground}>
      <nav
        style={{
          ...styles.navbar,
          padding: isSmallMobile ? '8px 10px' : isMobile ? '10px 16px' : '15px 60px'
        }}
      >
        {/* DESKTOP: یک ردیف (مثل قبل) */}
        {!isMobile && (
          <>
            <div style={styles.logo}>
              <span style={{ fontSize: '28px', marginLeft: '10px' }}>⛑️</span>
              کلینیک نوبت‌دهی آنلاین
            </div>

            <div style={styles.navLinks}>
              <span style={styles.activeLink}>داشبورد</span>
              <span style={styles.link} onClick={() => navigate('/doctors-list')}>پزشکان</span>
              <span style={styles.link} onClick={() => navigate('/patient-appointments')}>نوبت‌های من</span>
              <span style={styles.link} onClick={() => navigate('/patient-profile')}>پروفایل</span>

              <button style={styles.logoutBtn} onClick={handleLogout}>خروج</button>
            </div>
          </>
        )}

        {/* MOBILE/TABLET: دو ردیف فشرده */}
        {isMobile && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Row 1: Logo + Logout */}
            <div style={styles.navTopRow}>
              <div
                style={{
                  ...styles.logo,
                  fontSize: isSmallMobile ? '14px' : '16px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0
                }}
                title="کلینیک نوبت‌دهی آنلاین"
              >
                <span style={{ fontSize: isSmallMobile ? '18px' : '22px', marginLeft: '8px' }}>⛑️</span>
                کلینیک نوبت‌دهی آنلاین
              </div>

              <button
                style={{
                  ...styles.logoutBtn,
                  padding: isSmallMobile ? '6px 10px' : '8px 14px',
                  fontSize: isSmallMobile ? '12px' : '13px',
                  borderRadius: isSmallMobile ? '8px' : '12px'
                }}
                onClick={handleLogout}
              >
                خروج
              </button>
            </div>

            {/* Row 2: Links */}
            <div
              style={{
                ...styles.navLinksRow,
                gap: isSmallMobile ? '8px' : '12px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <span
                style={{
                  ...styles.activeLink,
                  fontSize: isSmallMobile ? '12px' : '13px',
                  paddingBottom: isSmallMobile ? '2px' : '4px',
                  borderBottomWidth: isSmallMobile ? '2px' : '3px'
                }}
              >
                داشبورد
              </span>

              <span style={{ ...styles.link, fontSize: isSmallMobile ? '12px' : '13px' }}
                onClick={() => navigate('/doctors-list')}
              >
                پزشکان
              </span>

              <span style={{ ...styles.link, fontSize: isSmallMobile ? '12px' : '13px' }}
                onClick={() => navigate('/patient-appointments')}
              >
                نوبت‌های من
              </span>

              <span style={{ ...styles.link, fontSize: isSmallMobile ? '12px' : '13px' }}
                onClick={() => navigate('/patient-profile')}
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
          margin: isMobile ? '25px auto' : '40px auto',
          padding: isMobile ? '0 14px' : '0 20px'
        }}
      >
        <div
          style={{
            ...styles.welcomeCard,
            padding: isMobile ? '25px' : '40px',
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'right',
            gap: isMobile ? '15px' : '0'
          }}
        >
          <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
            <h1
              style={{
                ...styles.welcomeTitle,
                fontSize: isSmallMobile ? '22px' : isMobile ? '26px' : '32px'
              }}
            >
              {patient ? `${patient.first_name} ${patient.last_name}` : "کاربر گرامی"}، خوش آمدید 👋
            </h1>
            <p
              style={{
                ...styles.welcomeSubtitle,
                fontSize: isSmallMobile ? '14px' : isMobile ? '16px' : '18px'
              }}
            >
              امروز چطور می‌توانیم به سلامتی شما کمک کنیم؟
            </p>
          </div>
          <div style={{ ...styles.welcomeIcon, fontSize: isMobile ? '52px' : '70px' }}>🩺</div>
        </div>

        <div
          style={{
            ...styles.grid2,
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '18px' : '25px',
            marginBottom: isMobile ? '35px' : '50px'
          }}
        >
          <div style={styles.actionCardPrimary} onClick={() => navigate('/doctors-list')}>
            <div style={{ ...styles.actionIcon, fontSize: isMobile ? '45px' : '55px' }}>📅</div>
            <h2 style={{ ...styles.actionText, fontSize: isMobile ? '20px' : '22px' }}>رزرو نوبت جدید</h2>
            <p style={styles.actionSubtext}>جستجوی بهترین پزشکان متخصص</p>
          </div>

          <div style={styles.actionCardSecondary} onClick={() => navigate('/patient-appointments')}>
            <div style={{ ...styles.actionIcon, fontSize: isMobile ? '45px' : '55px' }}>📋</div>
            <h2 style={{ ...styles.actionText, fontSize: isMobile ? '20px' : '22px' }}>سوابق پزشکی من</h2>
            <p style={styles.actionSubtext}>مشاهده نوبت‌ها و نسخه‌ها</p>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <h3 style={{ ...styles.sectionTitle, fontSize: isMobile ? '20px' : '22px' }}>
            پزشکان پیشنهادی برای شما
          </h3>
          <div style={styles.sectionLine}></div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#007080' }}>در حال بارگذاری پزشکان...</p>
        ) : (
          <div
            style={{
              ...styles.grid3,
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))'
            }}
          >
            {doctors.map((doctor) => (
              <div key={doctor.id} style={styles.doctorCard}>
                <div style={styles.avatarWrapper}>
                  {doctor.profile_image ? (
                    <img src={doctor.profile_image} alt="doctor" style={styles.avatarImg} />
                  ) : (
                    <span style={{ fontSize: isMobile ? '32px' : '40px' }}>👤</span>
                  )}
                </div>

                <h4 style={styles.doctorName}>
                  دکتر {doctor.first_name} {doctor.last_name}
                </h4>

                <p style={styles.doctorSpecialty}>
                  {doctor.specialty || 'متخصص عمومی'}
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
    background: 'radial-gradient(circle at top right, #f0f9ff, #cbebff, #f0faff)',
    minHeight: '100vh',
    direction: 'rtl',
    fontFamily: 'Tahoma, Arial, sans-serif'
  },

  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },

  logo: {
    fontWeight: 'bold',
    fontSize: '22px',
    color: '#007080',
    display: 'flex',
    alignItems: 'center'
  },

  navLinks: {
    display: 'flex',
    gap: '25px',
    alignItems: 'center'
  },

  // موبایل: ردیف بالا
  navTopRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px'
  },

  // موبایل: ردیف لینک‌ها
  navLinksRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },

  link: {
    cursor: 'pointer',
    color: '#555',
    fontWeight: '500',
    transition: '0.3s',
    whiteSpace: 'nowrap'
  },

  activeLink: {
    color: '#00897b',
    fontWeight: 'bold',
    borderBottom: '3px solid #00897b',
    paddingBottom: '5px',
    whiteSpace: 'nowrap'
  },

  logoutBtn: {
    backgroundColor: '#e53935',
    color: '#fff',
    border: 'none',
    padding: '10px 22px',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(229,57,53,0.2)',
    transition: '0.3s',
    whiteSpace: 'nowrap',
    flexShrink: 0
  },

  mainContainer: {
    maxWidth: '1100px',
    margin: '40px auto',
    padding: '0 20px'
  },

  welcomeCard: {
    background: 'linear-gradient(135deg, #007080 0%, #00acc1 100%)',
    borderRadius: '24px',
    padding: '40px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 15px 35px rgba(0,112,128,0.2)',
    color: '#fff'
  },

  welcomeTitle: { margin: 0, fontSize: '32px', fontWeight: 'bold' },
  welcomeSubtitle: { opacity: 0.9, fontSize: '18px', marginTop: '10px' },
  welcomeIcon: { fontSize: '70px', opacity: 0.8 },

  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px',
    marginBottom: '50px'
  },

  actionCardPrimary: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    padding: '35px',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 20px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,172,193,0.1)'
  },

  actionCardSecondary: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    padding: '35px',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 20px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,137,123,0.1)'
  },

  actionIcon: { fontSize: '55px', marginBottom: '15px' },
  actionText: { color: '#007080', fontSize: '22px', margin: '0' },
  actionSubtext: { color: '#888', marginTop: '8px' },

  sectionHeader: { textAlign: 'center', marginBottom: '30px' },
  sectionTitle: { color: '#444', fontSize: '22px', margin: 0 },
  sectionLine: {
    width: '60px',
    height: '4px',
    background: '#00acc1',
    margin: '10px auto',
    borderRadius: '10px'
  },

  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px'
  },

  doctorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '22px',
    textAlign: 'center',
    padding: '25px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
    backdropFilter: 'blur(5px)',
    border: '1px solid #fff',
    transition: '0.3s'
  },

  avatarWrapper: {
    width: '100px',
    height: '100px',
    background: '#fff',
    borderRadius: '50%',
    margin: '0 auto 15px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    border: '3px solid #e0f2f1'
  },

  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  doctorName: { color: '#004d40', fontSize: '18px', margin: '10px 0 5px 0' },
  doctorSpecialty: { color: '#00acc1', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px' },

  viewProfileBtn: {
    backgroundColor: '#007080',
    color: '#fff',
    border: 'none',
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  }
};

export default PatientDashboard;
