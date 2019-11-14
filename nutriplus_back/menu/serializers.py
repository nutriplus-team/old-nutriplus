from rest_framework import serializers
from food.serializers import FoodSerializer
from .models import Menu


class AddNewMenuSerializer(serializers.Serializer):
    meal_type = serializers.CharField(max_length=50, default="")
    #foods = serializers.ManyToManyField(Food)
    #patients = serializers.ForeignKey(Patients, on_delete=models.CASCADE)


class MenuSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True, many=True)
    class Meta:
        model = Menu
        fields = ('id', 'meal_type', 'foods')
