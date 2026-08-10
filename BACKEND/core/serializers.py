# core/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SerialKey, Shop, AuditLog
from datetime import timedelta
from django.utils import timezone


# Use the active user model (Your CustomUser)
User = get_user_model()

class SerialKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = SerialKey
        # ADDED: allow_inventory, allow_hr, allow_finance
        fields = ['key', 'start_date', 'end_date', 'is_valid', 'allow_inventory', 'allow_hr', 'allow_finance']

from django.contrib.auth import get_user_model

class ShopEmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = get_user_model()
        fields = ['id', 'phone_number', 'email', 'first_name', 'last_name', 'role', 'password', 'is_active']
        
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        
        # Security: A shop admin cannot create another 'ADMIN'. Max role is 'MANAGER'.
        if validated_data.get('role') == 'ADMIN':
            validated_data['role'] = 'MANAGER'
            
        user = super().create(validated_data)
        if password:
            user.set_password(password) # Securely hash the password
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        if validated_data.get('role') == 'ADMIN':
            validated_data['role'] = 'MANAGER'
            
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user_name', 'action', 'details', 'created_at']

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.phone_number
        return "System / Deleted User"

class UserSerializer(serializers.ModelSerializer):
    serial_key = SerialKeySerializer(read_only=True)

    class Meta:
        model = User
        # CHANGED: Added role and employer_shop
        fields = ['id', 'phone_number', 'email', 'first_name', 'last_name', 'role', 'employer_shop', 'serial_key']

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    shop_name = serializers.CharField(write_only=True, required=False, default="My Shop")

    class Meta:
        model = User
        fields = ['phone_number', 'password', 'confirm_password', 'shop_name']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        shop_name = validated_data.pop('shop_name', "My Shop")
        
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            role='ADMIN'
        )
        
        Shop.objects.create(owner=user, name=shop_name)
        
        now = timezone.now()
        SerialKey.objects.create(
            user=user,
            start_date=now,
            end_date=now + timedelta(days=3),
            allow_inventory=True,
            allow_hr=True,
            allow_finance=True
        )
        
        return user