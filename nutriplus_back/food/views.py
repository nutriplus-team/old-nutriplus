from rest_framework import generics, status, pagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import AddNewFoodSerializer, FoodSerializer
from .models import Food

from django.db.models import Q
import datetime


class FoodPagination(pagination.PageNumberPagination):
    page_size = 10


class AddNewFood(generics.CreateAPIView):
    serializer_class = AddNewFoodSerializer
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        serializer = AddNewFoodSerializer(data=request.data)
        if serializer.is_valid():
            new_entry = Food()
            new_entry.food_name = serializer.validated_data['food_name']
            new_entry.measure = serializer.validated_data['measure']
            new_entry.calories = serializer.validated_data['calories']
            new_entry.proteins = serializer.validated_data['proteins']
            new_entry.carbohydrates = serializer.validated_data['carbohydrates']
            new_entry.lipids = serializer.validated_data['lipids']
            new_entry.save()

            new_serializer = FoodSerializer(new_entry)

            return Response({'Info': 'Succesfully added', 'New Food': new_serializer.data}, status=status.HTTP_200_OK)

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
            entry = Food.objects.get(pk=id)
            entry.food_name = serializer.validated_data['food_name']
            entry.measure = serializer.validated_data['measure']
            entry.calories = serializer.validated_data['calories']
            entry.proteins = serializer.validated_data['proteins']
            entry.carbohydrates = serializer.validated_data['carbohydrates']
            entry.lipids = serializer.validated_data['lipids']
            entry.save()

            new_serializer = FoodSerializer(entry)

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
