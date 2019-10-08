from rest_framework import serializers
from .models import Patients

class AddNewPatientSerializer(serializers.Serializer):
    patient = serializers.CharField(max_length=120)
    date_of_birth = serializers.DateField()
    food_choices = serializers.CharField(max_length=200)

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patients
        fields = ('name', 'date_of_birth', 'food_choices')
