from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from patients.models import Patients
from food.models import Meal, Food
from food.serializers import FoodSerializer


from .serializers import AddNewMenuSerializer, MenuSerializer, SubstituteFoodsSerializer
from .models import Menu, Portions
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

            weights = [0.7, 10, 1, 1, 1]

            if request.data['calories'] == '0':
                weights[0] = 0

            if request.data['proteins'] == '0':
                weights[1] = 0

            if request.data['carbohydrates'] == '0':
                weights[2] = 0

            if request.data['lipids'] == '0':
                weights[3] = 0

            if request.data['fiber'] == '0':
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
                    tries = 0
                    while tries < 3 and number in excluding:
                        number = random.randrange(max_index)
                        tries += 1
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
                new_entry.patients = patient
                new_entry.meal_type = Meal.objects.get(pk=serializer.validated_data['meal_type'])

                new_entry.save()

                foods = str(serializer.validated_data['foods'])
                quantities = str(serializer.validated_data['quantities'])


                if len(foods) > 0 and len(quantities) > 0:
                    list_of_foods = foods.split('&')
                    list_of_quantities = quantities.split('&')

                    for food, qty in zip(list_of_foods, list_of_quantities):
                        new_portion = Portions()
                        try:
                            new_portion.food = Food.objects.get(pk=int(food))
                        except Food.DoesNotExist:
                            return Response({"Info:": "Food id not found."}, status=status.HTTP_404_NOT_FOUND)
                        new_portion.quantity = qty

                        new_portion.save()

                        new_entry.portions.add(new_portion)


                new_entry.save()

                menu_serializer = MenuSerializer(new_entry)

                return Response({"Info:": "Successfully added.", "Data:": menu_serializer.data}, status=status.HTTP_200_OK)

            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"Info:" "This patient belongs to another nutritionist."}, status=status.HTTP_401_UNAUTHORIZED)

class GetMenu(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = MenuSerializer

    def get(self, request, id):
        menu_id = id
        try:
            menu = Menu.objects.get(pk=menu_id)
        except Menu.objects.DoesNotExist:
            return Response({"Info": "Requested Menu Does Not Exist."}, status=status.HTTP_404_NOT_FOUND)

        if menu.patients.nutritionist == request.user:
            serializer = MenuSerializer(menu, read_only=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
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
                menu.meal_type = Meal.objects.get(pk=serializer.validated_data['meal_type'])

                foods = str(serializer.validated_data['foods'])
                quantities = str(serializer.validated_data['quantities'])

                menu.portions.set([])
                menu.save()

                if len(foods) > 0 and len(quantities) > 0:
                    list_of_foods = foods.split('&')
                    list_of_quantities = quantities.split('&')

                    for food, qty in zip(list_of_foods, list_of_quantities):
                        new_portion = Portions()
                        try:
                            new_portion.food = Food.objects.get(pk=int(food))
                        except Food.DoesNotExist:
                            return Response({"Info:": "Food id not found."}, status=status.HTTP_404_NOT_FOUND)
                        new_portion.quantity = qty

                        new_portion.save()

                        menu.portions.add(new_portion)

                menu.save()


                menu_serializer = MenuSerializer(menu)

                return Response({"Info:": "Successfully edited.", "Data:": menu_serializer.data}, status=status.HTTP_200_OK)

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
        except Menu.DoesNotExist:
            return Response({"Info": "Menu does not exist"}, status=status.HTTP_404_NOT_FOUND)

        if menu.patients.nutritionist == request.user:
            Portions.objects.filter(pk__in=menu.portions.values_list('id', flat=True)).delete()
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
            menus = Menu.objects.filter(patients=patient)

            serializer = MenuSerializer(menus, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
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
            menus = menus.filter(patients=patient)

            serializer = MenuSerializer(menus, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response({"Info:": "You are not allowed here."}, status=status.HTTP_401_UNAUTHORIZED)

class SubstituteMenu(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        meal_id = kwargs['meal_id']
        patient_id = kwargs['patient_id']

        try:
            patient = Patients.objects.get(pk=patient_id)
        except Patients.DoesNotExist:
            return Response({"Info:": "Patient nto found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = SubstituteFoodsSerializer(data=request.data)
        if serializer.is_valid():
            foods = str(serializer.validated_data['foods'])
            quantities = str(serializer.validated_data['quantities'])

            list_of_foods = list()

            best_replacements = list()
            best_qtys = list()

            if len(foods) > 0 and len(quantities) > 0:
                foods = foods.split('&')
                quantities = quantities.split('&')

                quantities = [float(i) for i in quantities]

                for element in foods:
                    try:
                        food = Food.objects.get(pk=int(element))
                    except Food.DoesNotExist:
                        return Response({"Info:": "Food id not found."}, status=status.HTTP_404_NOT_FOUND)

                    list_of_foods.append(food)


                for food, qty in zip(list_of_foods, quantities):
                    best_food, best_qty = self._findSubstitutes(food, qty, meal_id, patient)
                    best_replacements.append(best_food)
                    best_qtys.append(best_qty)

                new_serializer = FoodSerializer(best_replacements, many=True)

                return Response({"Quantities:": best_qtys, "Replacements": new_serializer.data},
                                status=status.HTTP_200_OK)

            else:
                return Response({"Info:": "List contains no id or no quantity."}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({"Info:": "Some fields are missing."}, status=status.HTTP_400_BAD_REQUEST)

    def _rmse(self, predictions, target):
        return np.sqrt(((predictions - target)**2).mean())

    def _findSubstitutes(self, food, quantity, meal, patient):

        food_restrictions = patient.food_restrictions

        similar = Meal.objects.get(pk=int(meal)).foods.exclude(pk__in=food_restrictions.values_list('id', flat=True))
        similar = similar.filter(food_group=food.food_group)

        similar_size = len(similar)

        excluding = set()
        excluding.add(food.id)

        to_evaluate = list()

        if similar_size > 10:
            for i in range(0,10):
                number = random.randrange(similar_size)
                if number in excluding:
                    number = random.randrange(similar_size)
                else:
                    excluding.add(number)

                to_evaluate.append(similar[number])
        else:
            to_evaluate = similar.exclude(pk=food.id)

        food_properties = np.array([food.nutrition_facts.calories, food.nutrition_facts.proteins,
                                    food.nutrition_facts.carbohydrates, food.nutrition_facts.lipids,
                                    food.nutrition_facts.fiber])
        food_properties = food_properties*quantity

        weights = np.array([0.7, 10, 1, 1, 1])

        weighted_properties = np.multiply(food_properties, weights)

        options = [0.5, 1, 1.5, 2]

        min_error = 10**20

        best_substitute = None
        best_qty = None

        for element in to_evaluate:
            element_properties = np.array([element.nutrition_facts.calories, element.nutrition_facts.proteins,
                                           element.nutrition_facts.carbohydrates, element.nutrition_facts.lipids,
                                           element.nutrition_facts.fiber])
            for factor in options:
                factored_properties = factor*element_properties
                error = self._rmse(np.multiply(weights, factored_properties), weighted_properties)

                if error < min_error:
                    min_error = error
                    best_substitute = element
                    best_qty = factor

        return best_substitute, best_qty

