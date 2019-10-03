from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import AddNewPatientSerializer
from .models import Patients


class AddNewPatient(generics.CreateAPIView):
    serializer_class = AddNewPatientSerializer
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        serializer = AddNewPatientSerializer(data=request.data)
        if serializer.is_valid():
            new_entry = Patients()
            new_entry.name = serializer.validated_data['patient']
            new_entry.date_of_birth = serializer.validated_data['date_of_birth']
            new_entry.food_choices = serializer.validated_data['food_choices']
            new_entry.nutritionist = request.user
            new_entry.save()


            return Response({'Info: Sucessfully created', new_entry}, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
