# finance/serializers.py

from rest_framework import serializers
from .models import Account, JournalEntry, TransactionLine, Invoice, Bill, ExpenseClaim

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class TransactionLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = TransactionLine
        fields = ['id', 'account', 'account_name', 'description', 'debit', 'credit']

class JournalEntrySerializer(serializers.ModelSerializer):
    lines = TransactionLineSerializer(many=True)

    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'reference', 'description', 'is_posted', 'created_at', 'lines']

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        journal_entry = JournalEntry.objects.create(**validated_data)
        for line_data in lines_data:
            TransactionLine.objects.create(journal_entry=journal_entry, **line_data)
        return journal_entry

class InvoiceSerializer(serializers.ModelSerializer):
    balance_due = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Invoice
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    balance_due = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Bill
        fields = '__all__'

class ExpenseClaimSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.first_name', read_only=True)

    class Meta:
        model = ExpenseClaim
        fields = '__all__'