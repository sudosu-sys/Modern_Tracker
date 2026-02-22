from rest_framework import permissions

class HasInventoryAccess(permissions.BasePermission):
    """
    Custom permission to only allow users with a valid Serial Key
    AND the 'allow_inventory' switch set to True.
    """
    message = "Your license does not include access to the Inventory App."

    def has_permission(self, request, view):
        # 1. Check if user is logged in
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Check if the user has a Serial Key assigned
        # 'serial_key' is the related_name we defined in core/models.py
        if not hasattr(request.user, 'serial_key'):
            self.message = "No license key found associated with this account."
            return False

        # 3. Get the key instance
        key = request.user.serial_key

        # 4. Check the Inventory Switch (The one we just added)
        if not key.allow_inventory:
            self.message = "Your current plan does not support Inventory features."
            return False

        # 5. (Optional) Check if the key is expired
        if not key.is_valid:
            self.message = "Your license key has expired."
            return False

        return True