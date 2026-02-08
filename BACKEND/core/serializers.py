from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SerialKey

# Use the active user model (Your CustomUser)
User = get_user_model()

class SerialKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = SerialKey
        fields = ['key', 'start_date', 'end_date', 'is_valid']

class UserSerializer(serializers.ModelSerializer):
    serial_key = SerialKeySerializer(read_only=True)

    class Meta:
        model = User
        # CHANGED: 'username' -> 'phone_number'
        fields = ['id', 'phone_number', 'email', 'first_name', 'last_name', 'serial_key']