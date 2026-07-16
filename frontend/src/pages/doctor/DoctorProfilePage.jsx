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

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <nav
        style={
          isMobile
            ? {
                ...styles.navbar,
                padding: isSmallMobile ? '8px 10px' : '10px 16px',
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
              <span style={styles.link} onClick={() => navigate('/doctor-dashboard')}>
                داشبورد
              </span>
              <span style={styles.link} onClick={() => navigate('/doctor-appointments')}>
                نوبت‌ها
              </span>
              <span style={styles.activeLink}>پروفایل</span>

              <button style={styles.logoutBtn} onClick={handleLogout}>
                خروج
              </button>
            </div>
          </>
        ) : (
          <div style={styles.mobileNavWrapper}>
            <div style={styles.navTopRow}>
              <div
                style={{
                  ...styles.logo,
                  fontSize: isSmallMobile ? '14px' : '16px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
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
                  flexShrink: 0,
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
                borderTop: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? '12px' : '13px' }}
                onClick={() => navigate('/doctor-dashboard')}
              >
                داشبورد
              </span>
              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? '12px' : '13px' }}
                onClick={() => navigate('/doctor-appointments')}
              >
                نوبت‌ها
              </span>
              <span style={{ ...styles.activeLink, fontSize: isSmallMobile ? '12px' : '13px' }}>
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
          padding: isMobile ? '0 14px' : '0 20px',
        }}
      >
        <div
          style={{
            ...styles.headerCard,
            marginBottom: isMobile ? '24px' : '40px',
          }}
        >
          <h2
            style={{
              ...styles.title,
              fontSize: isSmallMobile ? '22px' : isMobile ? '24px' : '28px',
              lineHeight: isMobile ? '1.8' : 'normal',
            }}
          >
            ویرایش پروفایل پزشک
          </h2>
          <p
            style={{
              ...styles.subtitle,
              fontSize: isMobile ? '13px' : '15px',
            }}
          >
            اطلاعات تخصص و رزومه خود را به‌روزرسانی کنید
          </p>
        </div>

        {loading ? (
          <div style={styles.loader}>در حال بارگذاری... ⏳</div>
        ) : (
          <div
            style={{
              ...styles.card,
              padding: isSmallMobile ? '18px 14px' : isMobile ? '22px 16px' : '40px',
              borderRadius: isMobile ? '18px' : '25px',
            }}
          >
            {message.text && (
              <div
                style={{
                  ...styles.alert,
                  backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
                  color: message.type === 'success' ? '#2e7d32' : '#c62828',
                  padding: isMobile ? '12px' : '15px',
                  borderRadius: isMobile ? '10px' : '12px',
                  marginBottom: isMobile ? '16px' : '20px',
                }}
              >
                {message.text}
              </div>
            )}

            <form
              onSubmit={handleSave}
              style={{
                ...styles.formGrid,
                gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
                gap: isMobile ? '24px' : '40px',
              }}
            >
              <div
                style={{
                  ...styles.sideCol,
                  borderLeft: isMobile ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  paddingLeft: isMobile ? '0' : '30px',
                  paddingBottom: isMobile ? '20px' : '0',
                  borderBottom: isMobile ? '1px solid rgba(0,0,0,0.08)' : 'none',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    ...styles.avatarWrapper,
                    width: isSmallMobile ? '110px' : isMobile ? '120px' : '140px',
                    height: isSmallMobile ? '110px' : isMobile ? '120px' : '140px',
                    marginBottom: isMobile ? '16px' : '20px',
                  }}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="پروفایل" style={styles.avatarImg} />
                  ) : (
                    <div style={styles.defaultAvatar}>👤</div>
                  )}
                </div>

                <h3
                  style={{
                    ...styles.doctorName,
                    fontSize: isMobile ? '18px' : '20px',
                    marginBottom: '5px',
                  }}
                >
                  دکتر {formData.first_name} {formData.last_name}
                </h3>

                <p
                  style={{
                    ...styles.specialtyLabel,
                    fontSize: isMobile ? '14px' : '15px',
                    marginBottom: isMobile ? '16px' : '20px',
                  }}
                >
                  {formData.specialty || 'متخصص'}
                </p>

                <div
                  style={{
                    ...styles.licenseBadge,
                    padding: isMobile ? '10px' : '10px',
                  }}
                >
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
                    style={{
                      ...styles.inputField,
                      padding: isMobile ? '11px' : '12px',
                      fontSize: isMobile ? '13px' : '14px',
                      borderRadius: isMobile ? '10px' : '12px',
                    }}
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
                    style={{
                      ...styles.inputField,
                      padding: isMobile ? '11px' : '12px',
                      fontSize: isMobile ? '13px' : '14px',
                      borderRadius: isMobile ? '10px' : '12px',
                    }}
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
                    style={{
                      ...styles.inputField,
                      padding: isMobile ? '11px' : '12px',
                      fontSize: isMobile ? '13px' : '14px',
                      borderRadius: isMobile ? '10px' : '12px',
                    }}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>بیوگرافی</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    style={{
                      ...styles.inputField,
                      minHeight: isMobile ? '110px' : '120px',
                      resize: 'vertical',
                      padding: isMobile ? '11px' : '12px',
                      fontSize: isMobile ? '13px' : '14px',
                      borderRadius: isMobile ? '10px' : '12px',
                    }}
                  />
                </div>

                <div
                  style={{
                    ...styles.btnGroup,
                    flexDirection: isSmallMobile ? 'column' : 'row',
                    gap: isMobile ? '10px' : '15px',
                  }}
                >
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      ...styles.saveBtn,
                      width: isSmallMobile ? '100%' : 'auto',
                      padding: isMobile ? '12px' : '12px',
                      fontSize: isMobile ? '14px' : '15px',
                    }}
                  >
                    {saving ? 'در حال ذخیره‌سازی...' : '💾 ذخیره تغییرات'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/doctor-dashboard')}
                    style={{
                      ...styles.cancelBtn,
                      width: isSmallMobile ? '100%' : '100px',
                      padding: isMobile ? '12px' : '12px',
                      fontSize: isMobile ? '14px' : '15px',
                    }}
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
    fontFamily: 'Tahoma, Arial',
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

  mobileNavWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  navTopRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },

  navLinksRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  logo: {
    fontWeight: 'bold',
    fontSize: '22px',
    color: '#007080',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
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
    whiteSpace: 'nowrap',
  },

  activeLink: {
    color: '#00897b',
    fontWeight: 'bold',
    borderBottom: '2px solid #00897b',
    paddingBottom: '5px',
    cursor: 'default',
    whiteSpace: 'nowrap',
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
    boxSizing: 'border-box',
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
