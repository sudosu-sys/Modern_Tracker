import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class SerialKey(models.Model):
    user = models.OneToOneField(
        User, 
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
        # Only generate if key is missing
        if not self.key:
            # 1. Generate a raw UUID, remove dashes, make uppercase
            raw_uuid = str(uuid.uuid4()).replace('-', '').upper()
            
            # 2. Take the first 16 characters
            raw = raw_uuid[:16]
            
            # 3. Format as XXXX-XXXX-XXXX-XXXX
            self.key = f"{raw[:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"
            
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        now = timezone.now()
        # Ensure start_date and end_date are timezone-aware if 'now' is
        return self.start_date <= now <= self.end_date

    def __str__(self):
        # If there is a user, show their name. If not, show "Unassigned".
        user_display = self.user.username if self.user else "Unassigned"
        return f"{user_display} - {self.key}"