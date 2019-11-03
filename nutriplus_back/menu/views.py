from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from patients.models import Patients
from food.models import Food

import random

class AutoGenerateMenu(generics.GenericAPIView):
    #TODO: Mudar aqui
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        #TODO: Get post parameters and impelement meet-in-the-middle

        meal_type = kwargs['meal']
        patient_id = kwargs['patient']

        patient_restrictions = Patients.objects.get(pk=patient_id).food_restrictions

        available_foods = Food.objects.filter(meal_number=meal_type).exclude(
             pk__in=patient_restrictions.values_list('id', flat=True))


        itens_for_menu = list()

        max_index = len(available_foods)

        weights = [1, 10**2, 10**4, 10**8, 2]

        if request.data['fiber'] == 0:
            weights[4] = 0

        target = weights[0]*float(request.data['calories']) + \
                    weights[1]*float(request.data['proteins']) + \
                    weights[2]*float(request.data['carbohydrates']) + \
                    weights[3]*float(request.data['lipids']) + \
                    weights[4]*float(request.data['fiber'])


        for i in range(0,10):
            for i in range(0, 8):
                itens_for_menu.append(available_foods[random.randrange(max_index)])
            found = self._meetInTheMiddle(itens_for_menu, target, weights)
            if found is not None:
                 break




        return Response({"Info": "Teste"}, status=status.HTTP_200_OK)

    def _meetInTheMiddle(self, itens, target, weights):

        group1 = list()

        group1.append(0)
        for i in range(0,16):
            num = 0
            for j in range(0, 4):
                if j & i == j:
                    num += weights[0]*itens[j].nutrition_facts.calories + \
                      weights[1] * itens[j].nutrition_facts.proteins + \
                      weights[2] * itens[j].nutrition_facts.carbohydrates + \
                      weights[3] * itens[j].nutrition_facts.lipids + \
                      weights[4] * itens[j].nutrition_facts.fiber
            group1.append(num)

        group2 = list()
        group2.append(0)

        for i in range(0,16):
            num = 0

            for j in range(0,4):
                if j & i == j:
                    num += weights[0]*itens[j+4].nutrition_facts.calories + \
                      weights[1] * itens[j+4].nutrition_facts.proteins + \
                      weights[2] * itens[j+4].nutrition_facts.carbohydrates + \
                      weights[3] * itens[j+4].nutrition_facts.lipids + \
                      weights[4] * itens[j+4].nutrition_facts.fiber
            group2.append(num)

        #To improve the algorithm efficiency, you should decrease the search interval
        minimum_target = 0.7*target
        maximum_target = 1.3*target

        better = None
        for i in range(0,16):
            for j in range(0, 5):
                found = None
                if minimum_target <= group1[i] + group2[j] <= maximum_target:
                    found = [i, j, 1, 1]
                elif minimum_target <= 2*group1[i] + group2[j] <= maximum_target:
                    found = [i, j, 2, 1]
                elif minimum_target <= group1[i] + 2*group2[j] <= maximum_target:
                    found = [i, j, 1, 2]
                elif minimum_target <= 2*group1[i] + 2*group2[j] <= maximum_target:
                    found = [i, j, 2, 2]
                if found is not None:
                    if better is not None:
                        max = group1[better[0]]*better[2] + group2[better[1]]*better[3]
                        new = group1[found[0]]*found[2] + group2[found[1]]*found[3]
                        if new > max:
                            better = found
                    else:
                        better = found


        return better