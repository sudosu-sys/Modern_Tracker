from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, EmployeeViewSet, AttendanceViewSet, 
    LeaveRequestViewSet, PayrollRunViewSet, PerformanceReviewViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'leaves', LeaveRequestViewSet)
router.register(r'payroll', PayrollRunViewSet)
router.register(r'reviews', PerformanceReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]