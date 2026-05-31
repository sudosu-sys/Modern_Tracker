# inventory/views.py
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
    A Base ViewSet that AUTOMATICALLY filters all data by the user's shop.
    """
    permission_classes = [IsAuthenticated, HasInventoryAccess]

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        # Identify the shop context: Is it the shop they work at, or the one they own?
        target_shop = getattr(user, 'employer_shop', None) or getattr(user, 'shop', None)
        
        if target_shop:
            # Include items assigned to the shop, OR legacy items owned by the shop owner
            return self.queryset.filter(Q(shop=target_shop) | Q(owner=target_shop.owner, shop__isnull=True)).distinct()
        return self.queryset.filter(owner=user)

    def perform_create(self, serializer):
        from core.models import Shop, AuditLog
        user = self.request.user
        target_shop = getattr(user, 'employer_shop', None) or getattr(user, 'shop', None)
        
        if not target_shop:
            target_shop, _ = Shop.objects.get_or_create(
                owner=user, 
                defaults={'name': f"{user.phone_number}'s Shop"}
            )
            
        instance = serializer.save(owner=target_shop.owner, shop=target_shop)
        
        # --- AUDIT TRAIL LOGGING ---
        model_name = self.queryset.model.__name__
        if model_name == 'Product':
            AuditLog.objects.create(
                shop=target_shop, user=user, action='ADDED_ITEM',
                details=f"Added new product: {instance.name} (SKU: {instance.sku})"
            )

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
    
    @action(detail=True, methods=['post'])
    def quick_sale(self, request, pk=None):
        from decimal import Decimal
        product = self.get_object()
        quantity_to_sell = Decimal(str(request.data.get('quantity', 1)))

        # Find the location with the most stock for this product
        stock = Stock.objects.filter(product=product).order_by('-quantity').first()
        
        if not stock or stock.quantity < quantity_to_sell:
            return Response({'error': 'Not enough stock available to perform quick sale.'}, status=400)

        InventoryTransaction.objects.create(
            transaction_type='OUT',
            owner=request.user,
            product=product,
            quantity=quantity_to_sell,
            source_location=stock.location,
            destination_location=None,
            reference='Quick Sale (POS)'
        )
        
        # --- AUDIT TRAIL LOGGING ---
        from core.models import AuditLog
        target_shop = getattr(request.user, 'employer_shop', None) or getattr(request.user, 'shop', None)
        if target_shop:
            AuditLog.objects.create(
                shop=target_shop, user=request.user, action='SOLD_ITEM',
                details=f"Sold {quantity_to_sell}x {product.name}"
            )
        
        return Response({'status': 'Stock updated successfully', 'deducted': quantity_to_sell})
    
    @action(detail=True, methods=['post'])
    def quick_receive(self, request, pk=None):
        from decimal import Decimal
        from .models import Location, Warehouse, Stock, InventoryTransaction
        product = self.get_object()
        quantity_to_add = Decimal(str(request.data.get('quantity', 1)))

        # Find where this product is normally stored, or grab the first location
        stock = Stock.objects.filter(product=product).first()
        location = stock.location if stock else Location.objects.filter(warehouse__owner=request.user).first()
        
        if not location:
            # Auto-create a default location for smooth onboarding if they haven't made one yet
            warehouse, _ = Warehouse.objects.get_or_create(owner=request.user, defaults={'name': 'Main Warehouse', 'address': 'HQ'})
            location, _ = Location.objects.get_or_create(warehouse=warehouse, defaults={'name': 'Default Bin'})

        # Create IN transaction
        InventoryTransaction.objects.create(
            transaction_type='IN',
            owner=request.user,
            product=product,
            quantity=quantity_to_add,
            source_location=None,
            destination_location=location,
            reference='Manual Adjustment (Add)'
        )
        
        # --- AUDIT TRAIL LOGGING ---
        from core.models import AuditLog
        target_shop = getattr(request.user, 'employer_shop', None) or getattr(request.user, 'shop', None)
        if target_shop:
            AuditLog.objects.create(
                shop=target_shop, user=request.user, action='RECEIVED_ITEM',
                details=f"Received {quantity_to_add}x {product.name}"
            )
        
        return Response({'status': 'Stock added successfully', 'added': quantity_to_add})
    
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
        from django.db.models import Q
        user = self.request.user
        target_shop = getattr(user, 'employer_shop', None) or getattr(user, 'shop', None)
        if target_shop:
            return Location.objects.filter(Q(warehouse__shop=target_shop) | Q(warehouse__owner=target_shop.owner, warehouse__shop__isnull=True)).distinct()
        return Location.objects.filter(warehouse__owner=user)

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated, HasInventoryAccess]

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        target_shop = getattr(user, 'employer_shop', None) or getattr(user, 'shop', None)
        if target_shop:
            return Stock.objects.filter(Q(product__shop=target_shop) | Q(product__owner=target_shop.owner, product__shop__isnull=True)).distinct()
        return Stock.objects.filter(product__owner=user)

# --- ANALYTICS ---

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, HasInventoryAccess]

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        from django.db.models import Q
        user = request.user
        
        # Fetch Shop context
        target_shop = getattr(user, 'employer_shop', None) or getattr(user, 'shop', None)
        shop_name_str = target_shop.name if target_shop else f"{user.phone_number}'s Shop"

        # Determine query filters based on shop vs legacy owner
        if target_shop:
            prod_filter = Q(shop=target_shop) | Q(owner=target_shop.owner, shop__isnull=True)
            stock_filter = Q(product__shop=target_shop) | Q(product__owner=target_shop.owner, product__shop__isnull=True)
            tx_filter = Q(shop=target_shop) | Q(owner=target_shop.owner, shop__isnull=True)
        else:
            prod_filter = Q(owner=user)
            stock_filter = Q(product__owner=user)
            tx_filter = Q(owner=user)

        # 1. Total Products
        total_products = Product.objects.filter(prod_filter).count()
        
        # 2. Low Stock
        low_stock_count = Product.objects.filter(prod_filter, stock__quantity__lte=F('low_stock_threshold')).distinct().count()
        
        # 3. Valuation
        stocks = Stock.objects.filter(stock_filter)
        total_value = sum(s.quantity * s.product.cost_price for s in stocks)

        # 4. Items Sold
        sales_tx = InventoryTransaction.objects.filter(tx_filter, transaction_type='OUT').aggregate(total=Sum('quantity'))['total'] or 0

        return Response({
            "shop_name": shop_name_str,
            "total_products": total_products,
            "low_stock_alert": low_stock_count,
            "inventory_valuation": total_value,
            "items_sold_period": sales_tx
        })
    
    @action(detail=False, methods=['get'])
    def mover_analysis(self, request):
        from django.db.models import Sum, Q
        from django.utils import timezone
        from datetime import timedelta
        
        user = request.user
        target_shop = getattr(user, 'employer_shop', None) or getattr(user, 'shop', None)
        
        # 1. Establish the Shop Filters
        if target_shop:
            prod_filter = Q(shop=target_shop) | Q(owner=target_shop.owner, shop__isnull=True)
            tx_filter = Q(shop=target_shop) | Q(owner=target_shop.owner, shop__isnull=True)
        else:
            prod_filter = Q(owner=user)
            tx_filter = Q(owner=user)

        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # 2. Get all products and recent OUT transactions
        products = Product.objects.filter(prod_filter)
        sales_data = InventoryTransaction.objects.filter(
            tx_filter,
            transaction_type='OUT',
            created_at__gte=thirty_days_ago
        ).values('product').annotate(total_sold=Sum('quantity'))
        
        sales_dict = {item['product']: item['total_sold'] for item in sales_data}
        
        movers = []
        for p in products:
            sold = sales_dict.get(p.id, 0)
            current_stock = sum(s.quantity for s in p.stock_set.all())
            movers.append({
                'id': p.id,
                'name': p.name,
                'sku': p.sku,
                'sold_last_30_days': sold,
                'current_stock': current_stock
            })
            
        # 3. Sort for Fast Movers (Highest sales)
        fast_movers = sorted(movers, key=lambda x: x['sold_last_30_days'], reverse=True)[:5]
        
        # 4. Sort for Dead Stock / Slow Movers (Items sitting in stock with lowest/zero sales)
        in_stock_items = [m for m in movers if m['current_stock'] > 0]
        slow_movers = sorted(in_stock_items, key=lambda x: (x['sold_last_30_days'], -x['current_stock']))[:5]
        
        return Response({
            'fast_movers': fast_movers,
            'slow_movers': slow_movers
        })