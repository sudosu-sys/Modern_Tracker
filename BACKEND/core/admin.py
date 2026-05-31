# core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import SerialKey, CustomUser, Shop

# --- CUSTOM FORMS FOR ADMIN ---
class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('phone_number',)

class CustomUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = CustomUser
        fields = '__all__'

# 1. Register the new CustomUser Model
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    
    # Added 'role' to the display list so you can see who is who
    list_display = ('phone_number', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    search_fields = ('phone_number', 'email', 'first_name', 'last_name')
    ordering = ('phone_number',)

    # ADDED: 'role' and 'employer_shop' to the edit screen
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Shop & Role', {'fields': ('role', 'employer_shop')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # FIXED: Django's creation form actually uses password1 and password2!
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password1', 'password2'), 
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

# 3. Register the new Shop Model
@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    search_fields = ('name', 'owner__phone_number', 'owner__email')
    list_filter = ('created_at',)