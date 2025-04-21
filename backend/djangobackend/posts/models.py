from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class City(models.Model):
    name = models.CharField(max_length=200)
    state = models.CharField(max_length=200, blank=True)
    country = models.CharField(max_length=200)
    lat = models.CharField(max_length=200)
    lon = models.CharField(max_length=200)

    class Meta:
         verbose_name_plural = "Cities"
    
    def __str__(self):
        return f'{self.name}, {self.state} - {self.country}'
         

class CurrentWeather(models.Model):
    date = models.DateTimeField(max_length=20)
    desc = models.CharField(max_length=200, blank=True)
    icon = models.CharField(max_length=20, blank=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    t_max = models.CharField(max_length=20)
    t_min = models.CharField(max_length=20)
    current_t = models.CharField(max_length=20)
    wind = models.CharField(max_length=200)
    humidity = models.CharField(max_length=20)
    pop = models.CharField(max_length=20)
    pressure = models.CharField(max_length=20)
    feels_like = models.CharField(max_length=20)

    class Meta:
         verbose_name_plural = "CurrentWeathers"
    
    def __str__(self):
        return f'{self.city.name}, {self.city.state} - {self.city.country} | {self.date}'

class FavouriteCities(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    city = models.ForeignKey(City, on_delete=models.CASCADE)

    class Meta:
         verbose_name_plural = "FavouriteCities"
    
    def __str__(self):
        return f'{self.user.username} | {self.city.name}'

class Forecast(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    t_max = models.CharField(max_length=20)
    t_min = models.CharField(max_length=20)
    icon = models.CharField(max_length=20)
    date = models.DateTimeField(max_length=20)

    class Meta:
         verbose_name_plural = "Forecasts"
    
    def __str__(self):
        return f'{self.city.name}, {self.city.state} - {self.city.country} | {self.date}'

class Hourly(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE)
    t = models.CharField(max_length=20)
    icon = models.CharField(max_length=20)
    date = models.DateTimeField(max_length=20)

    class Meta:
         verbose_name_plural = "Hourlies"
    
    def __str__(self):
        return f'{self.city.name} - {self.date} | {self.t}'