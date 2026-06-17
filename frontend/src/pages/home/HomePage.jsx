import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';

function FirstPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={styles.pageBackground}>
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <span style={{ fontSize: '26px', marginLeft: '10px' }}>⛑️</span>
          کلینیک نوبت‌دهی آنلاین
        </div>
        <button style={styles.loginBtn} onClick={() => navigate('/login')}>ورود / ثبت‌نام</button>
      </nav>

      <div style={styles.container}>
        <div style={styles.headerCard}>
          <h1 style={styles.title}>بهترین متخصصان در خدمت شما</h1>
          <p style={styles.subtitle}>به راحتی و آنلاین، از مجرب‌ترین پزشکان نوبت بگیرید 🩺</p>
        </div>

        <div style={styles.sectionDivider}>
          <div style={styles.line}></div>
          <h2 style={styles.sectionTitle}>لیست پزشکان متخصص</h2>
          <div style={styles.line}></div>
        </div>

        {loading ? (
          <div style={styles.loader}>در حال بارگذاری پزشکان... ⏳</div>
        ) : (
          <div style={styles.grid}>
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div key={doctor.id} style={styles.doctorCard}>
                  <div style={styles.avatarWrapper}>
                    {doctor.profile_image ? (
                      <img
                        src={doctor.profile_image.startsWith('http') ? doctor.profile_image : `http://127.0.0.1:8000${doctor.profile_image}`}
                        alt="Doctor"
                        style={styles.avatarImg}
                      />
                    ) : (
                      <div style={styles.defaultAvatar}>👤</div>
                    )}
                  </div>

                  <h3 style={styles.doctorName}>
                    دکتر {doctor.user?.first_name || doctor.first_name || 'نامشخص'} {doctor.user?.last_name || doctor.last_name || ''}
                  </h3>

                  <p style={styles.specialty}>
                    {doctor.specialty || 'متخصص عمومی'}
                  </p>

                  <button
                    style={styles.viewBtn}
                    onClick={() => navigate(`login`)}
                  >
                    رزرو نوبت و مشاهده پروفایل
                  </button>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <p>پزشکی یافت نشد.</p>
              </div>
            )}
          </div>
        )}
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 60px', backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)',
    position: 'sticky', top: 0, zIndex: 1000
  },
  logo: { fontWeight: 'bold', fontSize: '22px', color: '#007080', display: 'flex', alignItems: 'center' },
  loginBtn: {
    backgroundColor: '#00897b', color: '#fff', border: 'none', padding: '10px 25px',
    borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,137,123,0.2)'
  },
  container: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px' },
  headerCard: { textAlign: 'center', marginBottom: '60px' },
  title: { color: '#007080', fontSize: '32px', marginBottom: '10px' },
  subtitle: { color: '#607d8b', fontSize: '16px' },

  // استایل‌های بخش جداکننده جدید
  sectionDivider: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '20px', marginBottom: '40px'
  },
  line: { flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #00897b, transparent)' },
  sectionTitle: { color: '#00897b', fontSize: '20px', fontWeight: 'bold', whiteSpace: 'nowrap' },

  // --- استایل‌های جدید برای نمایش پزشکان (مشابه PatientDashboard) ---
  grid: {
    display: 'grid',
    // این خط باعث میشه کارت‌ها در اندازه‌های مختلف صفحه به خوبی چیده بشن
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

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  defaultAvatar: {
    fontSize: '40px', 
    color: '#007080'   
  },

  doctorName: {
    color: '#004d40',
    fontSize: '18px',
    margin: '10px 0 5px 0'
  },

  specialty: {
    color: '#00acc1',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '15px'
  },

  viewBtn: {
    backgroundColor: '#007080',
    color: '#fff',
    border: 'none',
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  },

  loader: { textAlign: 'center', marginTop: '100px', fontSize: '18px', color: '#007080' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#607d8b' }
};

export default FirstPage;
