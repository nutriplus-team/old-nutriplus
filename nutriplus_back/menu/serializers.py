from rest_framework import serializers


class AddNewMenuSerializer(serializers.Serializer):
    meal_type = serializers.CharField(max_length=10)
    foods = serializers.CharField(max_length=100)
    quantities = serializers.CharField(max_length=100)
