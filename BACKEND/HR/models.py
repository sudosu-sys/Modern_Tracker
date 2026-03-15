from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

# Import your data isolation model (Assuming it lives in the inventory app)
from inventory.models import UserOwnedModel

# --- HR & EMPLOYEE MANAGEMENT ---

class Department(UserOwnedModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ('name', 'owner')

    def __str__(self):
        return self.name

class Employee(UserOwnedModel):
    EMPLOYMENT_TYPES = [
        ('FT', 'Full Time'),
        ('PT', 'Part Time'),
        ('CT', 'Contractor'),
    ]
    PAY_TYPES = [
        ('SALARY', 'Salaried'),
        ('HOURLY', 'Hourly'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    job_title = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=2, choices=EMPLOYMENT_TYPES, default='FT')
    
    # Compensation
    pay_type = models.CharField(max_length=10, choices=PAY_TYPES, default='SALARY')
    base_pay = models.DecimalField(max_digits=10, decimal_places=2, help_text="Annual salary or Hourly rate")
    
    # Banking & Tax Info (Simplified)
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    routing_number = models.CharField(max_length=50, blank=True)
    tax_id = models.CharField(max_length=50, blank=True, help_text="SSN, TIN, or equivalent")

    # Status
    hire_date = models.DateField()
    termination_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('email', 'owner') # Prevents email collisions only within the same business

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_title}"

# --- TIME & ATTENDANCE ---

class Attendance(models.Model):
    """ Digital Punch Clock. Implicitly owned via Employee. """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField(default=timezone.now)
    clock_in = models.DateTimeField(null=True, blank=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    
    @property
    def hours_worked(self):
        if self.clock_in and self.clock_out:
            delta = self.clock_out - self.clock_in
            return round(delta.total_seconds() / 3600, 2)
        return 0

    class Meta:
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee} - {self.date}"

class LeaveRequest(models.Model):
    """ Implicitly owned via Employee. """
    LEAVE_TYPES = [('VACATION', 'Vacation'), ('SICK', 'Sick Leave'), ('OTHER', 'Other')]
    STATUS_CHOICES = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=10, choices=LEAVE_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.status})"

# --- PAYROLL & COMPENSATION ---

class PayrollRun(UserOwnedModel):
    """ A batch processing event for a specific pay period. """
    STATUS_CHOICES = [('DRAFT', 'Draft'), ('PROCESSED', 'Processed'), ('PAID', 'Paid')]

    start_date = models.DateField()
    end_date = models.DateField()
    process_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')

    def __str__(self):
        return f"Payroll: {self.start_date} to {self.end_date}"

class PayStub(models.Model):
    """ The actual pay calculation for an individual employee. Implicitly owned via PayrollRun/Employee. """
    payroll_run = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name='paystubs')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    
    hours_worked = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    gross_pay = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    taxes = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    @property
    def net_pay(self):
        return self.gross_pay - self.taxes - self.deductions

    class Meta:
        unique_together = ('payroll_run', 'employee')

    def __str__(self):
        return f"Stub: {self.employee} - {self.payroll_run.end_date}"

# --- PERFORMANCE & REPORTING ---

class PerformanceReview(models.Model):
    """ Implicitly owned via Employee. """
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='reviews')
    review_date = models.DateField(default=timezone.now)
    reviewer_name = models.CharField(max_length=100)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], help_text="1 to 5 scale")
    comments = models.TextField()
    goals = models.TextField(blank=True, help_text="Goals for the next review period")

    def __str__(self):
        return f"Review for {self.employee} on {self.review_date}"