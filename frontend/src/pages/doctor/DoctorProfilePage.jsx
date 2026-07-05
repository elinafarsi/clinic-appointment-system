import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';

function DoctorProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    medical_license_number: '',
    specialty: '',
    bio: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };
  

  useEffect(() => {
    api.get('accounts/doctor/me/')
      .then(response => {
        const data = response.data;
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          medical_license_number: data.medical_license_number || 'درج نشده',
          specialty: data.specialty || '',
          bio: data.bio || '',
        });

        if (data.profile_image) {
          setProfileImage(
            data.profile_image.startsWith('http')
              ? data.profile_image
              : `http://127.0.0.1:8000${data.profile_image}`
          );
        }

        setLoading(false);
      })
      .catch(error => {
        console.error("خطا در دریافت مشخصات:", error);
        setMessage({ type: 'error', text: 'خطا در بارگذاری اطلاعات.' });
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('accounts/doctor/me/', formData);
      setMessage({ type: 'success', text: 'تغییرات با موفقیت ذخیره شد! 🎉' });
    } catch (error) {
      console.error("خطا در ذخیره:", error);
      setMessage({ type: 'error', text: 'خطا در ثبت تغییرات.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.pageBackground}>

      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <span style={{ fontSize: '26px', marginLeft: '10px' }}>⛑️</span>
          کلینیک نوبت‌دهی آنلاین
        </div>

        <div style={styles.navLinks}>
          <span style={styles.link} onClick={() => navigate('/doctor-dashboard')}>
            داشبورد
          </span>
          <span style={styles.link} onClick={() => navigate('/doctor-appointments')}>
            نوبت‌ها
          </span>
          <span style={styles.activeLink}>
            پروفایل
          </span>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            خروج
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.headerCard}>
          <h2 style={styles.title}>ویرایش پروفایل پزشک</h2>
          <p style={styles.subtitle}>اطلاعات تخصص و رزومه خود را به‌روزرسانی کنید</p>
        </div>

        {loading ? (
          <div style={styles.loader}>در حال بارگذاری... ⏳</div>
        ) : (
          <div style={styles.card}>
            {message.text && (
              <div
                style={{
                  ...styles.alert,
                  backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
                  color: message.type === 'success' ? '#2e7d32' : '#c62828',
                }}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} style={styles.formGrid}>

              <div style={styles.sideCol}>
                <div style={styles.avatarWrapper}>
                  {profileImage ? (
                    <img src={profileImage} alt="پروفایل" style={styles.avatarImg} />
                  ) : (
                    <div style={styles.defaultAvatar}>👤</div>
                  )}
                </div>

                <h3 style={styles.doctorName}>
                  دکتر {formData.first_name} {formData.last_name}
                </h3>

                <p style={styles.specialtyLabel}>
                  {formData.specialty || 'متخصص'}
                </p>

                <div style={styles.licenseBadge}>
                  <small>شماره نظام پزشکی</small>
                  <div style={styles.licenseValue}>
                    {formData.medical_license_number}
                  </div>
                </div>
              </div>

              <div style={styles.mainCol}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>نام</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>نام خانوادگی</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>تخصص</label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    style={styles.inputField}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>بیوگرافی</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    style={{ ...styles.inputField, minHeight: '120px', resize: 'vertical' }}
                  />
                </div>

                <div style={styles.btnGroup}>
                  <button type="submit" disabled={saving} style={styles.saveBtn}>
                    {saving ? 'در حال ذخیره‌سازی...' : '💾 ذخیره تغییرات'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/doctor-dashboard')}
                    style={styles.cancelBtn}
                  >
                    انصراف
                  </button>
                </div>
              </div>

            </form>
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
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '0 20px',
  },

  headerCard: {
    textAlign: 'center',
    marginBottom: '40px',
  },

  title: {
    color: '#007080',
    fontSize: '28px',
  },

  subtitle: {
    color: '#607d8b',
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '25px',
    padding: '40px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.04)',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '40px',
  },

  sideCol: {
    textAlign: 'center',
    borderLeft: '1px solid rgba(0,0,0,0.08)',
    paddingLeft: '30px',
  },

  avatarWrapper: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    margin: '0 auto 20px',
    overflow: 'hidden',
    border: '3px solid #b2dfdb',
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  defaultAvatar: {
    fontSize: '60px',
    color: '#fff',
    backgroundColor: '#d0e1fd',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  doctorName: {
    color: '#00695c',
    fontSize: '20px',
    marginBottom: '5px',
  },

  specialtyLabel: {
    color: '#00acc1',
    fontSize: '15px',
    marginBottom: '20px',
  },

  licenseBadge: {
    background: '#f5f5f5',
    padding: '10px',
    borderRadius: '10px',
    border: '1px dashed #ccc',
  },

  licenseValue: {
    fontWeight: 'bold',
    color: '#333',
    marginTop: '5px',
    letterSpacing: '1px',
  },

  mainCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  inputLabel: {
    fontWeight: 'bold',
    color: '#00695c',
    textAlign: 'right',
  },

  inputField: {
    width: '100%',
    padding: '12px',
    border: '1px solid #b2dfdb',
    borderRadius: '12px',
    textAlign: 'right',
  },

  btnGroup: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px',
  },

  saveBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#00897b',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
  },

  cancelBtn: {
    width: '100px',
    padding: '12px',
    background: 'none',
    color: '#00897b',
    border: '2px solid #00897b',
    borderRadius: '12px',
    cursor: 'pointer',
  },

  alert: {
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
  },

  loader: {
    textAlign: 'center',
    padding: '50px',
  },
};

export default DoctorProfile;
