from datetime import date

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import PatientProfile, DoctorProfile


class RegisterTests(APITestCase):
    def setUp(self):
        self.url = "/api/accounts/register/"
        self.valid_payload = {
            "email": "patient1@test.com",
            "password": "StrongPass123",
            "password2": "StrongPass123",
            "phone_number": "09123456789",
            "first_name": "Ali",
            "last_name": "Ahmadi",
            "national_id": "1234567890",
            "birth_date": "2000-01-01",
        }

    def test_register_success(self):
        response = self.client.post(self.url, self.valid_payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "register failed")
        self.assertEqual(User.objects.count(), 1, "user not created")
        self.assertEqual(PatientProfile.objects.count(), 1, "profile not created")

    def test_register_password_mismatch(self):
        payload = self.valid_payload.copy()
        payload["password2"] = "WrongPass123"

        response = self.client.post(self.url, payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "bad password check")
        self.assertIn("password2", response.data, "password2 error missing")

    def test_register_duplicate_phone(self):
        user = User.objects.create_user(
            username="u1@test.com",
            email="u1@test.com",
            password="pass12345"
        )
        PatientProfile.objects.create(
            user=user,
            phone_number="09123456789",
            first_name="Test",
            last_name="User",
            national_id="1111111111",
            birth_date=date(2000, 1, 1)
        )

        response = self.client.post(self.url, self.valid_payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "duplicate phone allowed")
        self.assertIn("phone_number", response.data, "phone error missing")

    def test_register_duplicate_national_id(self):
        user = User.objects.create_user(
            username="u2@test.com",
            email="u2@test.com",
            password="pass12345"
        )
        PatientProfile.objects.create(
            user=user,
            phone_number="09999999999",
            first_name="Test",
            last_name="User",
            national_id="1234567890",
            birth_date=date(2000, 1, 1)
        )

        response = self.client.post(self.url, self.valid_payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "duplicate national id allowed")
        self.assertIn("national_id", response.data, "nid error missing")

    def test_register_invalid_phone(self):
        payload = self.valid_payload.copy()
        payload["phone_number"] = "123"

        response = self.client.post(self.url, payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "invalid phone allowed")
        self.assertIn("phone_number", response.data, "phone validation missing")

    def test_register_invalid_national_id(self):
        payload = self.valid_payload.copy()
        payload["national_id"] = "1234"

        response = self.client.post(self.url, payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "invalid nid allowed")
        self.assertIn("national_id", response.data, "nid validation missing")


class LoginTests(APITestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            username="patient@test.com",
            email="patient@test.com",
            password="StrongPass123"
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            phone_number="09111111111",
            first_name="Patient",
            last_name="One",
            national_id="2222222222",
            birth_date=date(2001, 1, 1)
        )

        self.doctor_user = User.objects.create_user(
            username="doctor@test.com",
            email="doctor@test.com",
            password="StrongPass123"
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            phone_number="09222222222",
            first_name="Doctor",
            last_name="One",
            medical_license_number="DOC123",
            specialty="Cardiology",
            bio="bio"
        )

        self.url = "/api/accounts/login/"

    def test_login_patient_role(self):
        response = self.client.post(self.url, {
            "username": "patient@test.com",
            "password": "StrongPass123"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, "patient login failed")
        self.assertEqual(response.data["role"], "patient", "wrong patient role")
        self.assertIn("access", response.data, "access missing")

    def test_login_doctor_role(self):
        response = self.client.post(self.url, {
            "username": "doctor@test.com",
            "password": "StrongPass123"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, "doctor login failed")
        self.assertEqual(response.data["role"], "doctor", "wrong doctor role")
        self.assertIn("access", response.data, "access missing")


class ProfileTests(APITestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            username="patient2@test.com",
            email="patient2@test.com",
            password="StrongPass123"
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            phone_number="09333333333",
            first_name="Sara",
            last_name="Karimi",
            national_id="3333333333",
            birth_date=date(1999, 5, 5)
        )

        self.doctor_user = User.objects.create_user(
            username="doctor2@test.com",
            email="doctor2@test.com",
            password="StrongPass123"
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            phone_number="09444444444",
            first_name="Reza",
            last_name="Moradi",
            medical_license_number="DOC999",
            specialty="Dermatology",
            bio="doctor bio"
        )

    def test_patient_me_requires_auth(self):
        response = self.client.get("/api/accounts/me/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, "auth bypass")

    def test_patient_me_get(self):
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get("/api/accounts/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK, "patient me failed")
        self.assertEqual(response.data["first_name"], "Sara", "wrong profile data")

    def test_patient_me_update(self):
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.put("/api/accounts/me/", {
            "first_name": "NewName"
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, "update failed")
        self.patient_profile.refresh_from_db()
        self.assertEqual(self.patient_profile.first_name, "NewName", "name not updated")

    def test_doctor_me_get(self):
        self.client.force_authenticate(user=self.doctor_user)
        response = self.client.get("/api/accounts/doctor/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK, "doctor me failed")
        self.assertEqual(response.data["specialty"], "Dermatology", "wrong doctor data")
