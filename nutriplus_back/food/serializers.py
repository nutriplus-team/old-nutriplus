from rest_framework import serializers
from .models import *


class AddNewFoodSerializer(serializers.Serializer):
    food_name = serializers.CharField(max_length=60)
    food_group = serializers.CharField(max_length=60)
    measure_total_grams = serializers.FloatField()  # in grams
    measure_type = serializers.CharField(max_length=60)  # homemade measure, such as a tablespoon or a cup of tea
    measure_amount = serializers.IntegerField()  # amount of measure_type to reach measure_total_grams
    calories = serializers.FloatField()  # calories per measure_total_grams
    proteins = serializers.FloatField()  # proteins per measure_total_grams
    carbohydrates = serializers.FloatField()  # carbohydrates per measure_total_grams
    lipids = serializers.FloatField()  # lipids per measure_total_grams
    fiber = serializers.FloatField()  # fiber per measure_total_grams


class NutritionFactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionFacts
        fields = ('calories', 'proteins', 'carbohydrates', 'lipids', 'fiber')


class FoodSerializer(serializers.ModelSerializer):
    nutrition_facts = NutritionFactsSerializer()

    class Meta:
        model = Food
        fields = ('id', 'food_name', 'food_group', 'measure_total_grams', 'measure_type',
                  'measure_amount', 'nutrition_facts', 'meal_number')
