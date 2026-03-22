from django.db import models
from django.utils import timezone
from inventory.models import UserOwnedModel
from HR.models import Employee

# --- 1. GENERAL LEDGER (Chart of Accounts & Double Entry) ---

class Account(UserOwnedModel):
    ACCOUNT_TYPES = [
        ('ASSET', 'Asset'),
        ('LIABILITY', 'Liability'),
        ('EQUITY', 'Equity'),
        ('REVENUE', 'Revenue'),
        ('EXPENSE', 'Expense'),
    ]
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, help_text="e.g., 1000 for Cash")
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('code', 'owner')

    def __str__(self):
        return f"{self.code} - {self.name} ({self.account_type})"

class JournalEntry(UserOwnedModel):
    date = models.DateField(default=timezone.now)
    reference = models.CharField(max_length=100, blank=True, help_text="Invoice #, Receipt #")
    description = models.TextField()
    is_posted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"JE-{self.id} on {self.date}"

class TransactionLine(models.Model):
    journal_entry = models.ForeignKey(JournalEntry, related_name='lines', on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    description = models.CharField(max_length=255, blank=True)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.account.name} - D:{self.debit} C:{self.credit}"

# --- 2. ACCOUNTS PAYABLE & RECEIVABLE (AP/AR) ---

class Invoice(UserOwnedModel):
    """ Accounts Receivable (Money owed TO you) """
    STATUS_CHOICES = [('DRAFT', 'Draft'), ('SENT', 'Sent'), ('PARTIAL', 'Partially Paid'), ('PAID', 'Paid'), ('OVERDUE', 'Overdue')]
    
    customer_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    journal_entry = models.OneToOneField(JournalEntry, null=True, blank=True, on_delete=models.SET_NULL)

    @property
    def balance_due(self):
        return self.amount - self.amount_paid

    @property
    def days_overdue(self):
        if self.balance_due > 0 and timezone.now().date() > self.due_date:
            return (timezone.now().date() - self.due_date).days
        return 0

class Bill(UserOwnedModel):
    """ Accounts Payable (Money YOU owe) """
    STATUS_CHOICES = [('DRAFT', 'Draft'), ('RECEIVED', 'Received'), ('PARTIAL', 'Partially Paid'), ('PAID', 'Paid'), ('OVERDUE', 'Overdue')]
    
    vendor_name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    issue_date = models.DateField(default=timezone.now)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    journal_entry = models.OneToOneField(JournalEntry, null=True, blank=True, on_delete=models.SET_NULL)

    @property
    def balance_due(self):
        return self.amount - self.amount_paid

    @property
    def days_overdue(self):
        if self.balance_due > 0 and timezone.now().date() > self.due_date:
            return (timezone.now().date() - self.due_date).days
        return 0

# --- 3. EXPENSE CATEGORIZATION & OCR ---

class ExpenseClaim(UserOwnedModel):
    STATUS_CHOICES = [('PENDING', 'Pending'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected'), ('PAID', 'Paid')]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='expense_claims')
    date = models.DateField(default=timezone.now)
    vendor = models.CharField(max_length=200, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    category = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, limit_choices_to={'account_type': 'EXPENSE'})
    description = models.TextField()
    
    receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True)
    extracted_text = models.TextField(blank=True, help_text="Raw OCR output")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    journal_entry = models.OneToOneField(JournalEntry, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Expense: {self.employee} - {self.amount}"