from rest_framework import serializers
from .models import Patients, PatientRecord

from food.models import Food


class AddNewPatientSerializer(serializers.Serializer):
    patient = serializers.CharField(max_length=120)
    date_of_birth = serializers.DateField(format="%d/%m/%Y", input_formats=["%d/%m/%Y"])
    biological_sex = serializers.IntegerField()
    ethnic_group = serializers.FloatField()
    food_restrictions = serializers.CharField(max_length=500, allow_blank=True)


class PatientFoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ('id', 'food_name', 'food_group')


class PatientSerializer(serializers.ModelSerializer):
    food_restrictions = PatientFoodSerializer(read_only=True, many=True)
    date_of_birth = serializers.DateField(format="%d/%m/%Y", input_formats=["%d/%m/%Y"])

    class Meta:
        model = Patients
        fields = ('id', 'name', 'date_of_birth', 'food_restrictions', 'biological_sex', 'ethnic_group')


class PatientRecordSerializer(serializers.ModelSerializer):
    date_modified = serializers.DateField(format="%d/%m/%Y", input_formats=["%d/%m/%Y"])

    class Meta:
        model = PatientRecord
        fields = ('id', 'patient', 'corporal_mass', 'height', 'BMI',
                  'observations', 'date_modified')


class AddPatientRecordSerializer(serializers.Serializer):
    corporal_mass = serializers.FloatField()
    height = serializers.FloatField()
    BMI = serializers.FloatField()
    observations = serializers.CharField(max_length=200, allow_blank=True)
