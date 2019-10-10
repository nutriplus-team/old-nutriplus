from rest_framework import serializers
from .models import Food


class AddNewFoodSerializer(serializers.Serializer):
    food_name = serializers.CharField(max_length=60)
    measure = serializers.FloatField()  # in grams
    calories = serializers.FloatField()  # calories per measure
    proteins = serializers.FloatField()  # proteins per measure
    carbohydrates = serializers.FloatField()  # carbohydrates per measure
    lipids = serializers.FloatField()  # lipids per measure


class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ('id', 'food_name', 'measure', 'calories', 'proteins', 'carbohydrates', 'lipids')
