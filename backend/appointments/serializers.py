from rest_framework import serializers
from .models import DoctorAvailability, Appointment


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ['id', 'doctor', 'day_of_week', 'date', 'start_time', 'end_time']
        read_only_fields = ['id', 'doctor']


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    doctor_specialty = serializers.SerializerMethodField()
    doctor_profile_image = serializers.ImageField(source='doctor.profile_image', read_only=True)

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"
        
    def get_doctor_specialty(self, obj):
        return f"{obj.doctor.specialty}"
    

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"


    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'doctor',
            'appointment_date',
            'appointment_time',
            'status',
            'created_at',
            'doctor_name',
            'patient_name',
            'doctor_specialty',
            'doctor_profile_image'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'patient',
            'status',
            'doctor'
        ]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'doctor',
            'appointment_date',
            'appointment_time'
        ]

    def create(self, validated_data):
        validated_data['status'] = 'confirmed'
        validated_data['patient'] = self.context['request'].user.patientprofile
        return super().create(validated_data)

    def validate(self, data):
        existing = Appointment.objects.filter(
            doctor=data['doctor'],
            appointment_date=data['appointment_date'],
            appointment_time=data['appointment_time'],
            status='confirmed'
        ).exists()

        if existing:
            raise serializers.ValidationError(
                "این زمان قبلاً رزرو شده است"
            )

        return data

from accounts.models import * 

class DoctorProfileSerializer(serializers.ModelSerializer):
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'phone_number', 
            'medical_license_number', 
            'specialty', 
            'bio', 
            'email', 
            'profile_image'
        ]


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            "id",
            "first_name",
            "last_name",
            "phone_number",
            "birth_date",
            "national_id",
            "profile_image",
        ]

        read_only_fields = [
            "national_id",
            "id",
            "birth_date",
        ]


