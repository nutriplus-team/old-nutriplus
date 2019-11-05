from rest_framework import generics, status, pagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import *
from .models import *

from django.db.models import Q


class FoodPagination(pagination.PageNumberPagination):
    page_size = 10


class MealPagination(pagination.PageNumberPagination):
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
            new_food.save()


            meal_set = str(serializer.validated_data['meal_set'])
            if len(meal_set) > 0:
                list_of_meals = meal_set.split('&')
                new_food.meal_set.set(Meal.objects.filter(pk__in=list_of_meals))
            else:
                new_food.meal_set.set([])

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

            meal_set = str(serializer.validated_data['meal_set'])
            if len(meal_set) > 0:
                list_of_meals = meal_set.split('&')
                food.meal_set.set(Meal.objects.filter(pk__in=list_of_meals))
            else:
                food.meal_set.set([])

            food.food_name = serializer.validated_data['food_name']
            food.food_group = serializer.validated_data['food_group']
            food.measure_total_grams = serializer.validated_data['measure_total_grams']
            food.measure_type = serializer.validated_data['measure_type']
            food.measure_amount = serializer.validated_data['measure_amount']
            food.save()

            new_serializer = FoodSerializer(food)

            return Response({'Info': 'Successfully edited', 'Food': new_serializer.data},
                            status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListFoods(generics.ListAPIView):
    serializer_class = FoodSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self, *args, **kwargs):
        return Food.objects.all().order_by('food_name')


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
    
    def get(self, request, *args, **kwargs):
        id = kwargs['id']
        try:
            food = Food.objects.get(pk=id)
        except Food.DoesNotExist:
            return Response({'Info': 'Not Found'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = FoodSerializer(food)
        food.delete()
        return Response({'Info': 'Successfully deleted', 'Food': serializer.data}, status=status.HTTP_204_NO_CONTENT)


class RemoveAllFood(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        food = Food.objects.all()
        food.delete()
        return Response({'Info': 'Successfully deleted'}, status=status.HTTP_204_NO_CONTENT)


class AddNewMeal(generics.CreateAPIView):
    serializer_class = AddNewMealSerializer
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        serializer = AddNewMealSerializer(data=request.data)
        if serializer.is_valid():
            new_meal = Meal()

            new_meal.meal_name = serializer.validated_data['meal_name']
            new_meal.save() # Must save parent model first, and only after that you can add m2m values

            foods = str(serializer.validated_data['foods'])
            if len(foods) > 0:
                list_of_foods = foods.split('&')
                new_meal.foods.set(Food.objects.filter(pk__in=list_of_foods))
            else:
                new_meal.foods.set([])

            new_meal.save()

            new_serializer = MealSerializer(new_meal)

            return Response({'Info': 'Successfully added', 'New Meal': new_serializer.data}, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditMeal(generics.UpdateAPIView):
    serializer_class = AddNewMeal
    permission_classes = (IsAuthenticated, )

    def get(self, *args, **kwargs):
        id = kwargs['id']

        try:
            meal = Meal.objects.get(pk=id)
        except Meal.DoesNotExist:
            return Response({'Info': 'Not Found'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = FoodSerializer(meal)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, id):
        #id = self.kwargs['id']
        serializer = AddNewMealSerializer(data=request.data)
        if serializer.is_valid():
            meal = Meal.objects.get(pk=id)

            meal.meal_name = serializer.validated_data['meal_name']
            foods = str(serializer.validated_data['foods'])
            if len(foods) > 0:
                list_of_foods = foods.split('&')
                meal.foods.set(Food.objects.filter(pk__in=list_of_foods))
            else:
                meal.foods.set([])

            meal.save()

            new_serializer = MealSerializer(meal)

            return Response({'Info': 'Successfully edited', 'Meal': new_serializer.data},
                            status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListMeals(generics.ListAPIView):
    serializer_class = MealSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self, *args, **kwargs):
        return Meal.objects.all().order_by('meal_name')


class GetMeal(generics.ListAPIView):
    serializer_class = MealSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = MealPagination

    def get(self, *args, **kwargs):
        id = kwargs['id']

        try:
            meal = Meal.objects.get(pk=id)
        except Meal.DoesNotExist:
            return Response({'Info': 'Not Found'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = MealSerializer(meal)

        return Response(serializer.data, status=status.HTTP_200_OK)



class GetUnits(APIView):
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        return Response({'calories': 'kcal',
                         'proteins': 'g',
                         'carbohydrates': 'g',
                         'lipids': 'g',
                         'fiber': 'g'}, status=status.HTTP_200_OK)
