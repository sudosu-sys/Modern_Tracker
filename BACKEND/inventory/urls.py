from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, StockViewSet, OrderViewSet, AnalyticsViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'stock', StockViewSet)
router.register(r'orders', OrderViewSet)
# Registers the custom Analytics viewset
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]