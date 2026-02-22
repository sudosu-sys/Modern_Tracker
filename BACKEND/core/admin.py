from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import SerialKey, CustomUser

# 1. Register the new CustomUser Model
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    
    # Customize the list view to show phone numbers
    list_display = ('phone_number', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('phone_number', 'email', 'first_name', 'last_name')
    ordering = ('phone_number',)

    # We must define 'fieldsets' because the default UserAdmin expects a 'username' field
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # We also need to update the "Add User" form configuration
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password'), # removed username
        }),
    )

# 2. Update SerialKey Admin
@admin.register(SerialKey)
class SerialKeyAdmin(admin.ModelAdmin):
    # Added 'allow_inventory' to the display list
    list_display = ('user', 'key', 'start_date', 'end_date', 'allow_inventory', 'is_active_status')
    
    # This makes the switch toggleable directly from the list view!
    list_editable = ('allow_inventory',)
    
    # CHANGED: Replaced 'user__username' with 'user__phone_number'
    search_fields = ('user__phone_number', 'user__email', 'key')
    
    list_filter = ('start_date', 'end_date', 'allow_inventory') # Added filter for inventory access
    readonly_fields = ('key',)

    def is_active_status(self, obj):
        return obj.is_valid
    is_active_status.boolean = True
    is_active_status.short_description = 'Active?'