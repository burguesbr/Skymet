from .serializers import *
from rest_framework import viewsets, authentication, permissions, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.http import JsonResponse
from urllib.request import urlopen
import json, os, requests
from datetime import timedelta

# ViewSets define the view behavior.
class UserViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    # Allow unauthenticated access to create
    def get_permissions(self):
        if self.action == 'create':
            return [IsAdminUser()]  # Admin can create users
        if self.action in ['update', 'partial_update']:
            return [IsAuthenticated()]  # Ensure the user is authenticated for update

        return [IsAuthenticated()]

    # Only return the current authenticated user
    def retrieve(self, request, pk=None):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def create(self, request):
        # Create a user from the incoming data
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            # Save the user and hash the password
            user = serializer.save()
            user.set_password(serializer.validated_data['password'])
            user.save()

            # Return the newly created user's data (exclude password)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        # If pk is provided, allow updating another user's data only if the user is an admin.
        if pk and not request.user.is_staff:
            # Ensure users can only update their own data
            if str(request.user.id) != str(pk):
                raise PermissionDenied(detail="You do not have permission to edit this user.")
        
        # Fetch the user to update (either the authenticated user or the specified user)
        try:
            user = User.objects.get(pk=pk) if pk else request.user
        except User.DoesNotExist:
            raise NotFound(detail="User not found.")
        
        # Perform the update
        serializer = self.serializer_class(user, data=request.data, partial=True)  # partial=True allows partial updates
        if serializer.is_valid():
            user = serializer.save()

            # If the password was provided, hash it before saving
            if 'password' in request.data:
                user.set_password(request.data['password'])
                user.save()

            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        
        # If validation fails, log and return the errors
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ForecastViewSet(viewsets.ViewSet):
    queryset = Forecast.objects.all()
    serializer_class = ForecastSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request):
        queryset = Forecast.objects.filter(city = request.city)
        serializer = ForecastSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def list(self, request):
        if request.user.is_staff:
            queryset = Forecast.objects.all()
        else:
            queryset = Forecast.objects.filter(city = request.city)
        serializer = ForecastSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'], url_path='get_forecast_by_city', name='get_forecast_by_city_action')
    def get_forecast_by_city(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({"detail": "Unauthorized access."}, status=401)

        try:
            lat = request.query_params.get('lat')
            lon = request.query_params.get('lon')

            if not lat or not lon:
                return JsonResponse({"detail": "City information is required."}, status=400)
        except Exception as e:
            return JsonResponse({"detail": f"Error retrieving query params: {str(e)}"}, status=500)

        try:
            city_obj = City.objects.filter(lat=lat, lon=lon).first()
            if not city_obj:
                print("City not found in the database.")
                return JsonResponse({"detail": "City not found in the database."}, status=404)
        except Exception as e:
            return JsonResponse({"detail": f"Error retrieving city: {str(e)}"}, status=500)

        try:
            oldest_weather = Forecast.objects.filter(city=city_obj).order_by('date').first()
            if oldest_weather:
                if oldest_weather.date.date() == now().date():
                    forecasts = Forecast.objects.filter(city=city_obj).order_by('date')
                    serializer = ForecastSerializer(forecasts, many=True)
                    return JsonResponse(serializer.data, status=200, safe=False)
                else:
                    Forecast.objects.filter(city=city_obj).delete()
        except Exception as e:
            return JsonResponse({"detail": f"Error handling forecast data: {str(e)}"}, status=500)

        try:
            API_KEY = os.getenv('API_KEY')
            print(API_KEY)
            if not API_KEY:
                return JsonResponse({"detail": "API Key is missing or invalid."}, status=500)

            external_api_url = f"https://api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt=16&units=metric&appid={API_KEY}"
            response = requests.get(external_api_url)

            with urlopen(external_api_url) as response:
                if response.status != 200:
                    return JsonResponse({"detail": "Failed to fetch forecast data."}, status=500)

                forecast_data = json.load(response)
                list_data = forecast_data.get('list')
                if not list_data:
                    return JsonResponse({"detail": "Invalid forecast data from API."}, status=500)

                new_forecasts = []
                for weather_data in list_data:
                    timestamp = weather_data['dt']
                    date_time = datetime.fromtimestamp(timestamp, tz=timezone.utc)

                    new_forecast = Forecast(
                        date=date_time,
                        icon=weather_data['weather'][0]['icon'],
                        city=city_obj,
                        t_max=weather_data['temp']['max'],
                        t_min=weather_data['temp']['min'],
                    )
                    new_forecasts.append(new_forecast)

                Forecast.objects.bulk_create(new_forecasts)
                serializer = ForecastSerializer(new_forecasts, many=True)
                return JsonResponse(serializer.data, status=201, safe=False)

        except Exception as e:
            return JsonResponse({"detail": f"Error fetching forecast data: {str(e)}"}, status=500)


class CurrentWeatherViewSet(viewsets.ViewSet):
    queryset = CurrentWeather.objects.all()
    serializer_class = CurrentWeatherSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        serializer = CurrentWeatherSerializer(self.queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'], url_path='get_weather_by_city', name='get_weather_by_city_action')
    def get_weather_by_city(self, request):
        if not request.user.is_authenticated:
            return JsonResponse({"detail": "Unauthorized access."}, status=401)

        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')

        # Check if lat and lon are provided
        if not lat or not lon:
            return JsonResponse({"detail": "City information is required."}, status=400)

        # Get the city from the database using lat and lon
        city_obj = City.objects.filter(lat=lat, lon=lon).first()

        if not city_obj:
            return JsonResponse({"detail": "City not found in the database."}, status=404)

        # Fetch the latest weather data for this city
        queryset = CurrentWeather.objects.filter(city=city_obj).order_by('-date')

        if queryset.exists():
            latest_weather = queryset.first()
            if latest_weather.date >= now() - timedelta(hours=1):
                serializer = CurrentWeatherSerializer(latest_weather)
                return JsonResponse(serializer.data, status=200, safe=False)
            else:
                CurrentWeather.objects.filter(city=city_obj).delete()
        
        API_KEY = os.getenv('API_KEY')
        forecast_api_url = f'https://api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt=1&appid={API_KEY}&units=metric'
        try:
            with urlopen(forecast_api_url) as forecast_response:
                if forecast_response.status != 200:
                    return JsonResponse({"detail": "Failed to fetch forecast data."}, status=500)

                forecast_data = json.load(forecast_response)
                # Extract the probability of precipitation (pop) for the next day
                forecast_pop = round(forecast_data['list'][0].get('pop', 0) * 100, 2)

        except Exception as e:
                return JsonResponse({"detail": f"Error fetching forecast data: {str(e)}"}, status=500)

        # If no recent weather data, fetch it from external API
        external_api_url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric'
        
        try:
            # Request data from OpenWeatherMap
            with urlopen(external_api_url) as response:
                if response.status != 200:
                    return JsonResponse({"detail": "Failed to fetch weather data."}, status=500)

                weather_data = json.load(response)

                # Convert Unix timestamp to datetime
                timestamp = weather_data['dt']
                date_time = datetime.fromtimestamp(timestamp, tz=timezone.utc)

                # Extract necessary information from the API response
                speed = weather_data['wind']['speed']
                angle = weather_data['wind']['deg']
                WIND_DESCRIPTIONS = ['Calm', 'Light air', 'Light breeze', 'Gentle breeze', 'Moderate breeze', 'Fresh breeze', 'Strong breeze', 'Moderate gale', 'Fresh gale', 'Strong gale', 'Whole gale', 'Storm', 'Hurricane']
                WIND_THRESHOLDS = [0, 3, 5, 8, 11, 14, 17, 21, 24, 28, 32]
                wind_strength = WIND_DESCRIPTIONS[0]  # Default "Calm"
                for i in range(len(WIND_THRESHOLDS) - 1, -1, -1):
                    if speed > WIND_THRESHOLDS[i]:
                        wind_strength = WIND_DESCRIPTIONS[i + 1]
                        break

                wind_direction = ['N ↓', 'NE ↙', 'E ←', 'SE ↖', 'S ↑', 'SW ↗', 'W →', 'NW ↘'][round(angle / 45) % 8]
                wind = f'{wind_direction} | {wind_strength}'

                # Create a new weather record in the database
                new_weather = CurrentWeather.objects.create(
                    date=date_time,
                    desc=weather_data['weather'][0]['description'],
                    icon=weather_data['weather'][0]['icon'],
                    city=city_obj,
                    t_max=weather_data['main']['temp_max'],
                    t_min=weather_data['main']['temp_min'],
                    current_t=weather_data['main']['temp'],
                    wind=wind,
                    humidity=weather_data['main']['humidity'],
                    pop = forecast_pop,
                    pressure=weather_data['main']['pressure'],
                    feels_like=weather_data['main']['feels_like'],
                )

                # Serialize the newly created weather data
                serializer = CurrentWeatherSerializer(new_weather)
                return JsonResponse(serializer.data, status=201, safe=False)

        except Exception as e:
            return JsonResponse({"detail": f"Error fetching weather data: {str(e)}"}, status=500)


class CityViewSet(viewsets.ViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        if request.user.is_staff:
            queryset = City.objects.all()
            serializer = CitySerializer(queryset, many=True)
        else:
            serializer = CitySerializer(request.user)
        return Response(serializer.data)
    
    def create(self, request):
        city_data = request.data
        
        # Check if a city with identical data already exists
        if City.objects.filter(**city_data).exists():
            return Response({"detail": "City already exists."}, status=status.HTTP_200_OK)
        
        # If city does not exist, create it
        serializer = CitySerializer(data=city_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        if not request.user.is_staff:
            return Response({"error": "You do not have permission to delete this city."}, status=status.HTTP_403_FORBIDDEN)

        try:
            city = City.objects.get(pk=pk)
            city.delete()
            return Response({"message": "City deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        
        except City.DoesNotExist:
            return Response({"error": "City not found."}, status=status.HTTP_404_NOT_FOUND)

class FavouriteCitiesViewSet(viewsets.ViewSet):
    queryset = FavouriteCities.objects.all()
    serializer_class = FavouriteCitiesSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        queryset = FavouriteCities.objects.filter(user = request.user)
        serializer = FavouriteCitiesSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        user = request.user
        city_data = request.data.get("city")

        # Extract city data
        city_name = city_data.get("name")
        city_state = city_data.get("state", "")
        city_country = city_data.get("country", "")
        city_lat = city_data.get("lat")
        city_lon = city_data.get("lon")

        # Try to get the city
        try:
            city = City.objects.get(
                name=city_name,
                state=city_state,
                country=city_country,
                lat=city_lat,
                lon=city_lon
            )
        except City.DoesNotExist:
            return Response({"detail": "City not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the city is already in the user's favorites
        if FavouriteCities.objects.filter(user=user, city=city).exists():
            return Response({"detail": "City is already in favorites."}, status=status.HTTP_200_OK)
        
        # Create the favorite city
        FavouriteCities.objects.create(user=user, city=city)
        return Response({"detail": "City added to favorites."}, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, pk=None):
        user = request.user

        # Ensure the pk is provided
        if not pk:
            return JsonResponse({"detail": "Relation ID is required."}, status=400)

        # Get the city from the database using pk
        try:
            favorite_city = FavouriteCities.objects.get(pk=pk, user=user)  # Ensure user is also matched
        except FavouriteCities.DoesNotExist:
            return Response({"detail": "Favorite city not found."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the favorite city
        favorite_city.delete()
        return Response({"detail": "City removed from favorites."}, status=status.HTTP_204_NO_CONTENT)

from datetime import datetime, timezone

class HourlyViewSet(viewsets.ViewSet):
    queryset = Hourly.objects.all()
    serializer_class = HourlySerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['GET'], url_path='get_hourly_by_city', name='get_hourly_by_city_action')
    def get_hourly_by_city(self, request):
        try:
            lat = request.query_params.get('lat')
            lon = request.query_params.get('lon')
            if not lat or not lon:
                return JsonResponse({"detail": "City information is required."}, status=400)
        except Exception as e:
            return JsonResponse({"detail": f"Error retrieving query params: {str(e)}"}, status=500)

        try:
            city_obj = City.objects.filter(lat=lat, lon=lon).first()
            if not city_obj:
                return JsonResponse({"detail": "City not found in the database."}, status=404)
        except Exception as e:
            return JsonResponse({"detail": f"Error retrieving city: {str(e)}"}, status=500)

        # Check if existing hourly data is valid for today
        try:
            oldest_hourly = Hourly.objects.filter(city=city_obj).order_by('date').first()
            if oldest_hourly and oldest_hourly.date.date() == now().date():
                hourlies = Hourly.objects.filter(city=city_obj).order_by('date')
                if not hourlies.exists():
                    return JsonResponse({"detail": "No hourly data found for today."}, status=404)
                serializer = HourlySerializer(hourlies, many=True)
                return JsonResponse(serializer.data, status=200, safe=False)
            else:
                # Delete old data if outdated
                Hourly.objects.filter(city=city_obj).delete()
        except Exception as e:
            return JsonResponse({"detail": f"Error handling hourly data: {str(e)}"}, status=500)

        # Fetch fresh data from external API
        try:
            API_KEY = os.getenv('API_KEY')
            if not API_KEY:
                return JsonResponse({"detail": "API Key is missing or invalid."}, status=500)

            external_api_url = f"https://pro.openweathermap.org/data/2.5/forecast/hourly?lat={lat}&lon={lon}&cnt=24&appid={API_KEY}&units=metric"
            with urlopen(external_api_url) as response:
                if response.status != 200:
                    return JsonResponse({"detail": "Failed to fetch hourly data."}, status=500)

                forecast_data = json.load(response)
                list_data = forecast_data.get('list')
                if not list_data:
                    return JsonResponse({"detail": "Invalid hourly data from API."}, status=500)

                # Filter data to include only the desired hours
                desired_hours = {2, 8, 11, 14, 17, 20, 23}
                new_hourlies = []
                for hourly_data in list_data:
                    timestamp = hourly_data['dt']
                    date_time = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                    hour = date_time.hour

                    if hour in desired_hours:
                        new_hourly = Hourly(
                            date=date_time,
                            icon=hourly_data['weather'][0]['icon'],
                            city=city_obj,
                            t=float(hourly_data['main']['temp']),
                        )
                        new_hourlies.append(new_hourly)

                # Bulk create new hourly records
                if new_hourlies:
                    Hourly.objects.bulk_create(new_hourlies)
                    serializer = HourlySerializer(new_hourlies, many=True)
                    return JsonResponse(serializer.data, status=201, safe=False)
                else:
                    return JsonResponse({"detail": "No valid hourly data to save."}, status=404)

        except Exception as e:
            return JsonResponse({"detail": f"Error fetching hourly data: {str(e)}"}, status=500)

class CityCreateFromIPView(APIView):

    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Extract the IP address from the request
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', '')).split(',')[0].strip()

        if not ip or ip == '127.0.0.1':  # Fallback for local development
            ip = '8.8.8.8'  # Use a public IP for local testing

        try:
            # Call the IP geolocation API
            response = requests.get(f'http://ip-api.com/json/{ip}?fields=city,regionName,countryCode,lat,lon')
            
            if response.status_code == 200:
                location_data = response.json()

                # Prepare the city data
                city_data = {
                    'name': location_data.get('city'),
                    'state': location_data.get('regionName'),
                    'country': location_data.get('countryCode'),
                    'lat': location_data.get('lat'),
                    'lon': location_data.get('lon'),
                }

                # Validate that the necessary data exists
                if not city_data['name'] or city_data['name'] == "Unknown":
                    return JsonResponse({"detail": "City name is missing in the location data."}, status=400)

                if city_data["lat"] is None or city_data["lon"] is None:
                    return JsonResponse({"detail": "Latitude and longitude are required."}, status=400)

                # Check if the city already exists in the database
                existing_cities = City.objects.filter(
                    name=city_data['name'],
                    state=city_data['state'],
                    country=city_data['country'],
                    lat=city_data['lat'],
                    lon=city_data['lon']
                )

                if existing_cities.exists():
                    # If the city exists, use the first one (or any other logic you want)
                    city = existing_cities.first()
                    return JsonResponse({
                        "message": "City already exists.",
                        "city_data": {
                            "name": city.name,
                            "state": city.state,
                            "country": city.country,
                            "lat": city.lat,
                            "lon": city.lon
                        }
                    }, status=200)
                else:
                    # If city does not exist, create a new one
                    city = City.objects.create(
                        name=city_data['name'],
                        state=city_data['state'],
                        country=city_data['country'],
                        lat=city_data['lat'],
                        lon=city_data['lon'],
                    )

                    # Return the city data as response
                    return JsonResponse({
                        "message": "City created and data fetched successfully.",
                        "city_data": city_data
                    }, status=201)

            else:
                return JsonResponse({"detail": "Failed to fetch location data from IP API."}, status=400)

        except requests.RequestException as e:
            return JsonResponse({"detail": "Error contacting IP API", "error": str(e)}, status=500)