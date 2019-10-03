from rest_framework import serializers
from .models import PatientRecord

class AddNewPatientSerializer(serializers.Serializer):
    patient = serializers.CharField(max_length=120)
    date_of_birth = serializers.DateField()
    food_choices = serializers.CharField(max_length=200)

#class Patient(serializers.Serializer):