from django.urls import path
from .views import RegisterView, DoctorListView,PatientListView, MyPatientProfileView, CustomTokenObtainPairView, MyDoctorProfileView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), # برای لاگین
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # برای تمدید توکن
    path('doctors/', DoctorListView.as_view(), name='doctors-list'),
    path('patients/', PatientListView.as_view(), name='patients-list'),
    path('me/', MyPatientProfileView.as_view(), name='patient-me'),
    path('doctor/me/', MyDoctorProfileView.as_view(), name='doctor-me'),
]
