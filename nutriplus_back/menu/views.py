from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from patients.models import Patients
from food.models import Food


class AutoGenerateMenu(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )

    def post(self, *args, **kwargs):
        #TODO: Get post parameters and impelement meet-in-the-middle

        meal_type = kwargs['meal']
        patient_id = kwargs['patient']

        patient_restrictions = Patients.objects.get(pk=patient_id).food_restrictions

        available_foods = Food.objects.filter(meal_number=meal_type).exclude(
            pk__in=patient_restrictions.values_list('id', flat=True))

        itens_for_menu = list()

        for i in range(0, 8):
            itens_for_menu.append(available_foods[i])

        weights = [1, 10**2, 10**4, 10**8]

        #print(itens_for_menu[1].nutrition_facts.proteins)

        return Response({"Info": "Teste"}, status=status.HTTP_200_OK)

    def meetInTheMiddle(self, itens, target, weights):
        pass

