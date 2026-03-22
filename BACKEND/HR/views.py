# HR/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from decimal import Decimal

from .models import Department, Employee, Attendance, LeaveRequest, PayrollRun, PayStub, PerformanceReview
from .serializers import (
    DepartmentSerializer, EmployeeSerializer, AttendanceSerializer, 
    LeaveRequestSerializer, PayrollRunSerializer, PayStubSerializer, PerformanceReviewSerializer
)
# IMPORT THE NEW PERMISSION CLASS
from .permissions import HasHRAccess

class BaseHRViewSet(viewsets.ModelViewSet):
    # ADDED HasHRAccess
    permission_classes = [IsAuthenticated, HasHRAccess]

    def get_queryset(self):
        return self.queryset.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class DepartmentViewSet(BaseHRViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class EmployeeViewSet(BaseHRViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    # ADDED HasHRAccess
    permission_classes = [IsAuthenticated, HasHRAccess]

    def get_queryset(self):
        return Attendance.objects.filter(employee__owner=self.request.user)

    @action(detail=False, methods=['post'])
    def punch(self, request):
        employee_id = request.data.get('employee_id')
        action_type = request.data.get('action')

        try:
            employee = Employee.objects.get(id=employee_id, owner=request.user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        today = timezone.now().date()
        record, created = Attendance.objects.get_or_create(employee=employee, date=today)

        if action_type == 'in':
            if record.clock_in:
                return Response({'error': 'Already clocked in today'}, status=400)
            record.clock_in = timezone.now()
        elif action_type == 'out':
            if not record.clock_in:
                return Response({'error': 'Must clock in first'}, status=400)
            if record.clock_out:
                return Response({'error': 'Already clocked out today'}, status=400)
            record.clock_out = timezone.now()
        
        record.save()
        return Response(AttendanceSerializer(record).data)

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    # ADDED HasHRAccess
    permission_classes = [IsAuthenticated, HasHRAccess]

    def get_queryset(self):
        return LeaveRequest.objects.filter(employee__owner=self.request.user)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        leave = self.get_object()
        new_status = request.data.get('status')
        if new_status in ['APPROVED', 'REJECTED']:
            leave.status = new_status
            leave.save()
            return Response({'status': f'Leave {new_status.lower()}'})
        return Response({'error': 'Invalid status'}, status=400)

class PayrollRunViewSet(BaseHRViewSet):
    queryset = PayrollRun.objects.all()
    serializer_class = PayrollRunSerializer

    @action(detail=True, methods=['post'])
    def generate_stubs(self, request, pk=None):
        payroll_run = self.get_object()
        
        if payroll_run.status != 'DRAFT':
            return Response({'error': 'Can only generate stubs for DRAFT runs'}, status=400)

        employees = Employee.objects.filter(owner=request.user, is_active=True)
        stubs_created = 0

        for emp in employees:
            if PayStub.objects.filter(payroll_run=payroll_run, employee=emp).exists():
                continue

            gross_pay = 0
            if emp.pay_type == 'SALARY':
                gross_pay = emp.base_pay / Decimal('26.0') 
            elif emp.pay_type == 'HOURLY':
                attendances = Attendance.objects.filter(
                    employee=emp, 
                    date__gte=payroll_run.start_date, 
                    date__lte=payroll_run.end_date
                )
                total_hours = sum(a.hours_worked for a in attendances)
                gross_pay = Decimal(str(total_hours)) * emp.base_pay

            taxes = gross_pay * Decimal('0.20')

            PayStub.objects.create(
                payroll_run=payroll_run,
                employee=emp,
                gross_pay=gross_pay,
                taxes=taxes
            )
            stubs_created += 1

        payroll_run.status = 'PROCESSED'
        payroll_run.save()

        return Response({'message': f'Generated {stubs_created} paystubs successfully.'})

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    # ADDED HasHRAccess
    permission_classes = [IsAuthenticated, HasHRAccess]

    def get_queryset(self):
        return PerformanceReview.objects.filter(employee__owner=self.request.user)