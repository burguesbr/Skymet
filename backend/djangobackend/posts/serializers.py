from .models import *
from rest_framework import serializers

# Serializers define the API representation.
class CitySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = City
        fields = [
            'id',
            'name',
            'state',
            'country',
            'lat',
            'lon',
        ]

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'password',
        ]
        extra_kwargs = {'password': {'write_only': True}}

class CurrentWeatherSerializer(serializers.HyperlinkedModelSerializer):
    city = CitySerializer()

    class Meta:
        model = CurrentWeather
        fields = [
            'id',
            'date',
            'desc',
            'icon',
            'city',
            't_max',
            't_min',
            'current_t',
            'wind',
            'humidity',
            'pop',
            'pressure',
            'feels_like',
        ]

class ForecastSerializer(serializers.HyperlinkedModelSerializer):
    city = CitySerializer()

    class Meta:
        model = Forecast
        fields = [
            'city',
            't_max',
            't_min',
            'icon',
            'date',
        ]

class FavouriteCitiesSerializer(serializers.HyperlinkedModelSerializer):
    city = CitySerializer()
    user = UserSerializer()

    class Meta:
        model = FavouriteCities
        fields = [
            'id',
            'user',
            'city',
        ]

class HourlySerializer(serializers.HyperlinkedModelSerializer):
    city = CitySerializer()

    class Meta:
        model = Hourly
        fields = [
            'city',
            't',
            'icon',
            'date',
        ]