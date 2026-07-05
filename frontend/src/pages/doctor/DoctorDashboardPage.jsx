import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };
  

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
        console.error("خطا در دریافت پروفایل دکتر:", error);
  
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
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
        console.error("خطا در دریافت نوبت‌ها:", error);
  
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
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
      {/* نوار بالا */}
      <nav style={styles.navbar}>
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
      </nav>

      <div style={styles.container}>
        {/* هدر */}
        <div style={styles.headerCard}>
          <h1 style={styles.title}>
            {doctor
              ? `دکتر ${doctor.first_name} ${doctor.last_name}، خوش آمدید 👋`
              : 'داشبورد پزشک'}
          </h1>
          <p style={styles.subtitle}>
            مدیریت نوبت‌ها، مشاهده پروفایل و پیگیری برنامه روزانه
          </p>
        </div>

        {/* جداکننده */}
        <div style={styles.sectionDivider}>
          <div style={styles.line}></div>
          <h2 style={styles.sectionTitle}>پنل مدیریت پزشک</h2>
          <div style={styles.line}></div>
        </div>

        <div style={styles.grid}>
          {/* کارت پروفایل */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>👨‍⚕️ اطلاعات پزشک</h3>

            {loadingProfile ? (
              <p style={styles.loadingText}>در حال بارگذاری اطلاعات پزشک... ⏳</p>
            ) : doctor ? (
              <>
                <div style={styles.avatarWrapper}>
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
                    <div style={styles.defaultAvatar}>👤</div>
                  )}
                </div>

                <h3 style={styles.doctorName}>
                  دکتر {doctor.first_name} {doctor.last_name}
                </h3>

                <p style={styles.specialty}>
                  {doctor.specialty || 'متخصص عمومی'}
                </p>

                <p style={styles.bio}>
                  {doctor.bio || 'توضیحاتی برای این پزشک ثبت نشده است.'}
                </p>


                <button
                  style={styles.primaryBtn}
                  onClick={() => navigate('/doctor-profile')}
                >
                  ویرایش پروفایل
                </button>
              </>
            ) : (
              <div style={styles.emptyState}>
                <p>اطلاعات پزشک یافت نشد.</p>
              </div>
            )}
          </div>

          {/* کارت نوبت‌های امروز */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📅 نوبت‌های امروز</h3>

            {loadingAppointments ? (
              <p style={styles.loadingText}>در حال بارگذاری نوبت‌ها... ⏳</p>
            ) : todayAppointments.length > 0 ? (
              <div style={styles.appointmentsList}>
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} style={styles.appointmentItem}>
                    <div style={styles.appointmentRight}>
                      <span style={styles.timeIcon}>🕒</span>
                      <span style={styles.timeText}>
                        {appointment.appointment_time?.slice(0, 5)}
                      </span>
                    </div>

                    <div style={styles.appointmentLeft}>
                      <span style={styles.patientName}>{appointment.patient_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p>برای امروز نوبتی ثبت نشده است.</p>
              </div>
            )}

            <button
              style={styles.secondaryBtn}
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
    direction: 'rtl',
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
    zIndex: 1000,
  },

  logo: {
    fontWeight: 'bold',
    fontSize: '22px',
    color: '#007080',
    display: 'flex',
    alignItems: 'center',
  },

  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },

  link: {
    cursor: 'pointer',
    color: '#555',
    fontWeight: '500',
  },

  activeLink: {
    color: '#00897b',
    fontWeight: 'bold',
    borderBottom: '2px solid #00897b',
    paddingBottom: '5px',
    cursor: 'default',
  },

  logoutBtn: {
    backgroundColor: '#e53935',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(229,57,53,0.2)',
  },

  container: {
    maxWidth: '1100px',
    margin: '40px auto',
    padding: '0 20px',
  },

  headerCard: {
    textAlign: 'center',
    marginBottom: '50px',
  },

  title: {
    color: '#007080',
    fontSize: '32px',
    marginBottom: '10px',
  },

  subtitle: {
    color: '#607d8b',
    fontSize: '16px',
  },

  sectionDivider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '35px',
  },

  line: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(to left, transparent, #00897b, transparent)',
  },

  sectionTitle: {
    color: '#00897b',
    fontSize: '20px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px',
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '25px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 10px 20px rgba(0,0,0,0.04)',
    border: '1px solid rgba(255,255,255,0.5)',
    backdropFilter: 'blur(8px)',
  },

  cardTitle: {
    color: '#00695c',
    borderBottom: '1px solid #e0f2f1',
    paddingBottom: '15px',
    marginTop: 0,
    marginBottom: '20px',
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
    justifyContent: 'center',
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  defaultAvatar: {
    fontSize: '42px',
    color: '#fff',
    backgroundColor: '#d0e1fd',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  doctorName: {
    color: '#00695c',
    fontSize: '22px',
    margin: '0 0 8px 0',
  },

  specialty: {
    color: '#00acc1',
    fontSize: '15px',
    marginBottom: '15px',
    fontWeight: 'bold',
  },

  bio: {
    color: '#546e7a',
    lineHeight: '2',
    fontSize: '14px',
    marginBottom: '15px',
  },

  email: {
    color: '#455a64',
    marginBottom: '20px',
    fontSize: '14px',
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
    boxShadow: '0 4px 10px rgba(0,137,123,0.2)',
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
    marginTop: '25px',
  },

  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
  },

  appointmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8ffff',
    border: '1px solid #d7f0ec',
    borderRadius: '14px',
    padding: '14px 16px',
  },

  appointmentRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  appointmentLeft: {
    display: 'flex',
    alignItems: 'center',
  },

  timeIcon: {
    fontSize: '18px',
  },

  timeText: {
    color: '#00695c',
    fontWeight: 'bold',
  },

  patientName: {
    color: '#455a64',
    fontWeight: '500',
  },

  loadingText: {
    color: '#607d8b',
    marginTop: '30px',
  },

  emptyState: {
    textAlign: 'center',
    padding: '30px 10px',
    color: '#607d8b',
  },
};

export default DoctorDashboard;
