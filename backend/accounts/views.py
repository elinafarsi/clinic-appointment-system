from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) 
    serializer_class = RegisterSerializer
    parser_classes = [MultiPartParser, FormParser]



from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


from .models import DoctorProfile
from appointments.serializers import *
from rest_framework import filters

class DoctorListView(generics.ListAPIView):
    queryset = DoctorProfile.objects.select_related('user').all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'specialty']

from .models import PatientProfile

class PatientListView(generics.ListAPIView):
    queryset = PatientProfile.objects.select_related('user').all()
    serializer_class = PatientProfileSerializer
    permission_classes = [AllowAny]  


from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

class MyPatientProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.patientprofile
            serializer = PatientProfileSerializer(profile)
            return Response(serializer.data)
        except PatientProfile.DoesNotExist:
            return Response({"error": "پروفایل یافت نشد"}, status=404)

    def put(self, request):
        try:
            profile = request.user.patientprofile
            serializer = PatientProfileSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except PatientProfile.DoesNotExist:
            return Response({"error": "پروفایل یافت نشد"}, status=404)

class MyDoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.doctorprofile
            serializer = DoctorProfileSerializer(profile)
            return Response(serializer.data)
        except DoctorProfile.DoesNotExist:
            return Response({"detail": "Doctor profile not found"}, status=404)
    
        # ویرایش و بروزرسانی اطلاعات پروفایل
    def put(self, request):
        try:
            profile = request.user.doctorprofile
        except DoctorProfile.DoesNotExist:
            return Response({"detail": "پروفایل پزشک یافت نشد."}, status=404)
        
        serializer = DoctorProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
