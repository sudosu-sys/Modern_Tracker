from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F
from .models import Product, Stock, Order, InventoryTransaction, Supplier, Category, Warehouse, Location
from .serializers import (
    ProductSerializer, StockSerializer, OrderSerializer, 
    TransactionSerializer, SupplierSerializer, CategorySerializer,
    WarehouseSerializer, LocationSerializer
)
from .permissions import HasInventoryAccess

class BaseInventoryViewSet(viewsets.ModelViewSet):
    """
    A Base ViewSet that AUTOMATICALLY filters all data by the logged-in user (owner).
    It also assigns the owner automatically when creating new items.
    """
    permission_classes = [IsAuthenticated, HasInventoryAccess]

    def get_queryset(self):
        # Only return items owned by the user
        return self.queryset.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Auto-assign the logged-in user as the owner
        serializer.save(owner=self.request.user)

# --- VIEWSETS INHERITING FROM BASE (Isolated Data) ---

class ProductViewSet(BaseInventoryViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        # We must filter by owner manually here inside the custom action
        products = Product.objects.filter(owner=request.user, stock__quantity__lte=F('low_stock_threshold')).distinct()
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

class SupplierViewSet(BaseInventoryViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class CategoryViewSet(BaseInventoryViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class WarehouseViewSet(BaseInventoryViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

class OrderViewSet(BaseInventoryViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @action(detail=True, methods=['post'])
    def complete_order(self, request, pk=None):
        order = self.get_object() # get_object already filters by owner via get_queryset
        
        if order.status == 'COMPLETED':
            return Response({'error': 'Order already completed'}, status=400)

        location_id = request.data.get('location_id')
        if not location_id:
             return Response({'error': 'Location ID required'}, status=400)

        # Validate location belongs to user
        if not Location.objects.filter(id=location_id, warehouse__owner=request.user).exists():
             return Response({'error': 'Invalid location or access denied'}, status=403)

        for item in order.items.all():
            tx_type = 'IN' if order.order_type == 'PO' else 'OUT'
            
            # Create Transaction (stamped with owner)
            InventoryTransaction.objects.create(
                transaction_type=tx_type,
                owner=request.user, # Explicitly set owner
                product=item.product,
                quantity=item.quantity,
                source_location_id=None if tx_type == 'IN' else location_id,
                destination_location_id=location_id if tx_type == 'IN' else None,
                reference=f"Order #{order.id}"
            )

        order.status = 'COMPLETED'
        order.save()
        return Response({'status': 'Order processed and stock updated'})

# --- STOCK & LOCATIONS (Slightly different filtering) ---

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated, HasInventoryAccess]

    def get_queryset(self):
        # Filter locations by warehouses owned by the user
        return Location.objects.filter(warehouse__owner=self.request.user)

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated, HasInventoryAccess]

    def get_queryset(self):
        # Filter stock by products owned by the user
        return Stock.objects.filter(product__owner=self.request.user)

# --- ANALYTICS ---

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, HasInventoryAccess]

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        
        # 1. Total Products (User only)
        total_products = Product.objects.filter(owner=user).count()
        
        # 2. Low Stock (User only)
        low_stock_count = Product.objects.filter(owner=user, stock__quantity__lte=F('low_stock_threshold')).distinct().count()
        
        # 3. Valuation (User only)
        # Sum(quantity * cost_price)
        stocks = Stock.objects.filter(product__owner=user)
        total_value = sum(s.quantity * s.product.cost_price for s in stocks)

        # 4. Items Sold (User only)
        sales_tx = InventoryTransaction.objects.filter(owner=user, transaction_type='OUT').aggregate(total=Sum('quantity'))['total'] or 0

        return Response({
            "total_products": total_products,
            "low_stock_alert": low_stock_count,
            "inventory_valuation": total_value,
            "items_sold_period": sales_tx
        })