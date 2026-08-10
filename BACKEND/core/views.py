# core/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import SerialKey
from .serializers import UserSerializer, SignupSerializer



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    # Serializes the user making the request
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_key_view(request):
    key_input = request.data.get('key', '').strip()

    if not key_input:
        return Response({'error': 'Key is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # 1. Find the key
        serial_key = SerialKey.objects.get(key=key_input)

        # 2. Check if it belongs to someone else
        if serial_key.user and serial_key.user != request.user:
            return Response({'error': 'This key is already used by another account.'}, status=status.HTTP_409_CONFLICT)

        # 3. Check if it's already YOURS (Idempotency)
        if serial_key.user == request.user:
            return Response({'message': 'You already have this key active.'}, status=status.HTTP_200_OK)

        # 4. Check expiration (Optional: You might want to allow claiming expired keys for history, but usually no)
        if serial_key.end_date < timezone.now():
            return Response({'error': 'This key has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        # 5. Check if User already has a DIFFERENT key (Optional, depends on business logic)
        # If you want to overwrite their old key, we need to handle the OneToOne constraint.
        # Since OneToOne implies 1 user = 1 key, if they claim a new one, we must disconnect the old one first.
        if hasattr(request.user, 'serial_key'):
            old_key = request.user.serial_key
            old_key.user = None
            old_key.save()

        # 6. ACTIVATE: Assign the key to the user
        serial_key.user = request.user
        serial_key.save()

        return Response({'message': 'License activated successfully!'}, status=status.HTTP_200_OK)

    except SerialKey.DoesNotExist:
        return Response({'error': 'Invalid key provided.'}, status=status.HTTP_404_NOT_FOUND)
    
from .models import AuditLog
from .serializers import AuditLogSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_view(request):
    # Only Shop Admins are allowed in!
    if request.user.role != 'ADMIN':
        return Response({'error': 'Unauthorized access. Admins only.'}, status=status.HTTP_403_FORBIDDEN)
    
    shop = getattr(request.user, 'shop', None)
    if not shop:
        return Response({'error': 'No shop associated with this admin.'}, status=status.HTTP_404_NOT_FOUND)

    # Fetch the latest 100 immutable activity logs
    logs = AuditLog.objects.filter(shop=shop)[:100]
    serializer = AuditLogSerializer(logs, many=True)
    
    return Response({
        'shop_name': shop.name,
        'logs': serializer.data
    }, status=status.HTTP_200_OK)

from rest_framework import viewsets
from django.contrib.auth import get_user_model
from .serializers import ShopEmployeeSerializer

User = get_user_model()

class ShopEmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = ShopEmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only Admins can access this viewset
        if self.request.user.role != 'ADMIN':
            return User.objects.none()
        
        shop = getattr(self.request.user, 'shop', None)
        if not shop:
            return User.objects.none()
            
        # Return employees of THIS shop, excluding the Admin themselves
        return User.objects.filter(employer_shop=shop).exclude(id=self.request.user.id)

    def perform_create(self, serializer):
        # Auto-link the new employee to the Admin's shop
        serializer.save(employer_shop=self.request.user.shop)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Account created successfully."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)