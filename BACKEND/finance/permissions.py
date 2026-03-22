from rest_framework import permissions

class HasFinanceAccess(permissions.BasePermission):
    message = "Your license key does not have access to the Finance & Expense module."

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not hasattr(user, 'serial_key') or not user.serial_key:
            return False
        
        serial_key = user.serial_key
        return serial_key.is_valid and serial_key.allow_finance