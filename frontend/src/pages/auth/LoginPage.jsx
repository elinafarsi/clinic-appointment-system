import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480); // تشخیص موبایل
  const navigate = useNavigate();

  // مدیریت تغییر سایز صفحه برای ریسپانسیو لحظه‌ای
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 480);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('accounts/login/', {
        username: email,
        password: password,
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      if (response.data.role === "doctor") {
        navigate('/doctor-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
      
    } catch (error) {
      console.error('خطا در ورود:', error.response?.data || error.message);
      alert('ایمیل یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={{
        ...styles.loginContainer,
        maxWidth: isMobile ? '100%' : '450px' // در موبایل عرض کامل بگیرد
      }}>
        
        {/* هدر فرم */}
        <div style={styles.header}>
          <div style={{
            ...styles.logoCircle,
            width: isMobile ? '60px' : '80px', // لوگو در موبایل کوچک‌تر
            height: isMobile ? '60px' : '80px',
            fontSize: isMobile ? '35px' : '45px'
          }}>⛑️</div>
          <h2 style={{
            ...styles.clinicName,
            fontSize: isMobile ? '20px' : '26px' // فونت تیتر در موبایل
          }}>کلینیک نوبت‌دهی آنلاین</h2>
          <p style={{
            ...styles.subtitle,
            fontSize: isMobile ? '13px' : '15px'
          }}>خوش آمدید، لطفا وارد حساب خود شوید</p>
        </div>

        <div style={styles.card}>
          {/* تب‌ها */}
          <div style={styles.tabContainer}>
            <button
              style={styles.tabBtnInactive}
              onClick={() => navigate('/register')}
            >
              ثبت‌نام
            </button>
            <button style={styles.tabBtnActive}>ورود</button>
          </div>

          <form onSubmit={handleAuth} style={{
            ...styles.form,
            padding: isMobile ? '20px' : '35px' // پدینگ کمتر در موبایل برای فضای بیشتر
          }}>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>ایمیل (نام کاربری)</label>
              <input
                type="email"
                style={styles.inputField}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>رمز عبور</label>
              <input
                type="password"
                style={styles.inputField}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" style={styles.loginBtn} disabled={loading}>
              {loading ? 'در حال بررسی...' : 'ورود به حساب'}
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
    padding: '15px' // پدینگ دور صفحه برای گوشی
  },

  loginContainer: {
    width: '100%',
    animation: 'fadeIn 0.8s ease-in-out'
  },

  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },

  logoCircle: {
    background: '#fff',
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
    fontWeight: 'bold'
  },

  subtitle: {
    color: '#666',
    marginTop: '5px'
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
    // پدینگ به صورت داینامیک در بالا تنظیم شده
  },

  inputGroup: {
    marginBottom: '15px'
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#444',
    fontSize: '14px',
    fontWeight: '500'
  },

  inputField: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    transition: '0.3s',
    boxSizing: 'border-box',
    direction: 'ltr',
    textAlign: 'left'
  },

  loginBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #007080 0%, #00acc1 100%)',
    color: '#fff',
    fontSize: '17px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(0,172,193,0.2)',
    marginTop: '10px',
    transition: '0.3s'
  }
};

export default Login;
