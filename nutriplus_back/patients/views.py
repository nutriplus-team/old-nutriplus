from rest_framework import generics, status, pagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import AddNewPatientSerializer, PatientSerializer, AddPatientRecordSerializer, PatientRecordSerializer
from .models import Patients, PatientRecord
from food.models import Food

from django.db.models import Q
import datetime


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
            new_entry.biological_sex = serializer.validated_data['biological_sex']
            new_entry.ethnic_group = serializer.validated_data['ethnic_group']
            new_entry.nutritionist = request.user
            new_entry.save()

            food_restrictions = str(serializer.validated_data['food_restrictions'])
            if len(food_restrictions) > 0:
                list_of_foods = food_restrictions.split('&')
                new_entry.food_restrictions.set(Food.objects.filter(pk__in=list_of_foods))
            else:
                new_entry.food_restrictions.set([])

            new_serializer = PatientSerializer(new_entry)

            return Response({'Info': 'Succesfully added', 'New Patient': new_serializer.data}, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditPatient(generics.UpdateAPIView):
    serializer_class = AddNewPatient
    permission_classes = (IsAuthenticated, )

    def get(self, *args, **kwargs):
        id = kwargs['id']

        try:
            patient = Patients.objects.get(pk=id)
        except Patients.DoesNotExist:
            return Response({'Info': 'Not Found'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PatientSerializer(patient)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, id):
        serializer = AddNewPatientSerializer(data=request.data)
        if serializer.is_valid():
            entry = Patients.objects.get(pk=id)
            entry.name = serializer.validated_data['patient']
            entry.date_of_birth = serializer.validated_data['date_of_birth']
            entry.biological_sex = serializer.validated_data['biological_sex']
            entry.ethnic_group = serializer.validated_data['ethnic_group']

            food_restrictions = str(serializer.validated_data['food_restrictions'])
            if len(food_restrictions) > 0:
                list_of_foods = food_restrictions.split('&')
                entry.food_restrictions.set(Food.objects.filter(pk__in=list_of_foods))
            else:
                entry.food_restrictions.set([])

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
        patient_name = patient_name.replace('_', ' ')
        nutritionist = self.request.user

        query_set = Patients.objects.filter(Q(nutritionist=nutritionist) & Q(name__icontains=patient_name)).order_by('name')

        return query_set


class AddPatientRecord(generics.CreateAPIView):
    permission_classes = (IsAuthenticated, )

    '''
        Necessario enviar alem dos parametros basicos (que estao em AddPatientRecordSerializer),
        o 'methabolic_author' para o calculo da taxa metabolica. Ha duas opcoes para o autor:
        'Pollok' e 'Faulkner'.
        
        O outro parametro eh o metodo para calcular os requerimentos energeticos. O parametro chama-se 'energy_method'
        A definicao esta em patients/models.py na funcao calculateEnergyRequirements
    '''
    def post(self, request, *args, **kwargs):

        id = kwargs['id']
        patient = Patients.objects.get(pk=id)

        serializer = AddPatientRecordSerializer(data=request.data)

        if serializer.is_valid():
            new_entry = serializer.create(serializer.validated_data)
            new_entry.patient = patient
            new_entry.date_modified = datetime.date.today()
            new_entry.age = datetime.date.today().year - patient.date_of_birth.year
            new_entry.calculateCorporalDensity()
            new_entry.calculateBodyFat()
            new_entry.calculateMuscularMass()

            if 'methabolic_author' in request.data:
                new_entry.calculateMethabolicRate(request.data['methabolic_author'])

            if 'energy_method' in request.data:
                new_entry.calculateEnergyRequirements(int(request.data['energy_method']))

            new_entry.save()

            new_serializer = PatientRecordSerializer(new_entry)

            return Response({'Info': 'Sucessfully added', 'New record': new_serializer.data}, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditPatientRecord(generics.UpdateAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, *args, **kwargs):

        record = PatientRecord.objects.get(pk=self.kwargs['id'])

        serializer = PatientRecordSerializer(record)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, id):
        record = PatientRecord.objects.get(pk=id)

        serializer = AddPatientRecordSerializer(record, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            try:
                patient = Patients.objects.get(pk=record.patient.id)
            except Patients.DoesNotExist:
                return Response({"Info": "Not valid patient ID"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            record.date_modified = datetime.date.today()
            record.age = datetime.date.today().year - patient.date_of_birth.year
            record.calculateCorporalDensity()
            record.calculateBodyFat()
            record.calculateMuscularMass()

            if 'methabolic_author' in request.data:
                record.calculateMethabolicRate(request.data['methabolic_author'])

            if 'energy_method' in request.data:
                record.calculateEnergyRequirements(int(request.data['energy_method']))

            record.save()


            new_serializer = PatientRecordSerializer(record)

            return Response({'Info': 'Successfully edited', 'Record': new_serializer.data}, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetPatientInfo(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, *args, **kwargs):

        try:
            patient = Patients.objects.get(pk=kwargs['id'])
        except Patients.DoesNotExist:
            return Response({'Info': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PatientSerializer(patient)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GetPatientRecords(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )
    pagination_class = PatientsPagination
    serializer_class = PatientRecordSerializer

    def get_queryset(self):

        try:
            patient = Patients.objects.get(pk=self.kwargs['id'])
        except Patients.DoesNotExist:
            return list()

        if patient.nutritionist == self.request.user:
            records = PatientRecord.objects.filter(patient=patient).order_by('date_modified')
            return records
        else:
            return list()


class GetAllPatients(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )
    pagination_class = PatientsPagination
    serializer_class = PatientSerializer

    def get_queryset(self):
        nutritionist = self.request.user
        return Patients.objects.filter(Q(nutritionist=nutritionist)).order_by('name')


class GetSingleRecord(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):

        try:
            record = PatientRecord.objects.get(pk=kwargs['id'])
        except PatientRecord.DoesNotExist:
            return Response({'Info': 'Patient does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PatientRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RemovePatient(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        try:
            patient = Patients.objects.get(pk=kwargs['id'])
        except Patients.DoesNotExist:
            return Response({'Info': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)

        PatientRecord.objects.filter(patient=patient).delete()
        patient.delete()
        return Response({'Info': 'Successfully deleted'}, status=status.HTTP_200_OK)

class RemovePatientRecord(generics.DestroyAPIView):
    permission_classes = (IsAuthenticated, )

    def get(self, *args, **kwargs):
        try:
            record = PatientRecord.objects.get(pk=self.kwargs['id'])
        except PatientRecord.DoesNotExist:
            return Response({'Info': 'Not Found'}, status=status.HTTP_404_NOT_FOUND)

        record.delete()

        return Response({'Info': 'Sucessfully deleted'}, status=status.HTTP_200_OK)
