# finance/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AccountViewSet, JournalEntryViewSet, InvoiceViewSet, 
    BillViewSet, ExpenseClaimViewSet, ReportingViewSet
)

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'journals', JournalEntryViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'bills', BillViewSet)
router.register(r'expenses', ExpenseClaimViewSet)
router.register(r'reports', ReportingViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
]