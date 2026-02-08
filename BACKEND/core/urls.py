from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import current_user_view, activate_key_view

urlpatterns = [
    # This is your Login Endpoint
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('me/', current_user_view, name='current_user'),
    path('activate/', activate_key_view, name='activate_key'),
]