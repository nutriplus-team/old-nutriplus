from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from patients.models import Patients


class AutoGenerateMenu(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, *args, **kwargs):
        meal_type = kwargs['meal']
        patient_id = kwargs['patient']

        patient_restrictions = Patients.objects.get(pk=patient_id).food_restrictions

        print(patient_restrictions)

        return Response({"Info": "Teste"}, status=status.HTTP_200_OK)