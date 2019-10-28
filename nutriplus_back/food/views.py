from rest_framework import generics, status, pagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import *
from .models import *

from django.db.models import Q


class FoodPagination(pagination.PageNumberPagination):
    page_size = 10


class AddNewFood(generics.CreateAPIView):
    serializer_class = AddNewFoodSerializer
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        serializer = AddNewFoodSerializer(data=request.data)
        if serializer.is_valid():
            new_nutrition_facts = NutritionFacts()
            new_nutrition_facts.calories = serializer.validated_data['calories']
            new_nutrition_facts.proteins = serializer.validated_data['proteins']
            new_nutrition_facts.carbohydrates = serializer.validated_data['carbohydrates']
            new_nutrition_facts.lipids = serializer.validated_data['lipids']
            new_nutrition_facts.fiber = serializer.validated_data['fiber']
            new_nutrition_facts.save()

            new_food = Food()
            new_food.food_name = serializer.validated_data['food_name']
            new_food.food_group = serializer.validated_data['food_group']
            new_food.measure_total_grams = serializer.validated_data['measure_total_grams']
            new_food.measure_type = serializer.validated_data['measure_type']
            new_food.measure_amount = serializer.validated_data['measure_amount']
            new_food.nutrition_facts = new_nutrition_facts
            new_food.meal_number = serializer.validated_data['meal_number']
            new_food.save()

            new_serializer = FoodSerializer(new_food)

            return Response({'Info': 'Successfully added', 'New Food': new_serializer.data}, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditFood(generics.UpdateAPIView):
    serializer_class = AddNewFood
    permission_classes = (IsAuthenticated, )

    def get(self, *args, **kwargs):
        id = kwargs['id']

        try:
            food = Food.objects.get(pk=id)
        except Food.DoesNotExist:
            return Response({'Info': 'Not Found'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = FoodSerializer(food)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, id):
        #id = self.kwargs['id']
        serializer = AddNewFoodSerializer(data=request.data)
        if serializer.is_valid():
            food = Food.objects.get(pk=id)

            nutrition_facts = food.nutrition_facts
            nutrition_facts.calories = serializer.validated_data['calories']
            nutrition_facts.proteins = serializer.validated_data['proteins']
            nutrition_facts.carbohydrates = serializer.validated_data['carbohydrates']
            nutrition_facts.lipids = serializer.validated_data['lipids']
            nutrition_facts.fiber = serializer.validated_data['fiber']
            nutrition_facts.save()

            food.food_name = serializer.validated_data['food_name']
            food.food_group = serializer.validated_data['food_group']
            food.measure_total_grams = serializer.validated_data['measure_total_grams']
            food.measure_type = serializer.validated_data['measure_type']
            food.measure_amount = serializer.validated_data['measure_amount']
            food.save()

            new_serializer = FoodSerializer(food)

            return Response({'Info': 'Succesfully edited', 'Food': new_serializer.data},
                            status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListFoods(generics.ListAPIView):
    serializer_class = FoodSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self, *args, **kwargs):
        return Food.objects.all()


class ListFoodsPagination(generics.ListAPIView):
    serializer_class = FoodSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = FoodPagination

    def get_queryset(self, *args, **kwargs):
        return Food.objects.all().order_by('food_name')


class SearchFood(generics.ListAPIView):
    serializer_class = FoodSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = FoodPagination

    def get_queryset(self):
        food_name = self.kwargs['food_name']

        query_set = Food.objects.filter(Q(food_name__icontains=food_name)).order_by('food_name')

        return query_set


class RemoveFood(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated, )


class GetUnits(APIView):
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        return Response({'calories': 'kcal',
                         'proteins': 'g',
                         'carbohydrates': 'g',
                         'lipids': 'g',
                         'fiber': 'g'}, status=status.HTTP_200_OK)
