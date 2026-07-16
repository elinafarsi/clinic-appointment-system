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

  // اضافه کردن استیت عرض صفحه برای ریسپانسیو موبایل
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 768;
  const isSmallMobile = screenWidth <= 480;

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      {/* نوار ناوبری */}
      <nav style={isMobile ? { ...styles.navbar, padding: isSmallMobile ? "8px 10px" : "10px 16px" } : styles.navbar}>

        {!isMobile ? (
          // دسکتاپ کاملاً دست‌نخورده و عینا مطابق کد اولیه شما
          <>
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
          </>
        ) : (
          // موبایل به صورت دو ردیفه و فشرده با کلید خروج جداگانه در صورت نیاز (یا بدون آن طبق طرح اصلی شما)
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={styles.navTopRow}>
              <div
                style={{
                  ...styles.logo,
                  fontSize: isSmallMobile ? "14px" : "16px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0
                }}
              >
                <span style={{ fontSize: isSmallMobile ? 18 : 22, marginLeft: 8 }}>⛑️</span>
                کلینیک نوبت‌دهی آنلاین
              </div>
            </div>

            <div
              style={{
                ...styles.navLinksRow,
                gap: isSmallMobile ? "8px" : "12px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(0,0,0,0.06)"
              }}
            >
              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/patient-dashboard")}
              >
                داشبورد
              </span>

              <span
                style={{
                  ...styles.activeLink,
                  fontSize: isSmallMobile ? "12px" : "13px",
                  paddingBottom: isSmallMobile ? "2px" : "4px",
                  borderBottomWidth: isSmallMobile ? "2px" : "3px"
                }}
              >
                رزرو نوبت
              </span>

              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/patient-appointments")}
              >
                نوبت‌های من
              </span>

              <span
                style={{ ...styles.link, fontSize: isSmallMobile ? "12px" : "13px" }}
                onClick={() => navigate("/patient-profile")}
              >
                پروفایل
              </span>
            </div>
          </div>
        )}

      </nav>

      <div style={{
        ...styles.container,
        margin: isMobile ? "25px auto" : "40px auto",
        padding: isMobile ? "0 14px" : 20
      }}>

        {doctorInfo && (
          <div style={isMobile ? {
            ...styles.doctorCard,
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 12,
            padding: isSmallMobile ? "14px" : "18px",
            marginBottom: 16
          } : styles.doctorCard}>

            <div style={isMobile ? {
              ...styles.avatarWrapper,
              width: 72,
              height: 72,
              fontSize: 34
            } : styles.avatarWrapper}>
              {doctorInfo.profile_image ?
                <img src={doctorInfo.profile_image} alt="doc" style={styles.avatarImg} />
                :
                "👨‍⚕️"
              }
            </div>

            <div>
              <h2 style={isMobile ? {
                ...styles.doctorName,
                fontSize: isSmallMobile ? "16px" : "18px"
              } : styles.doctorName}>
                دکتر {doctorInfo.first_name} {doctorInfo.last_name}
              </h2>

              <p style={isMobile ? {
                ...styles.specialty,
                fontSize: isSmallMobile ? "12.5px" : "13px"
              } : styles.specialty}>
                {doctorInfo.specialty || "متخصص عمومی"}
              </p>
            </div>

          </div>
        )}

        <div style={isMobile ? {
          ...styles.glassCard,
          padding: isSmallMobile ? "16px 12px" : "22px 14px",
          borderRadius: 18
        } : styles.glassCard}>

          <h3 style={isMobile ? {
            ...styles.sectionTitle,
            fontSize: isSmallMobile ? "15px" : "16px",
            marginBottom: 10
          } : styles.sectionTitle}>انتخاب تاریخ</h3>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? 16 : 30 }}>
            <div style={{ width: "100%", maxWidth: isMobile ? 340 : 420, display: 'flex', justifyContent: 'center' }}>
              <Calendar
                calendar={persian}
                locale={persian_fa}
                minDate={new DateObject()}
                onChange={handleCalendarChange}
                className={isMobile ? "rmdp-mobile" : ""}
              />
            </div>
          </div>

          <h3 style={isMobile ? {
            ...styles.sectionTitle,
            fontSize: isSmallMobile ? "15px" : "16px",
            marginBottom: 10
          } : styles.sectionTitle}>انتخاب ساعت</h3>

          {loading ?

            <p style={isMobile ? { ...styles.infoText, fontSize: "13px" } : styles.infoText}>در حال دریافت زمان‌ها...</p>

            :

            <div style={isMobile ? {
              ...styles.slotsGrid,
              gridTemplateColumns: isSmallMobile ? "repeat(3, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
              gap: isSmallMobile ? 10 : 12
            } : styles.slotsGrid}>

              {availableSlots.length > 0 ?

                availableSlots.map(slot => (

                  <div
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    style={selectedSlot === slot ? (
                      isMobile ? { ...styles.slotActive, padding: "10px 8px", borderRadius: 10, fontSize: isSmallMobile ? "12px" : "13px" } : styles.slotActive
                    ) : (
                      isMobile ? { ...styles.slot, padding: "10px 8px", borderRadius: 10, fontSize: isSmallMobile ? "12px" : "13px" } : styles.slot
                    )}
                  >

                    {slot}

                  </div>

                ))

                :

                <p style={{ ...styles.infoText, gridColumn: "1 / -1" }}>
                  {selectedDate ? "زمانی موجود نیست" : "ابتدا تاریخ انتخاب کنید"}
                </p>

              }

            </div>

          }

          <button
            style={bookingLoading || !selectedSlot ? (
              isMobile ? { ...styles.disabledBtn, marginTop: 18, padding: 12, fontSize: isSmallMobile ? 14 : 15, borderRadius: 12 } : styles.disabledBtn
            ) : (
              isMobile ? { ...styles.bookBtn, marginTop: 18, padding: 12, fontSize: isSmallMobile ? 14 : 15, borderRadius: 12 } : styles.bookBtn
            )}
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
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
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

  navTopRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between"
  },

  navLinksRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap"
  },

  link: {
    cursor: 'pointer',
    color: '#555',
    whiteSpace: 'nowrap'
  },

  activeLink: {
    color: '#00897b',
    fontWeight: 'bold',
    borderBottom: '3px solid #00897b',
    paddingBottom: 5,
    whiteSpace: 'nowrap'
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
    overflow: 'hidden',
    flexShrink: 0
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
