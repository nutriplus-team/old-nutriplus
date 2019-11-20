from django.db import models
from food.models import Food, Meal
from patients.models import Patients


class Portions(models.Model):
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    quantity = models.FloatField(blank=True)

class Menu(models.Model):
    meal_type = models.ForeignKey(Meal, on_delete=models.CASCADE)
    patients = models.ForeignKey(Patients, on_delete=models.CASCADE)
    portions = models.ManyToManyField(Portions)
