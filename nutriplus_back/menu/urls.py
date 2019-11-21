from django.urls import path

from .views import (AutoGenerateMenu, AddMenu, EditMenu, DeleteMenu, GetMenu,
                    GetAllMenus, GetFromMeal)

urlpatterns = [
    path(r'generate/<int:meal>/<int:patient>/', AutoGenerateMenu.as_view(), name="Teste"),
    path(r'add-new/<int:patient_id>/', AddMenu.as_view(), name='AddNewMenu'),
    path(r'edit/<int:menu_id>/', EditMenu.as_view(), name='EditMenu'),
    path(r'get/<int:id>/', GetMenu.as_view(), name='GetMenu'),
    path(r'delete/<int:id>/', DeleteMenu.as_view(), name='DeleteMenu'),
    path(r'get-all/<int:patient_id>/', GetAllMenus.as_view(), name='GetAllMenus'),
    path(r'get-from-meal/<int:patient_id>/<int:meal_id>/', GetFromMeal.as_view(), name='GetFromMeal'),
]