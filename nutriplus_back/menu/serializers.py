from rest_framework import serializers
from food.serializers import FoodSerializer

from .models import Portions, Menu

class AddNewMenuSerializer(serializers.Serializer):
    meal_type = serializers.CharField(max_length=10)
    foods = serializers.CharField(max_length=100)
    quantities = serializers.CharField(max_length=100)

class PortionSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)

    class Meta:
        model = Portions
        fields = ('quantity', 'food')


class MenuSerializer(serializers.ModelSerializer):
    portions = PortionSerializer(many=True, read_only=True)

    class Meta:
        model = Menu
        fields = ('id', 'meal_type', 'portions')



