# core/urls.py
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import *

from rest_framework.routers import DefaultRouter
from .views import ShopEmployeeViewSet

router = DefaultRouter()
router.register(r'shop-employees', ShopEmployeeViewSet, basename='shop-employees')

urlpatterns = [
    # This is your Login Endpoint
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('me/', current_user_view, name='current_user'),
    path('activate/', activate_key_view, name='activate_key'),
    path('admin-dashboard/', admin_dashboard_view, name='admin_dashboard'),
    path('', include(router.urls)),
]