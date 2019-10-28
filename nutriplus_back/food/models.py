from django.db import models


class NutritionFacts(models.Model):
    calories = models.FloatField(default=0) # calories per measure_total_grams
    proteins = models.FloatField(default=0) # proteins per measure_total_grams
    carbohydrates = models.FloatField(default=0) # carbohydrates per measure_total_grams
    lipids = models.FloatField(default=0) # lipids per measure_total_grams
    fiber = models.FloatField(default=0) # fiber per measure_total_grams


class Food(models.Model):
    food_name = models.CharField(max_length=60)
    food_group = models.CharField(max_length=60)
    measure_total_grams = models.FloatField(default=100) # in grams
    measure_type = models.CharField(max_length=60) # homemade measure, such as a tablespoon or a cup of tea
    measure_amount = models.IntegerField() # amount of measure_type to reach measure_total_grams
    nutrition_facts = models.ForeignKey(NutritionFacts, on_delete=models.CASCADE)
    meal_number = models.IntegerField(default=0)
    # 1 = breakfast
    # 2 = morning snack
    # 3 = lunch
    # 4 = afternoon snack
    # 5 = pre workout
    # 6 = dinner
