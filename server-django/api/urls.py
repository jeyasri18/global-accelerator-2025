from django.urls import path
from .views import matcha_places

urlpatterns = [
    path('places/', matcha_places),
]