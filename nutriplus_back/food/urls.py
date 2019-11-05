from django.urls import path, re_path
from django.conf.urls import url
from .views import *

urlpatterns = [
    path(r'add-new/', AddNewFood.as_view(), name='NewFoodAddition'),
    path(r'add-meal/', AddNewMeal.as_view(), name='NewMealAddition'),
    path(r'edit-food/<int:id>/', EditFood.as_view(), name='EditFood'),
    path(r'edit-meal/<int:id>/', EditMeal.as_view(), name='EditMeal'),
    path(r'list-foods/', ListFoods.as_view(), name='ListFoods'),
    path(r'list-meals/', ListMeals.as_view(), name='ListMeals'),
    path(r'list-foods-pagination/', ListFoodsPagination.as_view(), name='ListFoods'),
    re_path(r'search/(?P<food_name>[\w ]+)/', SearchFood.as_view(), name='SearchFood'),
    path(r'remove/<int:id>/', RemoveFood.as_view(), name='RemoveFood'),
    path(r'remove-all/', RemoveAllFood.as_view(), name='RemoveAllFood'),
    path(r'get-units/', GetUnits.as_view(), name='GetUnits'),

]