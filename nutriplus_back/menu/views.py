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
    #permission_classes = (IsAuthenticated, )
    permission_classes = (AllowAny, ) #For debugging only

    def post(self, request, *args, **kwargs):

        meal_type = int(kwargs['meal'])
        patient_id = kwargs['patient']

        patient_restrictions = Patients.objects.get(pk=patient_id).food_restrictions

        #TODO:Caso o Ocimar mude as tabelas de comida com o meal_type, precisa mudar essa funcao de baixo (precisa ter um dicionario entre numero da refeicao e classe)
        # available_foods = Food.objects.filter(meal_number=meal_type).exclude(
        #      pk__in=patient_restrictions.values_list('id', flat=True))

        available_foods = Meal.objects.get(pk=meal_type).foods.exclude(
            pk__in=patient_restrictions.values_list('id', flat=True)
        )

        itens_for_menu = list()

        max_index = len(available_foods)

        #weights = [1, 10**8, 10**4, 10**2, 2]
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
        #
        # target = weights[0]*float(request.data['calories']) + \
        #             weights[1]*float(request.data['proteins']) + \
        #             weights[2]*float(request.data['carbohydrates']) + \
        #             weights[3]*float(request.data['lipids']) + \
        #             weights[4]*float(request.data['fiber'])

        target = [weights[0]*float(request.data['calories']),
                    weights[1]*float(request.data['proteins']),
                    weights[2]*float(request.data['carbohydrates']),
                    weights[3]*float(request.data['lipids']),
                    weights[4]*float(request.data['fiber'])]


        # for i in range(0,10):
        for i in range(0, 8):
            itens_for_menu.append(available_foods[random.randrange(max_index)])
        found = self._meetInTheMiddle(itens_for_menu, target, weights)
            # if len(found) > 0:
            #      break

        serializer = FoodSerializer(found, many=True)

        return Response({"Sugestions": serializer.data}, status=status.HTTP_200_OK)

    def _rmse(self, predictions, targets):
        return np.sqrt(((np.array(predictions) - np.array(targets)) ** 2).mean())

    def _meetInTheMiddle(self, itens, target, weights):

        group1 = list()

        #group1.append(0)
        for i in range(0,16):
            num = [0, 0, 0, 0, 0]
            for j in range(1, 5):
                if 2**j & i == 2**j:
                    # num += weights[0]*itens[j].nutrition_facts.calories + \
                    #   weights[1] * itens[j].nutrition_facts.proteins + \
                    #   weights[2] * itens[j].nutrition_facts.carbohydrates + \
                    #   weights[3] * itens[j].nutrition_facts.lipids + \
                    #   weights[4] * itens[j].nutrition_facts.fiber
                    num = np.add(num, [weights[0] * itens[j].nutrition_facts.calories,
                           weights[1] * itens[j].nutrition_facts.proteins,
                           weights[2] * itens[j].nutrition_facts.carbohydrates,
                           weights[3] * itens[j].nutrition_facts.lipids,
                           weights[4] * itens[j].nutrition_facts.fiber])
            group1.append(num)

        group2 = list()
        #group2.append(0)

        for i in range(0,16):
            num =[0, 0, 0, 0, 0]

            for j in range(0,4):
                if 2**j & i == 2**j:
                    # num += weights[0]*itens[j+4].nutrition_facts.calories + \
                    #   weights[1] * itens[j+4].nutrition_facts.proteins + \
                    #   weights[2] * itens[j+4].nutrition_facts.carbohydrates + \
                    #   weights[3] * itens[j+4].nutrition_facts.lipids + \
                    #   weights[4] * itens[j+4].nutrition_facts.fiber
                    num = np.add(num, [weights[0]*itens[j+4].nutrition_facts.calories,
                      weights[1] * itens[j+4].nutrition_facts.proteins,
                      weights[2] * itens[j+4].nutrition_facts.carbohydrates,
                      weights[3] * itens[j+4].nutrition_facts.lipids,
                      weights[4] * itens[j+4].nutrition_facts.fiber])

            group2.append(num)


        #To improve the algorithm efficiency, you should decrease the search interval
        # minimum_target = 0.9*target
        # maximum_target = 1*target

        better = None
        # for i in range(0,16):
        #     for j in range(0, 5):
        #         found = None
        #         if minimum_target <= group1[i] + group2[j] <= maximum_target:
        #             found = [i, j, 1, 1]
        #         elif minimum_target <= 2*group1[i] + group2[j] <= maximum_target:
        #             found = [i, j, 2, 1]
        #         elif minimum_target <= group1[i] + 2*group2[j] <= maximum_target:
        #             found = [i, j, 1, 2]
        #         elif minimum_target <= 2*group1[i] + 2*group2[j] <= maximum_target:
        #             found = [i, j, 2, 2]
        #         if found is not None:
        #             if better is not None:
        #                 max = group1[better[0]]*better[2] + group2[better[1]]*better[3]
        #                 new = group1[found[0]]*found[2] + group2[found[1]]*found[3]
        #                 if new > max:
        #                     better = found
        #             else:
        #                 better = found

        for i in range(0,16):
            for j in range(0, 5):
                found = None
                result1 = self._rmse(np.add(group1[i], group2[i]), target)
                result2 = self._rmse(np.add(np.multiply(2, group1[i]), group2[i]), target)
                result3 = self._rmse(np.add(group1[i], np.multiply(2, group2[i])), target)
                result4 = self._rmse(np.add(np.multiply(2, group1[i]), np.multiply(2, group2[i])), target)

                minimum = min(result1, result2, result3, result4)

                if result1 == minimum:
                    found = [i, j, 1, 1]
                elif result2 == minimum:
                    found = [i, j, 2, 1]
                elif result3 == minimum:
                    found = [i, j, 1, 2]
                elif result4 == minimum:
                    found = [i, j, 2, 2]
                if found is not None:
                    if better is not None:
                        max = self._rmse(target, np.add(np.multiply(group1[better[0]],better[2]), np.multiply(group2[better[1]],better[3])))
                        new = self._rmse(target, np.add(np.multiply(group1[found[0]],found[2]), np.multiply(group2[found[1]],found[3])))
                        if new < max:
                            better = found
                    else:
                        better = found

        solution = list()

        if better is not None:
            for i in range(0,4):
                if 2**i & better[0] == 2**i:
                    solution.append(itens[i])
                    if better[2] == 2:
                        solution.append(itens[i])

                if 2**i & better[2] == 2**i:
                    solution.append(itens[i+4])
                    if better[3] == 2:
                        solution.append(itens[i+4])

        return solution