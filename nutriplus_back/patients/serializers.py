from rest_framework import serializers
from .models import Patients, PatientRecord


class AddNewPatientSerializer(serializers.Serializer):
    patient = serializers.CharField(max_length=120)
    date_of_birth = serializers.DateField()
    food_choices = serializers.CharField(max_length=200)
    food_restrictions = serializers.CharField(max_length=200, allow_blank=True)


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patients
        fields = ('id', 'name', 'date_of_birth', 'food_choices', 'food_restrictions')


class PatientRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRecord
        fields = ('id', 'patient', 'corporal_mass', 'height', 'BMI',
                  'observations', 'date_modified')


class AddPatientRecordSerializer(serializers.Serializer):
    corporal_mass = serializers.FloatField()
    height = serializers.FloatField()
    BMI = serializers.FloatField()
    observations = serializers.CharField(max_length=200, allow_blank=True)
