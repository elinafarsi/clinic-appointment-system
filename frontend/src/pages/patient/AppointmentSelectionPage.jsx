import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

import { Calendar, DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import "react-multi-date-picker/styles/layouts/mobile.css";

function AppointmentSelectionPage() {

  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctorInfo, setDoctorInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get('accounts/doctors/');
        const doc = res.data.find(d => d.id === parseInt(doctorId));
        setDoctorInfo(doc);
      } catch (err) {
        console.error("خطا در دریافت دکتر", err);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleCalendarChange = async (date) => {

    if (!date) return;

    const jsDate = date.toDate();

    const year = jsDate.getFullYear();
    const month = String(jsDate.getMonth() + 1).padStart(2, '0');
    const day = String(jsDate.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    setSelectedDate(formattedDate);
    setAvailableSlots([]);
    setSelectedSlot("");

    try {

      setLoading(true);

      const res = await api.get('appointments/appointments/available_slots/', {
        params: {
          doctor: doctorId,
          date: formattedDate
        }
      });

      setAvailableSlots(res.data.available_slots || []);

    } catch (err) {

      console.error(err);
      alert("خطا در دریافت زمان‌های خالی");

    } finally {

      setLoading(false);

    }
  };

  const handleBookNow = async () => {

    if (!selectedDate || !selectedSlot) {
      alert("لطفاً تاریخ و ساعت را انتخاب کنید");
      return;
    }

    try {

      setBookingLoading(true);

      await api.post('appointments/appointments/', {
        doctor: doctorId,
        appointment_date: selectedDate,
        appointment_time: selectedSlot
      });

      alert("✅ نوبت با موفقیت ثبت شد");

      navigate('/patient-appointments');

    } catch (err) {

      const errorMsg = err.response?.data?.error || "خطا در ثبت نوبت";
      alert(errorMsg);

    } finally {

      setBookingLoading(false);

    }
  };

  return (
    <div style={styles.pageBackground}>

      <nav style={styles.navbar}>

        <div style={styles.logo}>
          <span style={{ fontSize: 28, marginLeft: 10 }}>⛑️</span>
          کلینیک نوبت‌دهی آنلاین
        </div>

        <div style={styles.navLinks}>
          <span style={styles.link} onClick={() => navigate('/patient-dashboard')}>داشبورد</span>
          <span style={styles.activeLink}>رزرو نوبت</span>
          <span style={styles.link} onClick={() => navigate('/patient-appointments')}>نوبت‌های من</span>
          <span style={styles.link} onClick={() => navigate('/patient-profile')}>پروفایل</span>
          
        </div>

      </nav>

      <div style={styles.container}>

        {doctorInfo && (
          <div style={styles.doctorCard}>

            <div style={styles.avatarWrapper}>
              {doctorInfo.profile_image ?
                <img src={doctorInfo.profile_image} alt="doc" style={styles.avatarImg} />
                :
                "👨‍⚕️"
              }
            </div>

            <div>
              <h2 style={styles.doctorName}>
                دکتر {doctorInfo.first_name} {doctorInfo.last_name}
              </h2>

              <p style={styles.specialty}>
                {doctorInfo.specialty || "متخصص عمومی"}
              </p>
            </div>

          </div>
        )}

        <div style={styles.glassCard}>

          <h3 style={styles.sectionTitle}>انتخاب تاریخ</h3>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>

            <Calendar
              calendar={persian}
              locale={persian_fa}
              minDate={new DateObject()}
              onChange={handleCalendarChange}
            />

          </div>

          <h3 style={styles.sectionTitle}>انتخاب ساعت</h3>

          {loading ?

            <p style={styles.infoText}>در حال دریافت زمان‌ها...</p>

            :

            <div style={styles.slotsGrid}>

              {availableSlots.length > 0 ?

                availableSlots.map(slot => (

                  <div
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    style={selectedSlot === slot ? styles.slotActive : styles.slot}
                  >

                    {slot}

                  </div>

                ))

                :

                <p style={styles.infoText}>
                  {selectedDate ? "زمانی موجود نیست" : "ابتدا تاریخ انتخاب کنید"}
                </p>

              }

            </div>

          }

          <button
            style={bookingLoading || !selectedSlot ? styles.disabledBtn : styles.bookBtn}
            disabled={bookingLoading || !selectedSlot}
            onClick={handleBookNow}
          >

            {bookingLoading ? "در حال ثبت..." : "تایید و رزرو نهایی"}

          </button>

        </div>

      </div>

    </div>
  );
}

const styles = {

  pageBackground: {
    background: 'radial-gradient(circle at top right,#f0f9ff,#cbebff,#f0faff)',
    minHeight: '100vh',
    direction: 'rtl',
    fontFamily: 'Tahoma'
  },

  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 60px',
    background: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },

  logo: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#007080',
    display: 'flex',
    alignItems: 'center'
  },

  navLinks: {
    display: 'flex',
    gap: 25
  },

  link: {
    cursor: 'pointer',
    color: '#555'
  },

  activeLink: {
    color: '#00897b',
    fontWeight: 'bold',
    borderBottom: '3px solid #00897b',
    paddingBottom: 5
  },

  container: {
    maxWidth: 900,
    margin: '40px auto',
    padding: 20
  },

  doctorCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
    background: 'rgba(255,255,255,0.7)',
    padding: 25,
    borderRadius: 20,
    backdropFilter: 'blur(10px)'
  },

  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
    overflow: 'hidden'
  },

  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },

  doctorName: {
    margin: 0,
    color: '#004d40'
  },

  specialty: {
    marginTop: 6,
    color: '#00acc1',
    fontWeight: 'bold'
  },

  glassCard: {
    background: 'rgba(255,255,255,0.75)',
    padding: 35,
    borderRadius: 25,
    backdropFilter: 'blur(15px)',
    boxShadow: '0 15px 40px rgba(0,0,0,0.08)'
  },

  sectionTitle: {
    color: '#007080',
    marginBottom: 15
  },

  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))',
    gap: 15
  },

  slot: {
    padding: 12,
    textAlign: 'center',
    borderRadius: 12,
    background: '#fff',
    cursor: 'pointer',
    border: '1px solid #eee'
  },

  slotActive: {
    padding: 12,
    textAlign: 'center',
    borderRadius: 12,
    background: 'linear-gradient(135deg,#007080,#00acc1)',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  infoText: {
    textAlign: 'center',
    color: '#666'
  },

  bookBtn: {
    width: '100%',
    marginTop: 35,
    padding: 16,
    borderRadius: 15,
    border: 'none',
    background: 'linear-gradient(135deg,#007080,#00acc1)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  disabledBtn: {
    width: '100%',
    marginTop: 35,
    padding: 16,
    borderRadius: 15,
    border: 'none',
    background: '#ccc',
    color: '#fff'
  }

};

export default AppointmentSelectionPage;
