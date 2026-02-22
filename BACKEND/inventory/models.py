from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

# --- ABSTRACT MODEL FOR DATA ISOLATION ---
class UserOwnedModel(models.Model):
    """
    Abstract base class that adds an 'owner' field to models.
    This ensures every item is linked to a specific user/tenant.
    """
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="%(class)s_owned")

    class Meta:
        abstract = True

# --- 1. CORE & ATTRIBUTES ---
class Category(UserOwnedModel):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)
    
    class Meta:
        verbose_name_plural = "Categories"
        unique_together = ('name', 'owner') # Unique per user

    def __str__(self):
        return self.name

class Supplier(UserOwnedModel):
    name = models.CharField(max_length=200)
    contact_email = models.EmailField()
    phone = models.CharField(max_length=50)
    lead_time_days = models.IntegerField(default=7, help_text="Average days to deliver")

    def __str__(self):
        return self.name

class Product(UserOwnedModel):
    ABC_CHOICES = [('A', 'A - High Value'), ('B', 'B - Medium'), ('C', 'C - Low')]

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=50, help_text="Stock Keeping Unit")
    barcode = models.CharField(max_length=100, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    
    description = models.TextField(blank=True)
    
    # Pricing
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Cost to buy")
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Price to sell")
    
    # Units
    uom = models.CharField(max_length=20, default="Each", help_text="Unit of Measure (e.g., kg, pcs)")
    
    # Stock Logic
    low_stock_threshold = models.IntegerField(default=10)
    abc_classification = models.CharField(max_length=1, choices=ABC_CHOICES, default='C')
    
    # Tracking
    is_batch_tracked = models.BooleanField(default=False, help_text="Track expiry dates/batches?")
    is_kit = models.BooleanField(default=False, help_text="Is this a bundle of other items?")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('sku', 'owner') # Unique per user

    def __str__(self):
        return f"{self.sku} - {self.name}"

class ProductKit(models.Model):
    """ Defines what items make up a Kit. Linked to Product, so implicitly owned. """
    parent_product = models.ForeignKey(Product, related_name='kit_components', on_delete=models.CASCADE)
    child_product = models.ForeignKey(Product, related_name='part_of_kits', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

# --- 2. WAREHOUSE & STORAGE ---
class Warehouse(UserOwnedModel):
    name = models.CharField(max_length=100)
    address = models.TextField()

    def __str__(self):
        return self.name

class Location(models.Model):
    """ Specific Bin, Aisle, or Shelf inside a Warehouse """
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    name = models.CharField(max_length=50, help_text="e.g., Aisle-1-Bin-A")
    
    def __str__(self):
        return f"{self.warehouse.name} - {self.name}"

class Batch(models.Model):
    """ For tracking expiry dates. Linked to Product, so implicitly owned. """
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.product.sku} - {self.batch_number}"

# --- 3. INVENTORY STOCK LEVELS ---
class Stock(models.Model):
    """ The actual quantity of an item at a specific location """
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    batch = models.ForeignKey(Batch, null=True, blank=True, on_delete=models.SET_NULL)
    
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    class Meta:
        unique_together = ('product', 'location', 'batch')

    def __str__(self):
        return f"{self.product.name} ({self.quantity}) @ {self.location}"

# --- 4. TRANSACTIONS & AUDIT LOG ---
class InventoryTransaction(UserOwnedModel):
    TX_TYPES = [
        ('IN', 'Purchase Receive'),
        ('OUT', 'Sales Order'),
        ('MOVE', 'Internal Transfer'),
        ('ADJ', 'Adjustment/Count'),
        ('RET', 'Return (RMA)'),
    ]

    transaction_type = models.CharField(max_length=10, choices=TX_TYPES)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=12, decimal_places=2) # Negative for outgoing
    
    source_location = models.ForeignKey(Location, related_name='tx_source', null=True, on_delete=models.SET_NULL)
    destination_location = models.ForeignKey(Location, related_name='tx_dest', null=True, on_delete=models.SET_NULL)
    
    reference = models.CharField(max_length=100, blank=True, help_text="PO #, SO #, or Reason")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # AUTOMATED STOCK UPDATE LOGIC
        if not self.pk: # Only on create
            if self.source_location:
                src_stock, _ = Stock.objects.get_or_create(product=self.product, location=self.source_location)
                src_stock.quantity -= self.quantity
                src_stock.save()
            
            if self.destination_location:
                dest_stock, _ = Stock.objects.get_or_create(product=self.product, location=self.destination_location)
                dest_stock.quantity += self.quantity
                dest_stock.save()
                
        super().save(*args, **kwargs)

# --- 5. PURCHASING & SALES ---
class Order(UserOwnedModel):
    ORDER_TYPES = [('PO', 'Purchase Order'), ('SO', 'Sales Order')]
    STATUS_CHOICES = [('DRAFT', 'Draft'), ('CONFIRMED', 'Confirmed'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')]

    order_type = models.CharField(max_length=2, choices=ORDER_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    supplier = models.ForeignKey(Supplier, null=True, blank=True, on_delete=models.SET_NULL) # For PO
    customer_name = models.CharField(max_length=200, blank=True) # For SO
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total_price(self):
        return self.quantity * self.unit_price