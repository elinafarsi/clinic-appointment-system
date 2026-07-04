import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; 

function PatientDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

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
  

  return (
    <div style={styles.pageBackground}>
      
      <nav style={styles.navbar}>
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
      </nav>

      <div style={styles.mainContainer}>
        
        <div style={styles.welcomeCard}>
          <div style={{ textAlign: 'right' }}>
            <h1 style={styles.welcomeTitle}>
              {patient ? `${patient.first_name} ${patient.last_name}` : "کاربر گرامی"}، خوش آمدید 👋
            </h1>
            <p style={styles.welcomeSubtitle}>امروز چطور می‌توانیم به سلامتی شما کمک کنیم؟</p>
          </div>
          <div style={styles.welcomeIcon}>🩺</div>
        </div>

        <div style={styles.grid2}>
          <div style={styles.actionCardPrimary} onClick={() => navigate('/doctors-list')}>
            <div style={styles.actionIcon}>📅</div>
            <h2 style={styles.actionText}>رزرو نوبت جدید</h2>
            <p style={styles.actionSubtext}>جستجوی بهترین پزشکان متخصص</p>
          </div>
          
          <div style={styles.actionCardSecondary} onClick={() => navigate('/patient-appointments')}>
            <div style={styles.actionIcon}>📋</div>
            <h2 style={styles.actionText}>سوابق پزشکی من</h2>
            <p style={styles.actionSubtext}>مشاهده نوبت‌ها و نسخه‌ها</p>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>پزشکان پیشنهادی برای شما</h3>
          <div style={styles.sectionLine}></div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#007080' }}>در حال بارگذاری پزشکان...</p>
        ) : (
          <div style={styles.grid3}>
            {doctors.map((doctor) => (
              <div key={doctor.id} style={styles.doctorCard}>
                <div style={styles.avatarWrapper}>
                  {doctor.profile_image ? (
                    <img src={doctor.profile_image} alt="doctor" style={styles.avatarImg} />
                  ) : (
                    <span style={{fontSize: '40px'}}>👤</span>
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
    padding: '15px 60px',
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

  link: {
    cursor: 'pointer',
    color: '#555',
    fontWeight: '500',
    transition: '0.3s'
  },

  activeLink: {
    color: '#00897b',
    fontWeight: 'bold',
    borderBottom: '3px solid #00897b',
    paddingBottom: '5px'
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
    transition: '0.3s'
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
  sectionLine: { width: '60px', height: '4px', background: '#00acc1', margin: '10px auto', borderRadius: '10px' },

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
