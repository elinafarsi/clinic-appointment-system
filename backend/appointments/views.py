from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta

from .models import DoctorAvailability, Appointment
from .serializers import (
    DoctorAvailabilitySerializer, 
    AppointmentSerializer,
    AppointmentCreateSerializer,
)
from .permissions import IsDoctor, IsPatient
from accounts.models import DoctorProfile

class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    """
    پزشک: اضافه/حذف slot‌های خالی
    بیمار: فقط مشاهده
    """
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, 'doctorprofile'):
            # پزشک فقط slot‌های خودش رو می‌بینه
            return DoctorAvailability.objects.filter(doctor=self.request.user.doctorprofile)
        else:
            # بیمار همه رو می‌بینه
            return DoctorAvailability.objects.all()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsDoctor()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctorprofile)


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    بیمار: رزرو، لغو، مشاهده نوبت‌های خودش
    پزشک: مشاهده نوبت‌های خودش، تغییر وضعیت
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'doctorprofile'):
            return Appointment.objects.filter(doctor=user.doctorprofile)
        elif hasattr(user, 'patientprofile'):
            return Appointment.objects.filter(patient=user.patientprofile)
        return Appointment.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def create(self, request, *args, **kwargs):
        if not hasattr(request.user, 'patientprofile'):
            return Response(
                {"error": "برای رزرو ابتدا ورود کنید."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        appointment = serializer.save()

        return Response(
            AppointmentSerializer(
                appointment,
                context={'request': request}
            ).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[IsPatient])
    def cancel(self, request, pk=None):
        """بیمار نوبت خودش رو لغو می‌کنه"""
        appointment = self.get_object()
        
        if appointment.status == 'cancelled':
            return Response({"error": "این نوبت قبلاً لغو شده"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        appointment.status = 'cancelled'
        appointment.save()
        
        return Response({"message": "نوبت لغو شد"})



    @action(detail=True, methods=['post'], permission_classes=[IsDoctor])
    def cancel_by_doctor(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        return Response({"message": "نوبت توسط پزشک لغو شد"})

    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """لیست slot‌های خالی (برای بیمار) با پشتیبانی از تاریخ خاص و روز هفته"""
        doctor_id = request.query_params.get('doctor')
        date_str = request.query_params.get('date') 
        
        if not doctor_id or not date_str:
            return Response({"error": "doctor و date الزامیه"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except Exception as e:
            return Response({"error": "اطلاعات نامعتبر"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # پیدا کردن روز هفته (جنگو/پایتون: 0=دوشنبه، ..., 6=یکشنبه)
        day_of_week = target_date.weekday()
        
        # ۱. پیدا کردن زمان‌هایی که برای این تاریخ "خاص" ست شده‌اند
        specific_availabilities = DoctorAvailability.objects.filter(
            doctor=doctor,
            date=target_date
        )
        
        # ۲. پیدا کردن زمان‌های "تکرار شونده" برای این روز هفته (به شرطی که تاریخ خاص نداشته باشند)
        weekly_availabilities = DoctorAvailability.objects.filter(
            doctor=doctor,
            day_of_week=day_of_week,
            date__isnull=True
        )
        
        # ترکیب هر دو لیست (زمان‌های خاص + زمان‌های هفتگی)
        availabilities = specific_availabilities | weekly_availabilities
        
        # ۳. پیدا کردن نوبت‌هایی که قبلاً توسط بیماران رزرو شده‌اند در این تاریخ
        booked = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=target_date,
            status__in=['pending', 'confirmed']
        ).values_list('appointment_time', flat=True)
        
        free_slots = []
        
        # ۴. تولید اسلات‌های ۳۰ دقیقه‌ای بر اساس بازه‌های زمانی پیدا شده
        for avail in availabilities:
            current_time = avail.start_time
            while current_time < avail.end_time:
                # چک کردن اینکه این ساعت قبلاً رزرو نشده باشد
                if current_time not in booked:
                    free_slots.append(current_time.strftime('%H:%M'))
                
                current_time_dt = datetime.combine(target_date, current_time) + timedelta(minutes=30)
                
                if current_time_dt.time() > avail.end_time or current_time_dt.date() > target_date:
                    break
                current_time = current_time_dt.time()
        
        # حذف ساعت‌های تکراری (اگر هم در روز هفته و هم در تاریخ خاص بازه همپوشان داشتیم)
        free_slots = sorted(list(set(free_slots)))
        
        return Response({
            "doctor": f"{doctor.first_name} {doctor.last_name}",
            "date": date_str,
            "available_slots": free_slots
        })
