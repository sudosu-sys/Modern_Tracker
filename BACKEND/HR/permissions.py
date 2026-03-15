from rest_framework import permissions

class HasHRAccess(permissions.BasePermission):
    """
    Custom permission to only allow access to users with a valid SerialKey
    that has the 'allow_hr' feature enabled.
    """
    message = "Your license key does not have access to the HR & Payroll module or has expired."

    def has_permission(self, request, view):
        user = request.user
        
        # 1. Must be logged in
        if not user or not user.is_authenticated:
            return False
        
        # 2. Must have a serial key attached to their account
        if not hasattr(user, 'serial_key') or not user.serial_key:
            return False
            
        serial_key = user.serial_key
        
        # 3. Key must be within its valid date range AND have the allow_hr flag set to True
        return serial_key.is_valid and serial_key.allow_hr
    