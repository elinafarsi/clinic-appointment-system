import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function PatientProfile() {

  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const [profileImage, setProfileImage] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };
  

  useEffect(() => {
    api.get("accounts/me/")
      .then(res => {

        setPatient(res.data);

        setFormData({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          phone_number: res.data.phone_number || "",
        });

        if (res.data.profile_image) {
          setProfileImage(
            res.data.profile_image.startsWith("http")
              ? res.data.profile_image
              : `http://127.0.0.1:8000${res.data.profile_image}`
          );
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("خطا در دریافت پروفایل:", err);
        setLoading(false);
      });

  }, []);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  const handleImage = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSave = async (e) => {

    e.preventDefault();
    setSaving(true);

    const data = new FormData();

    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    data.append("phone_number", formData.phone_number);

    if (profileImage instanceof File) {
      data.append("profile_image", profileImage);
    }

    try {

      await api.put("accounts/me/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("✅ اطلاعات با موفقیت ذخیره شد");

    } catch (err) {

      console.error(err);
      alert("خطا در ذخیره اطلاعات");

    }

    setSaving(false);

  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "100px" }}>در حال بارگذاری...</div>;
  }

  return (

    <div style={styles.pageBackground}>

      <nav style={styles.navbar}>

        <div style={styles.logo}>
          ⛑️ کلینیک نوبت‌دهی آنلاین
        </div>

        <div style={styles.navLinks}>

          <span style={styles.link} onClick={() => navigate("/patient-dashboard")}>
            داشبورد
          </span>

          <span style={styles.link} onClick={() => navigate("/doctors-list")}>
            پزشکان
          </span>

          <span style={styles.link} onClick={() => navigate("/patient-appointments")}>
            نوبت‌های من
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

        <div style={styles.card}>

          <h2 style={styles.title}>
            پروفایل بیمار
          </h2>

          <form onSubmit={handleSave} style={styles.form}>


            <div style={styles.avatarWrapper}>

              {profileImage && !(profileImage instanceof File) &&
                <img src={profileImage} style={styles.avatarImg} alt="profile"/>
              }

              {profileImage instanceof File &&
                <img src={URL.createObjectURL(profileImage)} style={styles.avatarImg} alt="profile"/>
              }

              <input type="file" onChange={handleImage} />

            </div>


            <label>نام</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              style={styles.input}
            />

            <label>نام خانوادگی</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              style={styles.input}
            />

            <label>شماره تلفن</label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              style={styles.input}
            />

            


            <label>کد ملی</label>
            <input value={patient.national_id} disabled style={styles.inputDisabled}/>

            <label>شماره پرونده</label>
            <input value={patient.id} disabled style={styles.inputDisabled}/>



            <button type="submit" style={styles.saveBtn}>
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>

          </form>

        </div>

      </div>

    </div>

  );
}

const styles = {

pageBackground:{
minHeight:"100vh",
background:"radial-gradient(circle,#f0f9ff,#cbebff)",
direction:"rtl"
},

navbar:{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"15px 60px",
background:"#fff",
boxShadow:"0 4px 12px rgba(0,0,0,0.05)"
},

logo:{
fontWeight:"bold",
fontSize:"22px",
color:"#007080"
},

navLinks:{
display:"flex",
gap:"20px",
alignItems:"center"
},

link:{
cursor:"pointer",
color:"#555"
},

activeLink:{
color:"#00897b",
fontWeight:"bold",
borderBottom:"2px solid #00897b"
},

logoutBtn: {
  backgroundColor: "#e53935",
  color: "#fff",
  border: "none",
  padding: "10px 22px",
  borderRadius: "12px",
  fontWeight: "bold",
  cursor: "pointer"
},

container:{
maxWidth:"700px",
margin:"40px auto"
},

card:{
background:"#fff",
padding:"40px",
borderRadius:"20px",
boxShadow:"0 10px 25px rgba(0,0,0,0.05)"
},

title:{
textAlign:"center",
color:"#007080",
marginBottom:"30px"
},

form:{
display:"flex",
flexDirection:"column",
gap:"15px"
},

input:{
padding:"10px",
borderRadius:"10px",
border:"1px solid #ccc"
},

inputDisabled:{
padding:"10px",
borderRadius:"10px",
border:"1px solid #ddd",
background:"#f5f5f5"
},

avatarWrapper:{
textAlign:"center",
marginBottom:"20px"
},

avatarImg:{
width:"120px",
height:"120px",
borderRadius:"50%",
objectFit:"cover",
marginBottom:"10px"
},

saveBtn:{
marginTop:"20px",
padding:"12px",
background:"#00897b",
color:"#fff",
border:"none",
borderRadius:"10px",
cursor:"pointer"
}

};

export default PatientProfile;
