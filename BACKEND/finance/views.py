from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from .models import Account, JournalEntry, Invoice, Bill, ExpenseClaim, TransactionLine
from .serializers import (
    AccountSerializer, JournalEntrySerializer, InvoiceSerializer, 
    BillSerializer, ExpenseClaimSerializer
)
from .permissions import HasFinanceAccess

class BaseFinanceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, HasFinanceAccess]

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class AccountViewSet(BaseFinanceViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

class JournalEntryViewSet(BaseFinanceViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer

    @action(detail=True, methods=['post'])
    def post_entry(self, request, pk=None):
        je = self.get_object()
        if je.is_posted:
            return Response({'error': 'Entry is already posted'}, status=400)
            
        total_debit = je.lines.aggregate(Sum('debit'))['debit__sum'] or 0
        total_credit = je.lines.aggregate(Sum('credit'))['credit__sum'] or 0
        
        if total_debit != total_credit:
            return Response({'error': 'Debits and Credits must balance'}, status=400)
            
        je.is_posted = True
        je.save()
        return Response({'status': 'Journal Entry posted successfully'})

class InvoiceViewSet(BaseFinanceViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class BillViewSet(BaseFinanceViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

class ExpenseClaimViewSet(BaseFinanceViewSet):
    queryset = ExpenseClaim.objects.all()
    serializer_class = ExpenseClaimSerializer

    @action(detail=True, methods=['post'])
    def process_receipt(self, request, pk=None):
        """ Stub for OCR Processing """
        claim = self.get_object()
        if not claim.receipt_image:
            return Response({'error': 'No receipt image uploaded'}, status=400)
            
        # TODO: Integrate pytesseract or AWS Textract here.
        # Mocking OCR output for now
        mock_extracted_text = "VENDOR: OFFICE DEPOT\nDATE: 2026-03-15\nTOTAL: $150.00"
        claim.extracted_text = mock_extracted_text
        claim.amount = 150.00 # Extracted mock amount
        claim.save()
        
        return Response({'message': 'Receipt processed via OCR', 'extracted_text': mock_extracted_text})

class ReportingViewSet(viewsets.ViewSet):
    """ 4. Real-time Financial Reporting """
    permission_classes = [IsAuthenticated, HasFinanceAccess]

    def _get_account_balance(self, user, account_types):
        lines = TransactionLine.objects.filter(
            journal_entry__owner=user,
            journal_entry__is_posted=True,
            account__account_type__in=account_types
        ).aggregate(total_debit=Sum('debit'), total_credit=Sum('credit'))
        
        debits = lines['total_debit'] or 0
        credits = lines['total_credit'] or 0
        
        # Assets & Expenses increase with Debits
        if 'ASSET' in account_types or 'EXPENSE' in account_types:
            return debits - credits
        # Liabilities, Equity, Revenue increase with Credits
        return credits - debits

    @action(detail=False, methods=['get'])
    def profit_and_loss(self, request):
        revenue = self._get_account_balance(request.user, ['REVENUE'])
        expenses = self._get_account_balance(request.user, ['EXPENSE'])
        return Response({
            'total_revenue': revenue,
            'total_expenses': expenses,
            'net_profit': revenue - expenses
        })

    @action(detail=False, methods=['get'])
    def balance_sheet(self, request):
        assets = self._get_account_balance(request.user, ['ASSET'])
        liabilities = self._get_account_balance(request.user, ['LIABILITY'])
        equity = self._get_account_balance(request.user, ['EQUITY'])
        return Response({
            'assets': assets,
            'liabilities': liabilities,
            'equity': equity,
            'is_balanced': assets == (liabilities + equity)
        })

    @action(detail=False, methods=['get'])
    def ap_ar_aging(self, request):
        invoices = Invoice.objects.filter(owner=request.user, status__in=['SENT', 'PARTIAL', 'OVERDUE'])
        bills = Bill.objects.filter(owner=request.user, status__in=['RECEIVED', 'PARTIAL', 'OVERDUE'])
        
        ar_aging = {'0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0}
        for inv in invoices:
            days = inv.days_overdue
            if days <= 30: ar_aging['0_30'] += inv.balance_due
            elif days <= 60: ar_aging['31_60'] += inv.balance_due
            elif days <= 90: ar_aging['61_90'] += inv.balance_due
            else: ar_aging['90_plus'] += inv.balance_due

        ap_aging = {'0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0}
        for bill in bills:
            days = bill.days_overdue
            if days <= 30: ap_aging['0_30'] += bill.balance_due
            elif days <= 60: ap_aging['31_60'] += bill.balance_due
            elif days <= 90: ap_aging['61_90'] += bill.balance_due
            else: ap_aging['90_plus'] += bill.balance_due

        return Response({'accounts_receivable': ar_aging, 'accounts_payable': ap_aging})