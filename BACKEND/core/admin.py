from django.contrib import admin
from .models import SerialKey

@admin.register(SerialKey)
class SerialKeyAdmin(admin.ModelAdmin):
    list_display = ('user', 'key', 'start_date', 'end_date', 'is_active_status')
    search_fields = ('user__username', 'user__email', 'key')
    list_filter = ('start_date', 'end_date')
    readonly_fields = ('key',) # Make key read-only after creation if you want

    def is_active_status(self, obj):
        return obj.is_valid
    is_active_status.boolean = True # Shows a nice Green Check / Red X icon
    is_active_status.short_description = 'Active?'