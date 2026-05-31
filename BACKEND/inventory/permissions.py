# inventory/permissions.py
from rest_framework import permissions

class HasInventoryAccess(permissions.BasePermission):
    """
    Custom permission to check valid Serial Key AND role access.
    Employees inherit their employer's license key.
    """
    message = "Your license does not include access to the Inventory App."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # 1. Identify the Shop Context
        target_shop = getattr(request.user, 'employer_shop', None) or getattr(request.user, 'shop', None)
        if not target_shop:
            self.message = "Your account is not linked to any active Shop."
            return False
            
        # 2. Inherit License from the Shop Owner
        key = getattr(target_shop.owner, 'serial_key', None)
        if not key or not key.is_valid or not key.allow_inventory:
            self.message = "The shop's license is expired or lacks Inventory features."
            return False

        # 3. Role-Based Check
        # Later, we can restrict specific HTTP methods (like DELETE) based on roles here!
        if request.user.role not in ['ADMIN', 'MANAGER', 'CLERK', 'CASHIER']:
            self.message = "Your role does not permit access to Inventory."
            return False

        return True