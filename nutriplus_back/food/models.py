from django.db import models


class Foods(models.Model):
    measure = models.FloatField(default=0) # in grams
    calories = models.FloatField(default=0) # calories per measure
    proteins = models.FloatField(default=0) # proteins per measure
    carbohydrates = models.FloatField(default=0) # carbohydrates per measure
    lipids = models.FloatField(default=0) # lipids per measure

