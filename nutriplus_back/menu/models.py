from django.db import models
from food.models import Food
from patients.models import Patients


class Menu(models.Model):
    meal_type = models.CharField(max_length=50, default="")
    foods = models.ManyToManyField(Food)
    patients = models.ForeignKey(Patients, on_delete=models.CASCADE)
