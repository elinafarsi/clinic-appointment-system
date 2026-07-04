from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PatientProfile
from django.db import transaction
import re

class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(write_only=True, required=True, allow_blank=False)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    national_id = serializers.CharField(write_only=True)
    birth_date = serializers.DateField(write_only=True)
    profile_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = [
            'email',
            'password',
            'phone_number',
            'first_name',
            'last_name',
            'national_id',
            'birth_date',
            'profile_image'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_phone_number(self, value):
        # ۱. چک کردن تکراری نبودن
        if PatientProfile.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("این شماره موبایل قبلاً ثبت شده است.")
        
        # ۲. چک کردن فرمت ۱۱ رقم و شروع با ۰۹
        if not re.match(r'^09\d{9}$', value):
            raise serializers.ValidationError("شماره موبایل معتبر نیست. باید ۱۱ رقم باشد و با ۰۹ شروع شود.")
            
        return value

    def validate_national_id(self, value):
        # ۱. چک کردن تکراری نبودن (که قبلاً داشتی)
        if PatientProfile.objects.filter(national_id=value).exists():
            raise serializers.ValidationError("این کد ملی قبلاً ثبت شده است.")
        
        # ۲. چک کردن دقیقاً ۱۰ رقم بودن (این همون چیزیه که کمه!)
        if not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("کد ملی باید دقیقاً ۱۰ رقم عددی باشد.")
            
        return value

    def create(self, validated_data):
        p_data = {
            'phone_number': validated_data.pop('phone_number'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'national_id': validated_data.pop('national_id'),
            'birth_date': validated_data.pop('birth_date'),
            'profile_image': validated_data.pop('profile_image', None),
        }

        try:
            with transaction.atomic(): 
                # مرحله ۱: ساخت یوزر
                user = User.objects.create_user(
                    username=validated_data['email'],
                    email=validated_data['email'],
                    password=validated_data['password']
                )

                # مرحله ۲: ساخت پروفایل
                PatientProfile.objects.create(user=user, **p_data)
                
                return user
        except Exception as e:
            # اگه هر اروری (مثل تکراری بودن فیلدها در سطح دیتابیس) پیش بیاد
            # تراکنش کلاً لغو می‌شه و یوزر "نیمه‌کاره" ذخیره نمی‌شه.
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

