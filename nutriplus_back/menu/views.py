from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from patients.models import Patients
from food.models import Meal
from food.models import Food
from food.serializers import FoodSerializer

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

            return Response({"Quantities:": qty,"Suggestions": serializer.data}, status=status.HTTP_200_OK)
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