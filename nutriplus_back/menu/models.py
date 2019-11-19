from django.db import models
from food.models import Food, Meal
from patients.models import Patients


class Menu(models.Model):
    meal_type = models.ForeignKey(Meal, on_delete=models.CASCADE)
    foods = models.ManyToManyField(Food)
    patients = models.ForeignKey(Patients, on_delete=models.CASCADE)
    quantities = models.CharField(max_length=100) #Quantidades em ordem alfabetica
