from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from patients.models import Patients
from food.models import Meal, Food
from food.serializers import FoodSerializer


from .serializers import AddNewMenuSerializer
from .models import Menu
import random

import numpy as np

class AutoGenerateMenu(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )
    #permission_classes = (AllowAny, ) #For debugging only

    def post(self, request, *args, **kwargs):
        patient_id = kwargs['patient']

        try:
            patient = Patients.objects.get(pk=patient_id)
        except Patients.DoesNotExist:
            return Response({"Info:": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)


        if request.user == patient.nutritionist:

            meal_type = int(kwargs['meal'])

            patient_restrictions = patient.food_restrictions


            available_foods = Meal.objects.get(pk=meal_type).foods.exclude(
                pk__in=patient_restrictions.values_list('id', flat=True)
            )

            itens_for_menu = list()

            max_index = len(available_foods)

            weights = [1, 1, 1, 1, 1]

            if request.data['calories'] == 0:
                weights[0] = 0

            if request.data['proteins'] == 0:
                weights[1] = 0

            if request.data['carbohydrates'] == 0:
                weights[2] = 0

            if request.data['lipids'] == 0:
                weights[3] = 0

            if request.data['fiber'] == 0:
                weights[4] = 0


            target = [weights[0]*float(request.data['calories']),
                        weights[1]*float(request.data['proteins']),
                        weights[2]*float(request.data['carbohydrates']),
                        weights[3]*float(request.data['lipids']),
                        weights[4]*float(request.data['fiber'])]

            excluding = set()

            for i in range(0, 8):
                number = random.randrange(max_index)
                if number in excluding:
                    number = random.randrange(max_index)
                else:
                    excluding.add(number)
                itens_for_menu.append(available_foods[number])
            found, qty = self._meetInTheMiddle(itens_for_menu, target, weights)

            serializer = FoodSerializer(found, many=True)

            return Response({"Quantities": qty,"Suggestions": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"Info:": "This patient belongs to another nutritionist."},
                            status=status.HTTP_401_UNAUTHORIZED)

    def _rmse(self, predictions, targets):
        return np.sqrt(((np.array(predictions) - np.array(targets)) ** 2).mean())

    def _meetInTheMiddle(self, itens, target, weights):

        group1 = list()

        for i in range(0,16):
            num = [0, 0, 0, 0, 0]
            for j in range(1, 5):
                if 2**j & i == 2**j:
                    num = np.add(num, [weights[0] * itens[j].nutrition_facts.calories,
                           weights[1] * itens[j].nutrition_facts.proteins,
                           weights[2] * itens[j].nutrition_facts.carbohydrates,
                           weights[3] * itens[j].nutrition_facts.lipids,
                           weights[4] * itens[j].nutrition_facts.fiber])
            group1.append(num)

        group2 = list()

        for i in range(0,16):
            num =[0, 0, 0, 0, 0]

            for j in range(0,4):
                if 2**j & i == 2**j:
                    num = np.add(num, [weights[0]*itens[j+4].nutrition_facts.calories,
                      weights[1] * itens[j+4].nutrition_facts.proteins,
                      weights[2] * itens[j+4].nutrition_facts.carbohydrates,
                      weights[3] * itens[j+4].nutrition_facts.lipids,
                      weights[4] * itens[j+4].nutrition_facts.fiber])

            group2.append(num)

        found = None
        better = None
        options = [0.5, 1, 1.5, 2]

        for i in range(0,16):
            for j in range(0, 16):

                for k in range(0,4):
                    for l in range(0, 4):
                        result = self._rmse(np.add(np.multiply(options[k], group1[i]),
                                                   np.multiply(options[l], group2[j])), target)
                        if found is None and better is None:
                            better = result
                            found = [i, j, options[k], options[l]]
                        else:
                            if result < better:
                                better = result
                                found = [i, j, options[k], options[l]]


        solution = list()
        quantities = list()

        if better is not None:
            for i in range(0,4):
                if 2**i & found[0] == 2**i:
                    solution.append(itens[i])
                    quantities.append(found[2])

            for i in range(0, 4):
                if 2**i & found[1] == 2**i:
                    solution.append(itens[i+4])
                    quantities.append(found[3])

        return solution, quantities

class AddMenu(generics.CreateAPIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        id = kwargs['patient_id']

        try:
            patient = Patients.objects.get(pk=id)
        except Patients.DoesNotExist:
            return Response({"Info:": "Patient does not exist."}, status=status.HTTP_404_NOT_FOUND)

        if patient.nutritionist == request.user:
            serializer = AddNewMenuSerializer(data=request.data)
            if serializer.is_valid():
                new_entry = Menu()
                new_entry.quantities = serializer.validated_data['quantities']
                new_entry.patients = patient
                new_entry.meal_type = Meal.objects.get(pk=serializer.validated_data['meal_type'])

                new_entry.save()

                foods = str(serializer.validated_data['foods'])
                if len(foods) > 0:
                    list_of_foods = foods.split('&')
                    new_entry.foods.set(Food.objects.filter(pk__in=list_of_foods))
                else:
                    new_entry.foods.set([])

                new_entry.save()

                quantitites = str(new_entry.quantities)
                quantitites = quantitites.split('&')

                foods = new_entry.foods.order_by('food_name')
                food_serializer = FoodSerializer(foods, many=True)

                return Response(
                    {"pk": new_entry.id, "Meal_Type:": new_entry.meal_type.id, "Quantities": quantitites, "Foods": food_serializer.data})

            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"Info:" "This patient belongs to another nutritionist."}, status=status.HTTP_401_UNAUTHORIZED)

