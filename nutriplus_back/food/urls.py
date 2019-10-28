from django.urls import path, re_path
from django.conf.urls import url
from .views import *

urlpatterns = [
    path(r'add-new/', AddNewFood.as_view(), name='NewFoodAddition'),
    path(r'edit/<int:id>/', EditFood.as_view(), name='EditFood'),
    path(r'list-foods/', ListFoods.as_view(), name='ListFoods'),
    path(r'list-foods-pagination/', ListFoodsPagination.as_view(), name='ListFoods'),
    re_path(r'search/(?P<food_name>[\w ]+)/', SearchFood.as_view(), name='SearchFood'),
    path(r'remove/<int:id>/', RemoveFood.as_view(), name='RemoveFood'),
    path(r'get-units/', GetUnits.as_view(), name='GetUnits'),

]