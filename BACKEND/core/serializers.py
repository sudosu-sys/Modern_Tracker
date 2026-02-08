from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SerialKey

class SerialKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = SerialKey
        fields = ['key', 'start_date', 'end_date', 'is_valid']

class UserSerializer(serializers.ModelSerializer):
    # This matches the 'related_name' in your OneToOneField
    serial_key = SerialKeySerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'serial_key']