from django.contrib import admin
from django import forms
from django.contrib.auth.models import User
from .models import PatientProfile, DoctorProfile

class DoctorProfileForm(forms.ModelForm):
    username = forms.CharField(max_length=150, required=True, label="نام کاربری")
    password = forms.CharField(widget=forms.PasswordInput, required=True, label="رمز عبور")
    
    class Meta:
        model = DoctorProfile
        fields = '__all__'
        exclude = ['user']  # فیلد user رو مخفی میکنیم
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # اگه داریم رکورد قبلی رو ویرایش میکنیم، username و password نمیخوایم
        if self.instance.pk:
            self.fields['username'].required = False
            self.fields['password'].required = False
            self.fields['username'].widget = forms.HiddenInput()
            self.fields['password'].widget = forms.HiddenInput()
    
    def save(self, commit=True):
        # فقط موقع ایجاد دکتر جدید یوزر بساز
        if not self.instance.pk:
            username = self.cleaned_data.get('username')
            password = self.cleaned_data.get('password')
            
            # یوزر رو میسازیم
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.set_password(password)
                user.save()
            
            # پروفایل دکتر رو به یوزر وصل میکنیم
            doctor_profile = super().save(commit=False)
            doctor_profile.user = user
            if commit:
                doctor_profile.save()
            return doctor_profile
        else:
            # موقع ویرایش فقط پروفایل رو سیو کن
            return super().save(commit=commit)

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    form = DoctorProfileForm
    list_display = ['user', 'id']  

# ثبت مدل بیمار به حالت ساده
admin.site.register(PatientProfile)
