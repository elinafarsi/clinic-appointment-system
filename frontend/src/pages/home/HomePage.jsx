import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';

function FirstPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenSize, setScreenSize] = useState({
    isMobile: window.innerWidth <= 576,
    isTablet: window.innerWidth > 576 && window.innerWidth <= 992,
  });

  useEffect(() => {
    api.get('accounts/doctors/')
      .then(response => {
        const data = response.data.results ? response.data.results : response.data;
        setDoctors(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("ریحانه، خطایی رخ داده:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        isMobile: window.innerWidth <= 576,
        isTablet: window.innerWidth > 576 && window.innerWidth <= 992,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const dynamicStyles = getResponsiveStyles(screenSize);

  return (
    <div style={dynamicStyles.pageBackground}>
      <nav style={dynamicStyles.navbar}>
        <div style={dynamicStyles.logo}>
          <span style={{ fontSize: dynamicStyles.logoIconSize, marginLeft: '10px' }}>⛑️</span>
          کلینیک نوبت‌دهی آنلاین
        </div>
        <button style={dynamicStyles.loginBtn} onClick={() => navigate('/login')}>
          ورود / ثبت‌نام
        </button>
      </nav>

      <div style={dynamicStyles.container}>
        <div style={dynamicStyles.headerCard}>
          <h1 style={dynamicStyles.title}>بهترین متخصصان در خدمت شما</h1>
          <p style={dynamicStyles.subtitle}>
            به راحتی و آنلاین، از مجرب‌ترین پزشکان نوبت بگیرید 🩺
          </p>
        </div>

        <div style={dynamicStyles.sectionDivider}>
          <div style={dynamicStyles.line}></div>
          <h2 style={dynamicStyles.sectionTitle}>لیست پزشکان متخصص</h2>
          <div style={dynamicStyles.line}></div>
        </div>

        {loading ? (
          <div style={dynamicStyles.loader}>در حال بارگذاری پزشکان... ⏳</div>
        ) : (
          <div style={dynamicStyles.grid}>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div key={doctor.id} style={dynamicStyles.doctorCard}>
                  <div style={dynamicStyles.avatarWrapper}>
                    {doctor.profile_image ? (
                      <img
                        src={
                          doctor.profile_image.startsWith('http')
                            ? doctor.profile_image
                            : `http://127.0.0.1:8000${doctor.profile_image}`
                        }
                        alt="Doctor"
                        style={dynamicStyles.avatarImg}
                      />
                    ) : (
                      <div style={dynamicStyles.defaultAvatar}>👤</div>
                    )}
                  </div>

                  <h3 style={dynamicStyles.doctorName}>
                    دکتر {doctor.user?.first_name || doctor.first_name || 'نامشخص'}{' '}
                    {doctor.user?.last_name || doctor.last_name || ''}
                  </h3>

                  <p style={dynamicStyles.specialty}>
                    {doctor.specialty || 'متخصص عمومی'}
                  </p>

                  <button
                    style={dynamicStyles.viewBtn}
                    onClick={() => navigate('/login')}
                  >
                    رزرو نوبت و مشاهده پروفایل
                  </button>
                </div>
              ))
            ) : (
              <div style={dynamicStyles.emptyState}>
                <p>پزشکی یافت نشد.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const baseStyles = {
  pageBackground: {
    minHeight: '100vh',
    background: 'radial-gradient(circle, #f0f9ff 0%, #cbebff 100%)',
    direction: 'rtl',
  },
  line: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(to left, transparent, #00897b, transparent)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};

function getResponsiveStyles({ isMobile, isTablet }) {
  return {
    ...baseStyles,

    logoIconSize: isMobile ? '22px' : '26px',

    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '12px' : '0',
      padding: isMobile ? '12px 16px' : isTablet ? '14px 30px' : '15px 60px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },

    logo: {
      fontWeight: 'bold',
      fontSize: isMobile ? '18px' : isTablet ? '20px' : '22px',
      color: '#007080',
      display: 'flex',
      alignItems: 'center',
      lineHeight: '1.5',
    },

    loginBtn: {
      backgroundColor: '#00897b',
      color: '#fff',
      border: 'none',
      padding: isMobile ? '10px 16px' : '10px 25px',
      borderRadius: '12px',
      fontWeight: 'bold',
      cursor: 'pointer',
      boxShadow: '0 4px 10px rgba(0,137,123,0.2)',
      width: isMobile ? '100%' : 'auto',
    },

    container: {
      maxWidth: '1100px',
      margin: isMobile ? '25px auto' : '40px auto',
      padding: isMobile ? '0 14px' : '0 20px',
    },

    headerCard: {
      textAlign: 'center',
      marginBottom: isMobile ? '35px' : '60px',
    },

    title: {
      color: '#007080',
      fontSize: isMobile ? '24px' : isTablet ? '28px' : '32px',
      marginBottom: '10px',
      lineHeight: '1.6',
    },

    subtitle: {
      color: '#607d8b',
      fontSize: isMobile ? '14px' : '16px',
      lineHeight: '1.8',
    },

    sectionDivider: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? '10px' : '20px',
      marginBottom: isMobile ? '25px' : '40px',
    },

    sectionTitle: {
      color: '#00897b',
      fontSize: isMobile ? '16px' : '20px',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    },

    grid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet
        ? 'repeat(2, 1fr)'
        : 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: isMobile ? '16px' : '25px',
    },

    doctorCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '22px',
      textAlign: 'center',
      padding: isMobile ? '18px' : '25px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.03)',
      backdropFilter: 'blur(5px)',
      border: '1px solid #fff',
      transition: '0.3s',
    },

    avatarWrapper: {
      width: isMobile ? '85px' : '100px',
      height: isMobile ? '85px' : '100px',
      background: '#fff',
      borderRadius: '50%',
      margin: '0 auto 15px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      border: '3px solid #e0f2f1',
    },

    defaultAvatar: {
      fontSize: isMobile ? '34px' : '40px',
      color: '#007080',
    },

    doctorName: {
      color: '#004d40',
      fontSize: isMobile ? '16px' : '18px',
      margin: '10px 0 5px 0',
      lineHeight: '1.6',
    },

    specialty: {
      color: '#00acc1',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: 'bold',
      marginBottom: '15px',
    },

    viewBtn: {
      backgroundColor: '#007080',
      color: '#fff',
      border: 'none',
      width: '100%',
      padding: isMobile ? '11px' : '12px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: '0.3s',
      fontSize: isMobile ? '14px' : '15px',
    },

    loader: {
      textAlign: 'center',
      marginTop: '100px',
      fontSize: isMobile ? '16px' : '18px',
      color: '#007080',
    },

    emptyState: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: isMobile ? '30px' : '60px',
      color: '#607d8b',
    },
  };
}

export default FirstPage;
