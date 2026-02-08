import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.conf import settings  # We use this to refer to the user model

# 1. Define the Manager to handle creating users with phone_number
class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('The Phone Number field must be set')
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(phone_number, password, **extra_fields)

# 2. Define the Custom User Model
class CustomUser(AbstractUser):
    username = None  # Remove the username field
    phone_number = models.CharField(max_length=15, unique=True)

    USERNAME_FIELD = 'phone_number'  # Login with this
    REQUIRED_FIELDS = []  # No other fields required for superuser creation

    objects = CustomUserManager()

    def __str__(self):
        return self.phone_number

# 3. Update SerialKey to link to the new Custom User
class SerialKey(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # CHANGED: Reference the custom model dynamically
        on_delete=models.CASCADE, 
        related_name='serial_key',
        null=True, 
        blank=True
    )
    
    key = models.CharField(max_length=100, unique=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.key:
            raw_uuid = str(uuid.uuid4()).replace('-', '').upper()
            raw = raw_uuid[:16]
            self.key = f"{raw[:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"
            
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        now = timezone.now()
        return self.start_date <= now <= self.end_date

    def __str__(self):
        # CHANGED: Use phone_number instead of username
        user_display = self.user.phone_number if self.user else "Unassigned"
        return f"{user_display} - {self.key}"