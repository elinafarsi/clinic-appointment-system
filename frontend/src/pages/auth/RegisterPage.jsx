import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    password2: '', 
    first_name: '', 
    last_name: '',
    phone_number: '', 
    national_id: '', 
    birth_date: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // ولیدیشن فرانت‌انـد برای سرعت بیشتر
    if (formData.password !== formData.password2) {
      setErrors({ ...errors, password2: ["رمز عبور و تکرار آن یکسان نیستند."] });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => { 
        data.append(key, formData[key]); 
      });

      const response = await api.post('accounts/register/', data);
      
      alert("ثبت‌نام با موفقیت انجام شد! 🎉");
      navigate('/login'); 
      
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        alert("خطا در ارتباط با سرور!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      <style>{`
        .glass-input { transition: all 0.3s ease; }
        .glass-input:focus { border-color: #00acc1 !important; box-shadow: 0 0 8px rgba(0, 172, 193, 0.2); outline: none; }
      `}</style>

      <div style={styles.registerContainer}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>⛑️</div>
          <h2 style={styles.clinicName}>کلینیک نوبت‌دهی آنلاین</h2>
          <p style={styles.subtitle}>به جمع بیماران ما بپیوندید 🩺</p>
        </div>

        <div style={styles.card}>
          <div style={styles.tabContainer}>
            <button type="button" style={styles.tabBtnActive}>ثبت‌نام</button>
            <button type="button" style={styles.tabBtnInactive} onClick={() => navigate('/login')}>ورود</button>
          </div>

          <form onSubmit={handleRegister} style={styles.form}>
            {errors.non_field_errors && <div style={styles.generalError}>{errors.non_field_errors[0]}</div>}

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>نام</label>
                <input name="first_name" onChange={handleChange} className="glass-input" style={{...styles.inputField, borderColor: errors.first_name ? '#d32f2f' : '#ddd'}} required />
                {errors.first_name && <span style={styles.errorText}>{errors.first_name[0]}</span>}
              </div>
              <div style={styles.col}>
                <label style={styles.label}>نام خانوادگی</label>
                <input name="last_name" onChange={handleChange} className="glass-input" style={{...styles.inputField, borderColor: errors.last_name ? '#d32f2f' : '#ddd'}} required />
                {errors.last_name && <span style={styles.errorText}>{errors.last_name[0]}</span>}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>ایمیل</label>
              <input type="email" name="email" onChange={handleChange} className="glass-input" style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.email ? '#d32f2f' : '#ddd'}} placeholder="example@gmail.com" required />
              {errors.email && <span style={styles.errorText}>{errors.email[0]}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>شماره موبایل</label>
              <input name="phone_number" onChange={handleChange} className="glass-input" style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.phone_number ? '#d32f2f' : '#ddd'}} placeholder="09123456789" required />
              {errors.phone_number && <span style={styles.errorText}>{errors.phone_number[0]}</span>}
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>کد ملی</label>
                <input name="national_id" onChange={handleChange} className="glass-input" style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.national_id ? '#d32f2f' : '#ddd'}} required />
                {errors.national_id && <span style={styles.errorText}>{errors.national_id[0]}</span>}
              </div>
              <div style={styles.col}>
                <label style={styles.label}>تاریخ تولد</label>
                <input type="date" name="birth_date" onChange={handleChange} className="glass-input" style={{...styles.inputField, borderColor: errors.birth_date ? '#d32f2f' : '#ddd'}} required />
                {errors.birth_date && <span style={styles.errorText}>{errors.birth_date[0]}</span>}
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>رمز عبور</label>
                <input type="password" name="password" onChange={handleChange} className="glass-input" style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.password ? '#d32f2f' : '#ddd'}} placeholder="••••••••" required />
                {errors.password && <span style={styles.errorText}>{errors.password[0]}</span>}
              </div>
              <div style={styles.col}>
                <label style={styles.label}>تکرار رمز عبور</label>
                <input type="password" name="password2" onChange={handleChange} className="glass-input" style={{...styles.inputField, direction: 'ltr', textAlign: 'left', borderColor: errors.password2 ? '#d32f2f' : '#ddd'}} placeholder="••••••••" required />
                {errors.password2 && <span style={styles.errorText}>{errors.password2[0]}</span>}
              </div>
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
    pageBackground: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top right, #f0f9ff, #cbebff, #e0f2f1)', direction: 'rtl', fontFamily: 'Tahoma, Arial, sans-serif', padding: '40px 20px' },
    registerContainer: { width: '100%', maxWidth: '480px' },
    header: { textAlign: 'center', marginBottom: '25px' },
    logoCircle: { fontSize: '45px', background: '#fff', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', margin: '0 auto 15px auto', boxShadow: '0 10px 20px rgba(0,112,128,0.1)' },
    clinicName: { margin: '0', color: '#007080', fontSize: '26px', fontWeight: 'bold' },
    subtitle: { color: '#666', marginTop: '5px', fontSize: '15px' },
    card: { backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(15px)', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.4)' },
    tabContainer: { display: 'flex', borderBottom: '1px solid #eee' },
    tabBtnActive: { flex: 1, padding: '15px', border: 'none', backgroundColor: 'transparent', color: '#00897b', fontWeight: 'bold', fontSize: '16px', borderBottom: '3px solid #00897b', cursor: 'default' },
    tabBtnInactive: { flex: 1, padding: '15px', border: 'none', backgroundColor: 'rgba(0,0,0,0.02)', color: '#888', fontSize: '16px', cursor: 'pointer', transition: '0.3s' },
    form: { padding: '30px' },
    inputGroup: { marginBottom: '15px' },
    row: { display: 'flex', gap: '15px', marginBottom: '15px' },
    col: { flex: 1 },
    label: { display: 'block', marginBottom: '6px', color: '#444', fontSize: '13px', fontWeight: '600', marginRight: '5px' },
    inputField: { width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', transition: '0.3s', boxSizing: 'border-box', backgroundColor: 'rgba(240, 250, 255, 0.5)' },
    registerBtn: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #007080 0%, #00acc1 100%)', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,172,193,0.2)', marginTop: '10px', transition: '0.3s' },
    errorText: { color: '#d32f2f', fontSize: '12px', marginTop: '5px', marginRight: '5px', display: 'block', fontWeight: '500' },
    generalError: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #ffcdd2' }
};

export default Register;
