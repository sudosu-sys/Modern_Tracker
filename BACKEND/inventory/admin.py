from django.contrib import admin
from .models import (
    Category, Supplier, Product, ProductKit, 
    Warehouse, Location, Batch, Stock, 
    InventoryTransaction, Order, OrderItem
)

# --- INLINES ---
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1

class ProductKitInline(admin.TabularInline):
    model = ProductKit
    fk_name = 'parent_product'
    extra = 1

# --- ADMIN CLASSES ---

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    # Added 'owner' so you can see who owns which category
    list_display = ('name', 'parent', 'owner')
    search_fields = ('name',)
    list_filter = ('owner',)

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_email', 'lead_time_days', 'owner')
    search_fields = ('name', 'contact_email')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'category', 'selling_price', 'total_stock_display', 'owner')
    search_fields = ('sku', 'name', 'barcode')
    list_filter = ('category', 'is_batch_tracked', 'owner')
    inlines = [ProductKitInline]

    def total_stock_display(self, obj):
        from django.db.models import Sum
        # Safely handle cases where stock is None
        result = obj.stock_set.aggregate(total=Sum('quantity'))['total']
        return result if result is not None else 0
    total_stock_display.short_description = "Total Stock"

@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'owner')

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'warehouse')
    list_filter = ('warehouse',)

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'location', 'quantity', 'batch')
    list_filter = ('location__warehouse', 'product')
    search_fields = ('product__sku', 'product__name')

@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    # FIXED: Changed 'created_by' to 'owner'
    list_display = ('created_at', 'transaction_type', 'product', 'quantity', 'owner')
    list_filter = ('transaction_type', 'created_at', 'owner')
    search_fields = ('reference', 'product__sku')
    # FIXED: Changed 'created_by' to 'owner'
    readonly_fields = ('created_at', 'owner')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_type', 'status', 'supplier', 'customer_name', 'created_at', 'owner')
    list_filter = ('order_type', 'status', 'created_at', 'owner')
    inlines = [OrderItemInline]
    
@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ('batch_number', 'product', 'expiry_date')