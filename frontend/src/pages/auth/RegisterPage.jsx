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

    if (formData.password !== formData.password2) {
      setErrors({ ...errors, password2: ['رمز عبور و تکرار آن یکسان نیستند.'] });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      await api.post('accounts/register/', data);

      alert('ثبت‌نام با موفقیت انجام شد! 🎉');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        alert('خطا در ارتباط با سرور!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #f0f9ff, #cbebff, #e0f2f1);
          direction: rtl;
          font-family: Tahoma, Arial, sans-serif;
          padding: 40px 20px;
        }

        .register-container {
          width: 100%;
          max-width: 480px;
        }

        .header {
          text-align: center;
          margin-bottom: 25px;
        }

        .logo-circle {
          font-size: 45px;
          background: #fff;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin: 0 auto 15px auto;
          box-shadow: 0 10px 20px rgba(0,112,128,0.1);
        }

        .clinic-name {
          margin: 0;
          color: #007080;
          font-size: 26px;
          font-weight: bold;
        }

        .subtitle {
          color: #666;
          margin-top: 5px;
          font-size: 15px;
        }

        .card {
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.4);
        }

        .tab-container {
          display: flex;
          border-bottom: 1px solid #eee;
        }

        .tab-btn {
          flex: 1;
          padding: 15px;
          border: none;
          font-size: 16px;
          transition: 0.3s;
        }

        .tab-btn-active {
          background-color: transparent;
          color: #00897b;
          font-weight: bold;
          border-bottom: 3px solid #00897b;
          cursor: default;
        }

        .tab-btn-inactive {
          background-color: rgba(0,0,0,0.02);
          color: #888;
          cursor: pointer;
        }

        .tab-btn-inactive:hover {
          background-color: rgba(0,0,0,0.05);
        }

        .form {
          padding: 30px;
        }

        .row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }

        .col {
          flex: 1;
        }

        .input-group {
          margin-bottom: 15px;
        }

        .label {
          display: block;
          margin-bottom: 6px;
          color: #444;
          font-size: 13px;
          font-weight: 600;
          margin-right: 5px;
        }

        .input-field {
          width: 100%;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid #ddd;
          font-size: 14px;
          outline: none;
          transition: 0.3s;
          background-color: rgba(240, 250, 255, 0.5);
        }

        .input-field:focus {
          border-color: #00acc1 !important;
          box-shadow: 0 0 8px rgba(0, 172, 193, 0.2);
        }

        .ltr {
          direction: ltr;
          text-align: left;
        }

        .register-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #007080 0%, #00acc1 100%);
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0,172,193,0.2);
          margin-top: 10px;
          transition: 0.3s;
        }

        .register-btn:hover {
          opacity: 0.95;
        }

        .register-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-text {
          color: #d32f2f;
          font-size: 12px;
          margin-top: 5px;
          margin-right: 5px;
          display: block;
          font-weight: 500;
        }

        .general-error {
          background-color: #ffebee;
          color: #c62828;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 14px;
          text-align: center;
          border: 1px solid #ffcdd2;
        }

        @media (max-width: 768px) {
          .register-page {
            padding: 20px 14px;
            align-items: flex-start;
          }

          .register-container {
            max-width: 100%;
          }

          .header {
            margin-bottom: 18px;
          }

          .logo-circle {
            width: 64px;
            height: 64px;
            font-size: 36px;
          }

          .clinic-name {
            font-size: 22px;
          }

          .subtitle {
            font-size: 13px;
          }

          .form {
            padding: 22px;
          }

          .tab-btn {
            padding: 13px;
            font-size: 15px;
          }
        }

        @media (max-width: 576px) {
          .row {
            flex-direction: column;
            gap: 0;
            margin-bottom: 0;
          }

          .col {
            margin-bottom: 15px;
          }

          .card {
            border-radius: 22px;
          }

          .form {
            padding: 18px;
          }

          .input-field {
            font-size: 15px;
            padding: 12px 13px;
          }

          .register-btn {
            font-size: 15px;
            padding: 13px;
          }
        }

        @media (max-width: 420px) {
          .register-page {
            padding: 14px 10px;
          }

          .logo-circle {
            width: 58px;
            height: 58px;
            font-size: 32px;
          }

          .clinic-name {
            font-size: 19px;
          }

          .subtitle {
            font-size: 12px;
          }

          .tab-btn {
            padding: 12px 10px;
            font-size: 14px;
          }

          .form {
            padding: 14px;
          }

          .label {
            font-size: 12px;
          }

          .input-field {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="register-container">
        <div className="header">
          <div className="logo-circle">⛑️</div>
          <h2 className="clinic-name">کلینیک نوبت‌دهی آنلاین</h2>
          <p className="subtitle">به جمع بیماران ما بپیوندید 🩺</p>
        </div>

        <div className="card">
          <div className="tab-container">
            <button type="button" className="tab-btn tab-btn-active">
              ثبت‌نام
            </button>
            <button
              type="button"
              className="tab-btn tab-btn-inactive"
              onClick={() => navigate('/login')}
            >
              ورود
            </button>
          </div>

          <form onSubmit={handleRegister} className="form">
            {errors.non_field_errors && (
              <div className="general-error">{errors.non_field_errors[0]}</div>
            )}

            <div className="row">
              <div className="col">
                <label className="label">نام</label>
                <input
                  name="first_name"
                  onChange={handleChange}
                  className="input-field"
                  style={{ borderColor: errors.first_name ? '#d32f2f' : '#ddd' }}
                  required
                />
                {errors.first_name && (
                  <span className="error-text">{errors.first_name[0]}</span>
                )}
              </div>

              <div className="col">
                <label className="label">نام خانوادگی</label>
                <input
                  name="last_name"
                  onChange={handleChange}
                  className="input-field"
                  style={{ borderColor: errors.last_name ? '#d32f2f' : '#ddd' }}
                  required
                />
                {errors.last_name && (
                  <span className="error-text">{errors.last_name[0]}</span>
                )}
              </div>
            </div>

            <div className="input-group">
              <label className="label">ایمیل</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="input-field ltr"
                style={{ borderColor: errors.email ? '#d32f2f' : '#ddd' }}
                placeholder="example@gmail.com"
                required
              />
              {errors.email && (
                <span className="error-text">{errors.email[0]}</span>
              )}
            </div>

            <div className="input-group">
              <label className="label">شماره موبایل</label>
              <input
                name="phone_number"
                onChange={handleChange}
                className="input-field ltr"
                style={{ borderColor: errors.phone_number ? '#d32f2f' : '#ddd' }}
                placeholder="09123456789"
                required
              />
              {errors.phone_number && (
                <span className="error-text">{errors.phone_number[0]}</span>
              )}
            </div>

            <div className="row">
              <div className="col">
                <label className="label">کد ملی</label>
                <input
                  name="national_id"
                  onChange={handleChange}
                  className="input-field ltr"
                  style={{ borderColor: errors.national_id ? '#d32f2f' : '#ddd' }}
                  required
                />
                {errors.national_id && (
                  <span className="error-text">{errors.national_id[0]}</span>
                )}
              </div>

              <div className="col">
                <label className="label">تاریخ تولد</label>
                <input
                  type="date"
                  name="birth_date"
                  onChange={handleChange}
                  className="input-field"
                  style={{ borderColor: errors.birth_date ? '#d32f2f' : '#ddd' }}
                  required
                />
                {errors.birth_date && (
                  <span className="error-text">{errors.birth_date[0]}</span>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label className="label">رمز عبور</label>
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  className="input-field ltr"
                  style={{ borderColor: errors.password ? '#d32f2f' : '#ddd' }}
                  placeholder="••••••••"
                  required
                />
                {errors.password && (
                  <span className="error-text">{errors.password[0]}</span>
                )}
              </div>

              <div className="col">
                <label className="label">تکرار رمز عبور</label>
                <input
                  type="password"
                  name="password2"
                  onChange={handleChange}
                  className="input-field ltr"
                  style={{ borderColor: errors.password2 ? '#d32f2f' : '#ddd' }}
                  placeholder="••••••••"
                  required
                />
                {errors.password2 && (
                  <span className="error-text">{errors.password2[0]}</span>
                )}
              </div>
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام و عضویت'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
