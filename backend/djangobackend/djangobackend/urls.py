"""
URL configuration for djangobackend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from posts.views import *
from rest_framework.authtoken import views

#Siamo in API quindi SOLO DATI
#Path che collega al currentweather non appare nella lista urlpatterns sotto, ma viene registrata tramite router
router = routers.DefaultRouter()
router.register(r'currentweather', CurrentWeatherViewSet, basename='currentweather')
router.register(r'city', CityViewSet, basename='city')
router.register(r'favouritecities', FavouriteCitiesViewSet, basename='favouritecities')
router.register(r'user', UserViewSet, basename='user')
router.register(r'forecast', ForecastViewSet)
router.register(r'hourly', HourlyViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), #Il router è già attaccato alla cartella api, se aggiungiamo più risorse, le include tutte
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', views.obtain_auth_token),
    path('api/currentweather/get_weather_by_city/', CurrentWeatherViewSet.as_view({'get': 'get_weather_by_city'})),
    path('api/currentweather/get_forecast_by_city/', ForecastViewSet.as_view({'get': 'get_forecast_by_city'})),
    path('favouritecities/<int:pk>/', FavouriteCitiesViewSet.as_view({'delete': 'destroy'})),
    path('api/create-city-from-ip/', CityCreateFromIPView.as_view(), name='create-city-from-ip'),
]