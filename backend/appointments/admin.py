from django.contrib import admin
from .models import DoctorAvailability, Appointment


@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'get_day_name', 'date', 'start_time', 'end_time')
    list_filter = ('day_of_week', 'doctor', 'date')
    search_fields = ('doctor__user__username', 'doctor__user__first_name', 'doctor__user__last_name')

    def get_day_name(self, obj):
        # اول چک کن که آیا روز هفته اصلا مقدار دارد یا نه
        if obj.day_of_week is not None:
            days = ['دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه', 'یکشنبه']
            # مدیریت خطای احتمالی اگر عدد خارج از رنج 0-6 بود
            try:
                return days[obj.day_of_week]
            except IndexError:
                return "نامشخص"
        # اگر روز هفته خالی بود یعنی احتمالا تاریخ دارد
        return "--- (تاریخ خاص)"
    
    get_day_name.short_description = 'روز هفته'



@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'appointment_date', 'appointment_time', 'status', 'created_at')
    list_filter = ('status', 'appointment_date', 'doctor')
    search_fields = (
        'patient__user__username',
        'patient__user__first_name',
        'patient__user__last_name',
        'doctor__user__username',
        'doctor__user__first_name',
        'doctor__user__last_name',
    )
    ordering = ('-appointment_date', '-appointment_time')
