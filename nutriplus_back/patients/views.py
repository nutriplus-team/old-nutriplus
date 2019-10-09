from rest_framework import generics, status, pagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import AddNewPatientSerializer, PatientSerializer, AddPatientRecordSerializer, PatientRecordSerializer
from .models import Patients, PatientRecord

from django.db.models import Q
from django.utils import timezone



class PatientsPagination(pagination.PageNumberPagination):
    page_size = 10


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

            new_serializer = PatientSerializer(new_entry)

            return Response({'Info': 'Succesfully added', 'New Patient': new_serializer.data}, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditPatient(generics.UpdateAPIView):
    serializer_class = AddNewPatient
    permission_classes = (IsAuthenticated, )

    def get(self):
        id = self.kwargs['id']

        try:
            patient = Patients.objects.get(pk=id)
        except Patients.DoesNotExist:
            return Response({'Info': 'Not Found'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PatientSerializer(patient)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        id = self.kwargs['id']
        serializer = AddNewPatientSerializer(data=request.data)
        if serializer.is_valid():
            entry = Patients.objects.get(pk=id)
            entry.name = serializer.validated_data['patient']
            entry.date_of_birth = serializer.validated_data['date_of_birth']
            entry.food_choices = serializer.validated_data['food_choices']
            entry.save()

            new_serializer = PatientSerializer(entry)

            return Response({'Info': 'Succesfully edited', 'New Patient': new_serializer.data},
                            status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SearchPatients(generics.ListAPIView):
    serializer_class = PatientSerializer
    permission_classes = (IsAuthenticated, )
    pagination_class = PatientsPagination

    def get_queryset(self):
        patient_name = self.kwargs['name']
        nutritionist = self.request.user

        query_set = Patients.objects.filter(Q(nutritionist=nutritionist) & Q(name__icontains=patient_name)).order_by('name')

        return query_set

class AddPatientRecord(generics.CreateAPIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):

        id = kwargs['id']
        patient = Patients.objects.get(pk=id)

        serializer = AddPatientRecordSerializer(data=request.data)

        if serializer.is_valid():
            new_entry = PatientRecord()
            new_entry.patient = patient
            new_entry.corporal_mass = serializer.validated_data['corporal_mass']
            new_entry.height = serializer.validated_data['height']
            new_entry.BMI = serializer.validated_data['BMI']
            new_entry.food_restrictions = serializer.validated_data['food_restrictions']
            new_entry.observations = serializer.validated_data['observations']
            new_entry.date_modified = timezone.now()
            new_entry.save()

            new_serializer = PatientSerializer(new_entry)

            return Response({'Info': 'Sucessfully added', 'New record': new_serializer.data}, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
