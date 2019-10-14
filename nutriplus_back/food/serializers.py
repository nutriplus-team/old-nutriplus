from rest_framework import serializers
from .models import Food


class AddNewFoodSerializer(serializers.Serializer):
    food_name = serializers.CharField(max_length=60)
    food_group = serializers.CharField(max_length=60)
    measure_total_grams = serializers.FloatField()  # in grams
    measure_type = serializers.CharField(max_length=60)  # homemade measure, such as a tablespoon or a cup of tea
    measure_amount = serializers.IntegerField()  # amount of mearue_type to reach measure_total_grams
    calories = serializers.FloatField()  # calories per measure
    proteins = serializers.FloatField()  # proteins per measure
    carbohydrates = serializers.FloatField()  # carbohydrates per measure
    lipids = serializers.FloatField()  # lipids per measure


class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ('id', 'food_name', 'food_group', 'measure_total_grams', 'measure_type', 'measure_amount', 'calories',
                  'proteins', 'carbohydrates', 'lipids')
