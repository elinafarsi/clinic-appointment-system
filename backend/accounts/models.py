from django.db import models
from django.contrib.auth.models import User

from django.core.validators import RegexValidator

national_code_validator = RegexValidator(
    regex=r'^\d{10}$',
    message='کد ملی باید دقیقاً ۱۰ رقم باشد.'
)

phone_validator = RegexValidator(
    regex=r'^09\d{9}$',
    message='شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.'
)


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=11, unique=True, validators=[phone_validator])
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    national_id = models.CharField(max_length=10,validators=[national_code_validator], unique=True)
    birth_date = models.DateField()
    profile_image = models.ImageField(upload_to="patients/", null=True, blank=True)


    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=11, unique=True,validators=[phone_validator])
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    medical_license_number = models.CharField(max_length=20, unique=True)
    specialty = models.CharField(max_length=100)
    bio = models.TextField()
    profile_image = models.ImageField(upload_to="doctors/", null=True, blank=True)


    def __str__(self):
        return f"Dr. {self.last_name}"
