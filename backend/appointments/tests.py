from datetime import date, time, timedelta
import threading

from django.contrib.auth.models import User
from django.test import TransactionTestCase
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from accounts.models import PatientProfile, DoctorProfile
from appointments.models import Appointment, DoctorAvailability


class AppointmentTests(APITestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            username="patient@test.com",
            email="patient@test.com",
            password="StrongPass123"
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            phone_number="09120000001",
            first_name="Ali",
            last_name="Patient",
            national_id="5555555555",
            birth_date=date(2000, 1, 1)
        )

        self.doctor_user = User.objects.create_user(
            username="doctor@test.com",
            email="doctor@test.com",
            password="StrongPass123"
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            phone_number="09120000002",
            first_name="Reza",
            last_name="Doctor",
            medical_license_number="DOC111",
            specialty="Cardiology",
            bio="bio"
        )

        self.create_url = "/api/appointments/appointments/"
        self.today = date.today()

    def test_patient_can_create_appointment(self):
        """
        Test Case: Patient creates an appointment successfully

        Preconditions:
            - Patient user is authenticated.
            - Doctor exists.

        Steps:
            1. Send appointment creation request with valid data.

        Expected Result:
            - Response status is 201.
            - Appointment is created successfully.
            - Appointment status is confirmed.
        """
        self.client.force_authenticate(user=self.patient_user)

        payload = {
            "doctor": self.doctor_profile.id,
            "appointment_date": str(self.today),
            "appointment_time": "10:00:00"
        }

        response = self.client.post(self.create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "create failed")
        self.assertEqual(Appointment.objects.count(), 1, "appointment not created")

        appointment = Appointment.objects.first()
        self.assertEqual(appointment.status, "confirmed", "status not confirmed")
        self.assertEqual(appointment.patient, self.patient_profile, "wrong patient")

    def test_doctor_cannot_create_appointment(self):
        """
        Test Case: Doctor cannot create an appointment

        Preconditions:
            - Doctor user is authenticated.

        Steps:
            1. Send appointment creation request as doctor.

        Expected Result:
            - Response status is 403.
        """
        self.client.force_authenticate(user=self.doctor_user)

        payload = {
            "doctor": self.doctor_profile.id,
            "appointment_date": str(self.today),
            "appointment_time": "10:00:00"
        }

        response = self.client.post(self.create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, "doctor booked appointment")

    def test_prevent_double_booking(self):
        """
        Test Case: Prevent double booking for the same slot

        Preconditions:
            - One appointment already exists for the selected doctor, date, and time.

        Steps:
            1. Create an appointment for a slot.
            2. Try to create another appointment for the same slot.

        Expected Result:
            - Response status is 400.
            - Second booking is rejected.
        """
        Appointment.objects.create(
            patient=self.patient_profile,
            doctor=self.doctor_profile,
            appointment_date=self.today,
            appointment_time=time(10, 0),
            status="confirmed"
        )

        second_user = User.objects.create_user(
            username="patient2@test.com",
            email="patient2@test.com",
            password="StrongPass123"
        )
        second_profile = PatientProfile.objects.create(
            user=second_user,
            phone_number="09120000003",
            first_name="Sara",
            last_name="Patient",
            national_id="6666666666",
            birth_date=date(2001, 1, 1)
        )

        self.client.force_authenticate(user=second_user)
        payload = {
            "doctor": self.doctor_profile.id,
            "appointment_date": str(self.today),
            "appointment_time": "10:00:00"
        }

        response = self.client.post(self.create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "double booking allowed")

    def test_patient_can_cancel_own_appointment(self):
        """
        Test Case: Patient cancels own appointment

        Preconditions:
            - Patient user is authenticated.
            - Appointment exists for the patient.

        Steps:
            1. Send cancel request for the appointment.

        Expected Result:
            - Response status is 200.
            - Appointment status changes to cancelled.
        """
        self.client.force_authenticate(user=self.patient_user)

        appointment = Appointment.objects.create(
            patient=self.patient_profile,
            doctor=self.doctor_profile,
            appointment_date=self.today,
            appointment_time=time(11, 0),
            status="confirmed"
        )

        url = f"/api/appointments/appointments/{appointment.id}/cancel/"
        response = self.client.post(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, "cancel failed")
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, "cancelled", "status not cancelled")

    def test_cannot_cancel_twice(self):
        """
        Test Case: Prevent cancelling an appointment twice

        Preconditions:
            - Patient user is authenticated.
            - Appointment is already cancelled.

        Steps:
            1. Send cancel request for an already cancelled appointment.

        Expected Result:
            - Response status is 400.
        """
        self.client.force_authenticate(user=self.patient_user)

        appointment = Appointment.objects.create(
            patient=self.patient_profile,
            doctor=self.doctor_profile,
            appointment_date=self.today,
            appointment_time=time(12, 0),
            status="cancelled"
        )

        url = f"/api/appointments/appointments/{appointment.id}/cancel/"
        response = self.client.post(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "double cancel allowed")

    def test_doctor_can_cancel_appointment(self):
        """
        Test Case: Doctor cancels an appointment

        Preconditions:
            - Doctor user is authenticated.
            - Appointment exists.

        Steps:
            1. Send doctor cancel request for the appointment.

        Expected Result:
            - Response status is 200.
            - Appointment status changes to cancelled.
        """
        appointment = Appointment.objects.create(
            patient=self.patient_profile,
            doctor=self.doctor_profile,
            appointment_date=self.today,
            appointment_time=time(13, 0),
            status="confirmed"
        )

        self.client.force_authenticate(user=self.doctor_user)
        url = f"/api/appointments/appointments/{appointment.id}/cancel_by_doctor/"
        response = self.client.post(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, "doctor cancel failed")
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, "cancelled", "doctor cancel not saved")

    def test_available_slots_returns_free_times(self):
        """
        Test Case: Get available appointment slots

        Preconditions:
            - Patient user is authenticated.
            - Doctor availability exists.
            - One slot is already booked.

        Steps:
            1. Create doctor availability for a day.
            2. Create one booked appointment in that range.
            3. Request available slots.

        Expected Result:
            - Response status is 200.
            - Free slot is included in response.
            - Booked slot is not included in response.
        """
        self.client.force_authenticate(user=self.patient_user)

        target_date = date.today()
        day_of_week = target_date.weekday()

        DoctorAvailability.objects.create(
            doctor=self.doctor_profile,
            day_of_week=day_of_week,
            start_time=time(9, 0),
            end_time=time(10, 0)
        )

        Appointment.objects.create(
            patient=self.patient_profile,
            doctor=self.doctor_profile,
            appointment_date=target_date,
            appointment_time=time(9, 0),
            status="confirmed"
        )

        url = f"/api/appointments/appointments/available_slots/?doctor={self.doctor_profile.id}&date={target_date}"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK, "slots failed")
        self.assertIn("09:30", response.data["available_slots"], "free slot missing")
        self.assertNotIn("09:00", response.data["available_slots"], "booked slot shown")

    def test_available_slots_requires_doctor_and_date(self):
        """
        Test Case: Available slots request requires doctor and date

        Preconditions:
            - Patient user is authenticated.

        Steps:
            1. Send available slots request without required query params.

        Expected Result:
            - Response status is 400.
        """
        self.client.force_authenticate(user=self.patient_user)
        response = self.client.get("/api/appointments/appointments/available_slots/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, "missing params allowed")


class DoctorAvailabilityTests(APITestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            username="patientx@test.com",
            email="patientx@test.com",
            password="StrongPass123"
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            phone_number="09120000010",
            first_name="Patient",
            last_name="X",
            national_id="7777777777",
            birth_date=date(2000, 2, 2)
        )

        self.doctor_user = User.objects.create_user(
            username="doctorx@test.com",
            email="doctorx@test.com",
            password="StrongPass123"
        )
        self.doctor_profile = DoctorProfile.objects.create(
            user=self.doctor_user,
            phone_number="09120000011",
            first_name="Doctor",
            last_name="X",
            medical_license_number="DOC222",
            specialty="Neuro",
            bio="bio"
        )

        self.url = "/api/appointments/availability/"

    def test_doctor_can_create_availability(self):
        """
        Test Case: Doctor creates availability successfully

        Preconditions:
            - Doctor user is authenticated.

        Steps:
            1. Send availability creation request with valid data.

        Expected Result:
            - Response status is 201.
            - Availability is saved successfully.
        """
        self.client.force_authenticate(user=self.doctor_user)
        payload = {
            "day_of_week": 0,
            "start_time": "09:00:00",
            "end_time": "12:00:00"
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "availability create failed")
        self.assertEqual(DoctorAvailability.objects.count(), 1, "availability not saved")

    def test_patient_cannot_create_availability(self):
        """
        Test Case: Patient cannot create doctor availability

        Preconditions:
            - Patient user is authenticated.

        Steps:
            1. Send availability creation request as patient.

        Expected Result:
            - Response status is 403.
        """
        self.client.force_authenticate(user=self.patient_user)
        payload = {
            "day_of_week": 0,
            "start_time": "09:00:00",
            "end_time": "12:00:00"
        }

        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN, "patient created availability")


class ConcurrentBookingTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.patient1_user = User.objects.create_user(
            username="p1@test.com",
            email="p1@test.com",
            password="StrongPass123"
        )
        self.patient1 = PatientProfile.objects.create(
            user=self.patient1_user,
            phone_number="09130000001",
            first_name="P1",
            last_name="A",
            national_id="8888888888",
            birth_date=date(2000, 1, 1)
        )

        self.patient2_user = User.objects.create_user(
            username="p2@test.com",
            email="p2@test.com",
            password="StrongPass123"
        )
        self.patient2 = PatientProfile.objects.create(
            user=self.patient2_user,
            phone_number="09130000002",
            first_name="P2",
            last_name="B",
            national_id="9999999999",
            birth_date=date(2000, 1, 2)
        )

        self.doctor_user = User.objects.create_user(
            username="doc@test.com",
            email="doc@test.com",
            password="StrongPass123"
        )
        self.doctor = DoctorProfile.objects.create(
            user=self.doctor_user,
            phone_number="09130000003",
            first_name="Doc",
            last_name="C",
            medical_license_number="DOC333",
            specialty="ENT",
            bio="bio"
        )

        self.url = "/api/appointments/appointments/"
        self.target_date = str(date.today())
        self.results = []

    def book_slot(self, username, password):
        client = APIClient()
        response = client.post("/api/accounts/login/", {
            "username": username,
            "password": password
        }, format="json")

        token = response.data["access"]
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        res = client.post(self.url, {
            "doctor": self.doctor.id,
            "appointment_date": self.target_date,
            "appointment_time": "15:00:00"
        }, format="json")

        self.results.append(res.status_code)

    def test_concurrent_booking_same_slot(self):
        """
        Test Case: Prevent concurrent booking of the same slot

        Preconditions:
            - Two patient users exist.
            - Both try to book the same doctor, date, and time.

        Steps:
            1. Start two booking requests at the same time.
            2. Wait for both requests to finish.

        Expected Result:
            - At most one booking succeeds.
            - Race condition does not create duplicate appointments.
        """
        t1 = threading.Thread(target=self.book_slot, args=("p1@test.com", "StrongPass123"))
        t2 = threading.Thread(target=self.book_slot, args=("p2@test.com", "StrongPass123"))

        t1.start()
        t2.start()
        t1.join()
        t2.join()

        success_count = self.results.count(201)
        self.assertLessEqual(success_count, 1, "race condition detected")
