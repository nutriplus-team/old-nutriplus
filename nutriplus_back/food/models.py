from django.db import models


class Food(models.Model):
    food_name = models.CharField(max_length=60)
    food_group = models.CharField(max_length=60)
    measure_total_grams = models.FloatField(default=100) # in grams
    measure_type = models.CharField(max_length=60) # homemade measure, such as a tablespoon or a cup of tea
    measure_amount = models.IntegerField() # amount of mearue_type to reach measure_total_grams
    calories = models.FloatField(default=0) # calories per measure
    proteins = models.FloatField(default=0) # proteins per measure
    carbohydrates = models.FloatField(default=0) # carbohydrates per measure
    lipids = models.FloatField(default=0) # lipids per measure
