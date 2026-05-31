# HR/admin.py
from django.contrib import admin
from .models import Department, Employee, Attendance, LeaveRequest, PayrollRun, PayStub, PerformanceReview

# --- BASE ADMIN FOR DATA ISOLATION ---
class BaseUserOwnedAdmin(admin.ModelAdmin):
    """
    Ensures that non-superusers can only see and edit their own data 
    inside the Django Admin panel.
    """
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(owner=request.user)

    def save_model(self, request, obj, form, change):
        # Auto-assign the owner when creating via Admin panel
        if not getattr(obj, 'owner_id', None):
            obj.owner = request.user
        super().save_model(request, obj, form, change)

class BaseImplicitlyOwnedAdmin(admin.ModelAdmin):
    """
    For models like Attendance and LeaveRequest that don't have a direct 
    'owner' field, but are linked to an Employee who does.
    """
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(employee__owner=request.user)

# --- MODEL REGISTRATIONS ---

@admin.register(Department)
class DepartmentAdmin(BaseUserOwnedAdmin):
    list_display = ('name', 'owner')
    search_fields = ('name',)

@admin.register(Employee)
class EmployeeAdmin(BaseUserOwnedAdmin):
    list_display = ('first_name', 'last_name', 'job_title', 'department', 'is_active', 'owner')
    list_filter = ('is_active', 'employment_type', 'pay_type')
    search_fields = ('first_name', 'last_name', 'email')
    
    # Only show departments owned by this user in the dropdown
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "department" and not request.user.is_superuser:
            kwargs["queryset"] = Department.objects.filter(owner=request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Attendance)
class AttendanceAdmin(BaseImplicitlyOwnedAdmin):
    list_display = ('employee', 'date', 'clock_in', 'clock_out', 'hours_worked')
    list_filter = ('date',)
    search_fields = ('employee__first_name', 'employee__last_name')

@admin.register(LeaveRequest)
class LeaveRequestAdmin(BaseImplicitlyOwnedAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__first_name', 'employee__last_name')

@admin.register(PayrollRun)
class PayrollRunAdmin(BaseUserOwnedAdmin):
    list_display = ('id', 'start_date', 'end_date', 'status', 'owner')
    list_filter = ('status',)

@admin.register(PayStub)
class PayStubAdmin(admin.ModelAdmin):
    list_display = ('employee', 'payroll_run', 'gross_pay', 'net_pay')
    search_fields = ('employee__first_name', 'employee__last_name')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(employee__owner=request.user)

@admin.register(PerformanceReview)
class PerformanceReviewAdmin(BaseImplicitlyOwnedAdmin):
    list_display = ('employee', 'review_date', 'rating', 'reviewer_name')
    list_filter = ('rating',)
    search_fields = ('employee__first_name', 'employee__last_name')