class GetMenu(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, id):
        menu_id = id
        try:
            menu = Menu.objects.get(pk=menu_id)
        except Menu.objects.DoesNotExist:
            return Response({"Info": "Requested Menu Does Not Exist."}, status=status.HTTP_404_NOT_FOUND)

        if menu.patients.nutritionist == request.user:
            quantitites = str(menu.quantities)
            quantitites = quantitites.split('&')

            foods = menu.foods.order_by('food_name')
            food_serializer = FoodSerializer(foods, many=True)

            return Response({"pk": menu.id,"Meal_Type:": menu.meal_type.id, "Quantities": quantitites, "Foods": food_serializer.data})
        else:
            return Response({"Info:": "You are not allowed to acess this menu"}, status=status.HTTP_401_UNAUTHORIZED)

class EditMenu(generics.UpdateAPIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        menu_id = kwargs['menu_id']

        try:
            menu = Menu.objects.get(pk=menu_id)
        except Patients.DoesNotExist:
            return Response({"Info:": "Menu does not exist."}, status=status.HTTP_404_NOT_FOUND)

        if menu.patients.nutritionist == request.user:
            serializer = AddNewMenuSerializer(data=request.data)
            if serializer.is_valid():
                menu.quantities = serializer.validated_data['quantities']
                menu.meal_type = Meal.objects.get(pk=serializer.validated_data['meal_type'])

                foods = str(serializer.validated_data['foods'])
                if len(foods) > 0:
                    list_of_foods = foods.split('&')
                    menu.foods.set(Food.objects.filter(pk__in=list_of_foods))
                else:
                    menu.foods.set([])

                menu.save()

                quantitites = str(menu.quantities)
                quantitites = quantitites.split('&')

                foods = menu.foods.order_by('food_name')
                food_serializer = FoodSerializer(foods, many=True)

                return Response(
                    {"pk": menu.id, "Meal_Type:": menu.meal_type.id, "Quantities": quantitites, "Foods": food_serializer.data})


            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"Info:" "This patient belongs to another nutritionist."}, status=status.HTTP_401_UNAUTHORIZED)

class DeleteMenu(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, id):
        menu_id = id

        try:
            menu = Menu.objects.get(pk=menu_id)
        except Menu.objects.DoesNotExist:
            return Response({"Info": "Menu does not exist"}, status=status.HTTP_404_NOT_FOUND)

        if menu.patients.nutritionist == request.user:
            menu.delete()
            return Response({"Info": "Successfully deleted."}, status=status.HTTP_200_OK)
        else:
            return Response({"Info": "You are not allowed to delete this menu."}, status=status.HTTP_401_UNAUTHORIZED)

class GetAllMenus(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        patient_id = kwargs['patient_id']

        try:
            patient = Patients.objects.get(pk=patient_id)
        except Patients.DoesNotExist:
            return Response({"Info": "Patient does no exist."}, status=status.HTTP_404_NOT_FOUND)

        if patient.nutritionist == request.user:
            menus = Menu.objects.all()

            response_data = list()

            for object in menus:
                quantitites = str(object.quantities)
                quantitites = quantitites.split('&')

                foods = object.foods.order_by('food_name')
                food_serializer = FoodSerializer(foods, many=True)

                response_data.append(
                    {"pk": object.id, "Meal_Type:": object.meal_type.id, "Quantities": quantitites,
                     "Foods": food_serializer.data})

            return Response(response_data, status=status.HTTP_200_OK)

        else:
            return Response({"Info:": "You are not allowed here."}, status=status.HTTP_401_UNAUTHORIZED)


class GetFromMeal(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        patient_id = kwargs['patient_id']
        meal_id = kwargs['meal_id']

        try:
            patient = Patients.objects.get(pk=patient_id)
        except Patients.DoesNotExist:
            return Response({"Info": "Patient does no exist."}, status=status.HTTP_404_NOT_FOUND)

        if patient.nutritionist == request.user:
            menus = Menu.objects.filter(meal_type=Meal.objects.get(pk=meal_id))

            response_data = list()

            for object in menus:
                quantitites = str(object.quantities)
                quantitites = quantitites.split('&')

                foods = object.foods.order_by('food_name')
                food_serializer = FoodSerializer(foods, many=True)

                response_data.append(
                    {"pk": object.id, "Meal_Type:": object.meal_type.id, "Quantities": quantitites,
                     "Foods": food_serializer.data})

            return Response(response_data, status=status.HTTP_200_OK)

        else:
            return Response({"Info:": "You are not allowed here."}, status=status.HTTP_401_UNAUTHORIZED)