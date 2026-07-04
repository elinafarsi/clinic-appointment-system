from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PatientProfile
from django.db import transaction
import re


class RegisterSerializer(serializers.ModelSerializer):
    # فیلدهای اضافه برای پروفایل و تایید پسورد
    phone_number = serializers.CharField(write_only=True, required=True, allow_blank=False)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    national_id = serializers.CharField(write_only=True)
    birth_date = serializers.DateField(write_only=True)
    
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True) # اضافه شد

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'phone_number', 
            'first_name', 'last_name', 'national_id', 'birth_date'
        ]

    def validate(self, attrs):
        # چک کردن تطابق دو پسورد
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({"password2": "رمز عبور با تکرار آن مطابقت ندارد."})
        return attrs

    def validate_phone_number(self, value):
        if PatientProfile.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("این شماره موبایل قبلاً ثبت شده است.")
        if not re.match(r'^09\d{9}$', value):
            raise serializers.ValidationError("شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.")
        return value

    def validate_national_id(self, value):
        if PatientProfile.objects.filter(national_id=value).exists():
            raise serializers.ValidationError("این کد ملی قبلاً ثبت شده است.")
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("کد ملی باید دقیقاً ۱۰ رقم باشد.")
        return value

    def create(self, validated_data):
        # حذف فیلدهایی که مربوط به مدل User نیستند
        validated_data.pop('password2') 
        p_data = {
            'phone_number': validated_data.pop('phone_number'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'national_id': validated_data.pop('national_id'),
            'birth_date': validated_data.pop('birth_date'),
        }

        try:
            with transaction.atomic(): 
                user = User.objects.create_user(
                    username=validated_data['email'],
                    email=validated_data['email'],
                    password=validated_data['password']
                )
                PatientProfile.objects.create(user=user, **p_data)
                return user
        except Exception as e:
            raise serializers.ValidationError({"detail": str(e)})



from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user

        if hasattr(user, "doctorprofile"):
            data["role"] = "doctor"
        elif hasattr(user, "patientprofile"):
            data["role"] = "patient"
        else:
            data["role"] = "unknown"

        return data

