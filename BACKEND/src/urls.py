# src/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/hr/', include('HR.urls')),
    path('api/finance/', include('finance.urls')),
]
