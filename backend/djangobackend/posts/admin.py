from django.contrib import admin
from django.utils.timezone import localtime
from .models import CurrentWeather, City, FavouriteCities, Forecast, Hourly

# Register your models here.

class CityAdmin(admin.ModelAdmin):
  list_display = ("name", "state", "country", "lat", "lon")

class FavouriteCitiesAdmin(admin.ModelAdmin):
  list_display = ("user", "city")

class CurrentWeatherAdmin(admin.ModelAdmin):
  list_display = ("city", "date")

class ForecastAdmin(admin.ModelAdmin):
  list_display = ("city", "date")

class HourlyAdmin(admin.ModelAdmin):
  list_display = ("city", "formatted_date")

  def formatted_date(self, obj):
    return localtime(obj.date).strftime('%d/%m/%Y - %H')
  formatted_date.short_description = 'Time'

admin.site.register(CurrentWeather, CurrentWeatherAdmin)
admin.site.register(City, CityAdmin)
admin.site.register(FavouriteCities, FavouriteCitiesAdmin)
admin.site.register(Forecast, ForecastAdmin)
admin.site.register(Hourly, HourlyAdmin)