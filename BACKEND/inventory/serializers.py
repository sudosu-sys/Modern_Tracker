from rest_framework import serializers
from .models import Product, Category, Supplier, Warehouse, Location, Stock, Order, OrderItem, InventoryTransaction

class CategorySerializer(serializers.ModelSerializer):
    # Owner is hidden/read-only (assigned automatically by view)
    owner = serializers.ReadOnlyField(source='owner.phone_number')
    
    class Meta:
        model = Category
        fields = '__all__'

class SupplierSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.phone_number')

    class Meta:
        model = Supplier
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.phone_number')
    total_stock = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
    
    def get_total_stock(self, obj):
        # Calculate total stock across all locations
        stocks = Stock.objects.filter(product=obj)
        return sum(s.quantity for s in stocks)

class WarehouseSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.phone_number')
    class Meta:
        model = Warehouse
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class StockSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    warehouse_name = serializers.CharField(source='location.warehouse.name', read_only=True)

    class Meta:
        model = Stock
        fields = ['id', 'product', 'location', 'location_name', 'warehouse_name', 'quantity', 'batch']

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']

class OrderSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.phone_number')
    items = OrderItemSerializer(many=True, read_only=True)
    items_data = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = Order
        fields = ['id', 'owner', 'order_type', 'status', 'supplier', 'customer_name', 'created_at', 'items', 'items_data']

    def create(self, validated_data):
        items_data = validated_data.pop('items_data', [])
        # Owner is passed in save() via ViewSet
        order = Order.objects.create(**validated_data)
        
        for item in items_data:
            OrderItem.objects.create(order=order, **item)
        return order

class TransactionSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.phone_number')
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = InventoryTransaction
        fields = '__all__'