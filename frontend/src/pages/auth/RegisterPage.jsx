import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', password: '', first_name: '', last_name: '',
    phone_number: '', national_id: '', birth_date: '', profile_image: null
  });
  const [errors, setErrors] = useState({}); // استیت جدید برای نگهداری ارورها
  const [loading, setLoading] = useState(false);

  // موقع نوشتن، ارور مربوط به اون فیلد پاک می‌شه
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profile_image: e.target.files[0] });
    if (errors.profile_image) {
      setErrors({ ...errors, profile_image: null });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // پاک کردن ارورهای قبلی قبل از ارسال مجدد
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    const data = new FormData();
    Object.keys(formData).forEach(key => { 
      if (formData[key]) data.append(key, formData[key]); 
    });

    try {
      const response = await api.post('accounts/register/', data, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      console.log("پاسخ ثبت‌نام:", response.data);
      
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
      }

      alert("ثبت‌نام با موفقیت انجام شد! حالا وارد شوید 🎉");
      navigate('/login'); 
      
    } catch (error) {
      console.error("خطای ثبت‌نام:", error.response?.data);
      // گرفتن ارورها از پاسخ سرور
      if (error.response && error.response.data) {
        setErrors(error.response.data);
        alert("خطا در ثبت‌نام! لطفا اطلاعات وارد شده را بررسی کنید.");
      } else {
        alert("خطا در ارتباط با سرور! لطفا بعدا تلاش کنید.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      <style>{`
        .glass-input {
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          border-color: #00acc1 !important;
          box-shadow: 0 0 8px rgba(0, 172, 193, 0.2);
          outline: none;
        }
        input[type="date"] {
          color-scheme: light;
          cursor: pointer;
        }
      `}</style>

      <div style={styles.registerContainer}>
        
        {/* هدر فرم */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>⛑️</div>
          <h2 style={styles.clinicName}>کلینیک نوبت‌دهی آنلاین</h2>
          <p style={styles.subtitle}>به کلینیک آنلاین ما خوش آمدید 🩺</p>
        </div>

        <div style={styles.card}>
          <div style={styles.tabContainer}>
            <button
              type="button"
              style={styles.tabBtnActive}
            >
              ثبت‌نام
            </button>
            <button
              type="button"
              style={styles.tabBtnInactive}
              onClick={() => navigate('/login')}
            >
              ورود
            </button>
          </div>

          <form onSubmit={handleRegister} style={styles.form}>
            
            {/* ارورهای کلی در صورت وجود */}
            {errors.non_field_errors && (
              <div style={styles.generalError}>
                {errors.non_field_errors[0]}
              </div>
            )}

            {/* ردیف نام و نام خانوادگی */}
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>نام</label>
                <input 
                  name="first_name" 
                  onChange={handleChange} 
                  className="glass-input" 
                  style={{...styles.inputField, borderColor: errors.first_name ? '#d32f2f' : '#ddd'}} 
                  required 
                />
                {errors.first_name && <span style={styles.errorText}>{errors.first_name[0]}</span>}
              </div>
              <div style={styles.col}>
                <label style={styles.label}>نام خانوادگی</label>
                <input 
                  name="last_name" 
                  onChange={handleChange} 
                  className="glass-input" 
                  style={{...styles.inputField, borderColor: errors.last_name ? '#d32f2f' : '#ddd'}} 
                  required 
                />
                {errors.last_name && <span style={styles.errorText}>{errors.last_name[0]}</span>}
              </div>
            </div>

            {/* ایمیل */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>ایمیل</label>
              <input 
                type="email" 
                name="email" 
                onChange={handleChange} 
                className="glass-input" 
                style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.email ? '#d32f2f' : '#ddd'}} 
                placeholder="example@gmail.com"
                required 
              />
              {errors.email && <span style={styles.errorText}>{errors.email[0]}</span>}
            </div>

            {/* موبایل */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>شماره موبایل</label>
              <input 
                name="phone_number" 
                onChange={handleChange} 
                className="glass-input" 
                style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.phone_number ? '#d32f2f' : '#ddd'}} 
                placeholder="09123456789"
                required 
              />
              {errors.phone_number && <span style={styles.errorText}>{errors.phone_number[0]}</span>}
            </div>

            {/* ردیف کد ملی و تاریخ تولد */}
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>کد ملی</label>
                <input 
                  name="national_id" 
                  onChange={handleChange} 
                  className="glass-input" 
                  style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.national_id ? '#d32f2f' : '#ddd'}} 
                  required 
                />
                {errors.national_id && <span style={styles.errorText}>{errors.national_id[0]}</span>}
              </div>
              <div style={styles.col}>
                <label style={styles.label}>تاریخ تولد</label>
                <input 
                  type="date" 
                  name="birth_date" 
                  onChange={handleChange} 
                  className="glass-input" 
                  style={{...styles.inputField, borderColor: errors.birth_date ? '#d32f2f' : '#ddd'}} 
                  required 
                />
                {errors.birth_date && <span style={styles.errorText}>{errors.birth_date[0]}</span>}
              </div>
            </div>

            {/* رمز عبور */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>رمز عبور</label>
              <input 
                type="password" 
                name="password" 
                onChange={handleChange} 
                className="glass-input" 
                style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.password ? '#d32f2f' : '#ddd'}} 
                placeholder="••••••••"
                required 
              />
              {errors.password && <span style={styles.errorText}>{errors.password[0]}</span>}
            </div>

            {/* عکس پروفایل */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>عکس پروفایل</label>
              <div style={{...styles.fileUploadBox, borderColor: errors.profile_image ? '#d32f2f' : '#00acc1'}}>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  style={{ fontSize: '13px', width: '100%' }} 
                />
              </div>
              {errors.profile_image && <span style={styles.errorText}>{errors.profile_image[0]}</span>}
            </div>

            <button type="submit" style={styles.registerBtn} disabled={loading}>
              {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام و عضویت'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at top right, #f0f9ff, #cbebff, #e0f2f1)',
    direction: 'rtl',
    fontFamily: 'Tahoma, Arial, sans-serif',
    padding: '40px 20px'
  },

  registerContainer: {
    width: '100%',
    maxWidth: '480px',
    animation: 'fadeIn 0.8s ease-in-out'
  },

  header: {
    textAlign: 'center',
    marginBottom: '25px'
  },

  logoCircle: {
    fontSize: '45px',
    background: '#fff',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    margin: '0 auto 15px auto',
    boxShadow: '0 10px 20px rgba(0,112,128,0.1)'
  },

  clinicName: {
    margin: '0',
    color: '#007080',
    fontSize: '26px',
    fontWeight: 'bold'
  },

  subtitle: {
    color: '#666',
    marginTop: '5px',
    fontSize: '15px'
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(15px)',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    border: '1px solid rgba(255,255,255,0.4)'
  },

  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid #eee'
  },

  tabBtnActive: {
    flex: 1,
    padding: '15px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#00897b',
    fontWeight: 'bold',
    fontSize: '16px',
    borderBottom: '3px solid #00897b',
    cursor: 'default'
  },

  tabBtnInactive: {
    flex: 1,
    padding: '15px',
    border: 'none',
    backgroundColor: 'rgba(0,0,0,0.02)',
    color: '#888',
    fontSize: '16px',
    cursor: 'pointer',
    transition: '0.3s'
  },

  form: {
    padding: '30px'
  },

  inputGroup: {
    marginBottom: '15px'
  },

  row: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
  },

  col: {
    flex: 1
  },

  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#444',
    fontSize: '13px',
    fontWeight: '600',
    marginRight: '5px'
  },

  inputField: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    transition: '0.3s',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(240, 250, 255, 0.5)'
  },

  fileUploadBox: {
    padding: '10px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    border: '1.5px dashed #00acc1',
    boxSizing: 'border-box',
    transition: '0.3s'
  },

  registerBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #007080 0%, #00acc1 100%)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(0,172,193,0.2)',
    marginTop: '10px',
    transition: '0.3s'
  },

  errorText: {
    color: '#d32f2f',
    fontSize: '12px',
    marginTop: '5px',
    marginRight: '5px',
    display: 'block',
    fontWeight: '500'
  },

  generalError: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '14px',
    textAlign: 'center',
    border: '1px solid #ffcdd2'
  }
};

export default Register;
