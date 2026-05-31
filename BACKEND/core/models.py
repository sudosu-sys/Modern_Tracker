# core/models.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.conf import settings 

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
    ROLE_CHOICES = [
        ('ADMIN', 'Shop Admin'),
        ('MANAGER', 'Manager'),
        ('CLERK', 'Inventory Clerk'),
        ('CASHIER', 'Cashier'),
    ]

    username = None  
    phone_number = models.CharField(max_length=15, unique=True)
    
    # New Role & Tenant fields
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ADMIN')
    employer_shop = models.ForeignKey('core.Shop', on_delete=models.SET_NULL, null=True, blank=True, related_name='shop_employees')

    USERNAME_FIELD = 'phone_number'  
    REQUIRED_FIELDS = []  

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.phone_number} ({self.role})"

# --- NEW SHOP MODEL (MULTI-TENANCY BASE) ---
class Shop(models.Model):
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,  
        on_delete=models.CASCADE, 
        related_name='shop'
    )
    name = models.CharField(max_length=255, default="My Shop")
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# --- 2.5 NEW AUDIT TRAIL LOG ---
class AuditLog(models.Model):
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=50) # e.g., 'ADDED_ITEM', 'SOLD_ITEM'
    details = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.shop.name} - {self.action} by {self.user}"

# 3. Update SerialKey to link to the new Custom User
class SerialKey(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  
        on_delete=models.CASCADE, 
        related_name='serial_key',
        null=True, 
        blank=True
    )
    
    key = models.CharField(max_length=100, unique=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # --- Feature Switches ---
    allow_inventory = models.BooleanField(default=False, help_text="Toggle this to allow access to the Inventory App")
    allow_hr = models.BooleanField(default=False, help_text="Toggle this to allow access to the HR & Payroll App")
    allow_finance = models.BooleanField(default=False, help_text="Toggle this to allow access to the Finance & Expense App")

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
        user_display = self.user.phone_number if self.user else "Unassigned"
        return f"{user_display} - {self.key}"