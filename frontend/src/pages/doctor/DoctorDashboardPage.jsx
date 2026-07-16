import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
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

    const fetchDoctorProfile = async () => {
      try {
        const res = await api.get('accounts/doctor/me/');
        setDoctor(res.data);
      } catch (error) {
        console.error('خطا در دریافت پروفایل دکتر:', error);

        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchAppointments = async () => {
      try {
        const res = await api.get('appointments/appointments/');
        const data = res.data.results ? res.data.results : res.data;
        setAppointments(data);
      } catch (error) {
        console.error('خطا در دریافت نوبت‌ها:', error);

        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        }
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchDoctorProfile();
    fetchAppointments();
  }, [navigate]);

  const today = new Date().toISOString().split('T')[0];

  const todayAppointments = appointments.filter(
    (appt) => appt.appointment_date === today
  );

  return (
    <div style={styles.pageBackground}>
      <nav
        style={
          isMobile
            ? {
                ...styles.navbar,
                padding: isSmallMobile ? '8px 10px' : '10px 16px'
              }
            : styles.navbar
        }
      >
        {!isMobile ? (
          <>
            <div style={styles.logo}>
              <span style={{ fontSize: '26px', marginLeft: '10px' }}>⛑️</span>
              کلینیک نوبت‌دهی آنلاین
            </div>

            <div style={styles.navLinks}>
              <span style={styles.activeLink}>داشبورد</span>
              <span style={styles.link} onClick={() => navigate('/doctor-appointments')}>
                نوبت‌ها
              </span>
              <span style={styles.link} onClick={() => navigate('/doctor-profile')}>
                پروفایل
              </span>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                خروج
              </button>
            </div>
          </>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                <span style={{ fontSize: isSmallMobile ? 18 : 22, marginLeft: 8 }}>⛑️</span>
                کلینیک نوبت‌دهی آنلاین
              </div>

              <button
                style={{
                  ...styles.logoutBtn,
                  padding: isSmallMobile ? '6px 10px' : '8px 14px',
                  fontSize: isSmallMobile ? '12px' : '13px',
                  borderRadius: isSmallMobile ? '8px' : '12px',
                  flexShrink: 0
                }}
                onClick={handleLogout}
              >
                خروج
              </button>
            </div>

            <div
              style={{
                ...styles.navLinksRow,
                gap: isSmallMobile ? '8px' : '12px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              <span
                style={{ ...styles.activeLink, fontSize: isSmallMobile ? '12px' : '13px' }}
              >
                داشبورد
              </span>

              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? '12px' : '13px' }}
                onClick={() => navigate('/doctor-appointments')}
              >
                نوبت‌ها
              </span>

              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? '12px' : '13px' }}
                onClick={() => navigate('/doctor-profile')}
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
          margin: isMobile ? '24px auto' : '40px auto',
          padding: isMobile ? '0 14px' : '0 20px'
        }}
      >
        <div
          style={{
            ...styles.headerCard,
            marginBottom: isMobile ? '26px' : '50px'
          }}
        >
          <h1
            style={{
              ...styles.title,
              fontSize: isSmallMobile ? '22px' : isMobile ? '26px' : '32px',
              lineHeight: isMobile ? '1.8' : 'normal',
              marginBottom: isMobile ? '8px' : '10px'
            }}
          >
            {doctor
              ? `دکتر ${doctor.first_name} ${doctor.last_name}، خوش آمدید 👋`
              : 'داشبورد پزشک'}
          </h1>

          <p
            style={{
              ...styles.subtitle,
              fontSize: isSmallMobile ? '13px' : isMobile ? '14px' : '16px',
              lineHeight: isMobile ? '1.9' : 'normal'
            }}
          >
            مدیریت نوبت‌ها، مشاهده پروفایل و پیگیری برنامه روزانه
          </p>
        </div>

        <div
          style={{
            ...styles.sectionDivider,
            gap: isMobile ? '10px' : '20px',
            marginBottom: isMobile ? '20px' : '35px'
          }}
        >
          <div style={styles.line}></div>
          <h2
            style={{
              ...styles.sectionTitle,
              fontSize: isSmallMobile ? '15px' : isMobile ? '17px' : '20px'
            }}
          >
            پنل مدیریت پزشک
          </h2>
          <div style={styles.line}></div>
        </div>

        <div
          style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '16px' : '25px'
          }}
        >
          <div
            style={{
              ...styles.card,
              padding: isSmallMobile ? '18px 14px' : isMobile ? '22px 16px' : '30px',
              borderRadius: isMobile ? '18px' : '25px'
            }}
          >
            <h3
              style={{
                ...styles.cardTitle,
                fontSize: isSmallMobile ? '16px' : isMobile ? '17px' : '20px',
                paddingBottom: isMobile ? '12px' : '15px',
                marginBottom: isMobile ? '16px' : '20px'
              }}
            >
              👨‍⚕️ اطلاعات پزشک
            </h3>

            {loadingProfile ? (
              <p style={{ ...styles.loadingText, fontSize: isMobile ? '13px' : '16px' }}>
                در حال بارگذاری اطلاعات پزشک... ⏳
              </p>
            ) : doctor ? (
              <>
                <div
                  style={{
                    ...styles.avatarWrapper,
                    width: isMobile ? '90px' : '110px',
                    height: isMobile ? '90px' : '110px',
                    margin: isMobile ? '0 auto 16px auto' : '0 auto 20px auto'
                  }}
                >
                  {doctor.profile_image ? (
                    <img
                      src={
                        doctor.profile_image.startsWith('http')
                          ? doctor.profile_image
                          : `http://127.0.0.1:8000${doctor.profile_image}`
                      }
                      alt={doctor.first_name}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <div
                      style={{
                        ...styles.defaultAvatar,
                        fontSize: isMobile ? '34px' : '42px'
                      }}
                    >
                      👤
                    </div>
                  )}
                </div>

                <h3
                  style={{
                    ...styles.doctorName,
                    fontSize: isSmallMobile ? '18px' : isMobile ? '20px' : '22px'
                  }}
                >
                  دکتر {doctor.first_name} {doctor.last_name}
                </h3>

                <p
                  style={{
                    ...styles.specialty,
                    fontSize: isSmallMobile ? '13px' : isMobile ? '14px' : '15px',
                    marginBottom: isMobile ? '12px' : '15px'
                  }}
                >
                  {doctor.specialty || 'متخصص عمومی'}
                </p>

                <p
                  style={{
                    ...styles.bio,
                    fontSize: isSmallMobile ? '13px' : isMobile ? '13.5px' : '14px',
                    lineHeight: isMobile ? '1.9' : '2',
                    marginBottom: isMobile ? '14px' : '15px'
                  }}
                >
                  {doctor.bio || 'توضیحاتی برای این پزشک ثبت نشده است.'}
                </p>

                <button
                  style={{
                    ...styles.primaryBtn,
                    padding: isMobile ? '11px' : '12px',
                    fontSize: isMobile ? '14px' : '15px',
                    borderRadius: isMobile ? '10px' : '12px'
                  }}
                  onClick={() => navigate('/doctor-profile')}
                >
                  ویرایش پروفایل
                </button>
              </>
            ) : (
              <div style={{ ...styles.emptyState, padding: isMobile ? '20px 10px' : '30px 10px' }}>
                <p>اطلاعات پزشک یافت نشد.</p>
              </div>
            )}
          </div>

          <div
            style={{
              ...styles.card,
              padding: isSmallMobile ? '18px 14px' : isMobile ? '22px 16px' : '30px',
              borderRadius: isMobile ? '18px' : '25px'
            }}
          >
            <h3
              style={{
                ...styles.cardTitle,
                fontSize: isSmallMobile ? '16px' : isMobile ? '17px' : '20px',
                paddingBottom: isMobile ? '12px' : '15px',
                marginBottom: isMobile ? '16px' : '20px'
              }}
            >
              📅 نوبت‌های امروز
            </h3>

            {loadingAppointments ? (
              <p style={{ ...styles.loadingText, fontSize: isMobile ? '13px' : '16px' }}>
                در حال بارگذاری نوبت‌ها... ⏳
              </p>
            ) : todayAppointments.length > 0 ? (
              <div
                style={{
                  ...styles.appointmentsList,
                  gap: isMobile ? '10px' : '15px',
                  marginTop: isMobile ? '14px' : '20px'
                }}
              >
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    style={{
                      ...styles.appointmentItem,
                      flexDirection: isSmallMobile ? 'column' : 'row',
                      alignItems: isSmallMobile ? 'stretch' : 'center',
                      gap: isSmallMobile ? '8px' : '0',
                      padding: isMobile ? '12px 14px' : '14px 16px',
                      borderRadius: isMobile ? '12px' : '14px'
                    }}
                  >
                    <div
                      style={{
                        ...styles.appointmentRight,
                        justifyContent: isSmallMobile ? 'center' : 'flex-start'
                      }}
                    >
                      <span style={{ ...styles.timeIcon, fontSize: isMobile ? '16px' : '18px' }}>
                        🕒
                      </span>
                      <span
                        style={{
                          ...styles.timeText,
                          fontSize: isMobile ? '14px' : '16px'
                        }}
                      >
                        {appointment.appointment_time?.slice(0, 5)}
                      </span>
                    </div>

                    <div
                      style={{
                        ...styles.appointmentLeft,
                        justifyContent: isSmallMobile ? 'center' : 'flex-start'
                      }}
                    >
                      <span
                        style={{
                          ...styles.patientName,
                          fontSize: isMobile ? '13px' : '15px',
                          textAlign: isSmallMobile ? 'center' : 'right'
                        }}
                      >
                        {appointment.patient_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...styles.emptyState, padding: isMobile ? '20px 10px' : '30px 10px' }}>
                <p>برای امروز نوبتی ثبت نشده است.</p>
              </div>
            )}

            <button
              style={{
                ...styles.secondaryBtn,
                padding: isMobile ? '11px' : '12px',
                fontSize: isMobile ? '14px' : '15px',
                borderRadius: isMobile ? '10px' : '12px',
                marginTop: isMobile ? '18px' : '25px'
              }}
              onClick={() => navigate('/doctor-appointments')}
            >
              مشاهده همه نوبت‌ها
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    minHeight: '100vh',
    background: 'radial-gradient(circle, #f0f9ff 0%, #cbebff 100%)',
    direction: 'rtl'
  },

  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 60px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
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
    alignItems: 'center',
    minWidth: 0
  },

  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },

  navTopRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px'
  },

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
    whiteSpace: 'nowrap'
  },

  activeLink: {
    color: '#00897b',
    fontWeight: 'bold',
    borderBottom: '2px solid #00897b',
    paddingBottom: '5px',
    cursor: 'default',
    whiteSpace: 'nowrap'
  },

  logoutBtn: {
    backgroundColor: '#e53935',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(229,57,53,0.2)'
  },

  container: {
    maxWidth: '1100px',
    margin: '40px auto',
    padding: '0 20px'
  },

  headerCard: {
    textAlign: 'center',
    marginBottom: '50px'
  },

  title: {
    color: '#007080',
    fontSize: '32px',
    marginBottom: '10px'
  },

  subtitle: {
    color: '#607d8b',
    fontSize: '16px'
  },

  sectionDivider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '35px'
  },

  line: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(to left, transparent, #00897b, transparent)'
  },

  sectionTitle: {
    color: '#00897b',
    fontSize: '20px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px'
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '25px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 20px rgba(0,0,0,0.04)',
    border: '1px solid rgba(255,255,255,0.5)',
    backdropFilter: 'blur(8px)'
  },

  cardTitle: {
    color: '#00695c',
    borderBottom: '1px solid #e0f2f1',
    paddingBottom: '15px',
    marginTop: 0,
    marginBottom: '20px'
  },

  avatarWrapper: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    margin: '0 auto 20px auto',
    overflow: 'hidden',
    border: '3px solid #b2dfdb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  defaultAvatar: {
    fontSize: '42px',
    color: '#fff',
    backgroundColor: '#d0e1fd',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  doctorName: {
    color: '#00695c',
    fontSize: '22px',
    margin: '0 0 8px 0'
  },

  specialty: {
    color: '#00acc1',
    fontSize: '15px',
    marginBottom: '15px',
    fontWeight: 'bold'
  },

  bio: {
    color: '#546e7a',
    lineHeight: '2',
    fontSize: '14px',
    marginBottom: '15px'
  },

  primaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#00897b',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,137,123,0.2)'
  },

  secondaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#00897b',
    border: '2px solid #00897b',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '25px'
  },

  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px'
  },

  appointmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8ffff',
    border: '1px solid #d7f0ec',
    borderRadius: '14px',
    padding: '14px 16px'
  },

  appointmentRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  appointmentLeft: {
    display: 'flex',
    alignItems: 'center'
  },

  timeIcon: {
    fontSize: '18px'
  },

  timeText: {
    color: '#00695c',
    fontWeight: 'bold'
  },

  patientName: {
    color: '#455a64',
    fontWeight: '500'
  },

  loadingText: {
    color: '#607d8b',
    marginTop: '30px'
  },

  emptyState: {
    textAlign: 'center',
    padding: '30px 10px',
    color: '#607d8b'
  }
};

export default DoctorDashboard;
