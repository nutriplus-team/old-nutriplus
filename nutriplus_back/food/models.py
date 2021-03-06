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
    # meal_set


class Meal(models.Model):
    meal_name = models.CharField(max_length=60, blank=False)
    # Only:
    # 1 = Breakfast
    # 2 = Morning snack
    # 3 = Lunch
    # 4 = Afternoon snack
    # 5 = Pre workout
    # 6 = Dinner

    foods = models.ManyToManyField(Food, blank=True)
