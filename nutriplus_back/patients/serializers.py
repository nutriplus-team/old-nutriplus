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
    body_fat_pollok = serializers.SerializerMethodField()
    body_fat_faulkner = serializers.SerializerMethodField()
    total_weight_methabolic_rate = serializers.SerializerMethodField()

    class Meta:
        model = PatientRecord
        fields = ('id', 'patient', 'is_athlete', 'age', 'physical_activity_level', 'corporal_mass', 'height', 'BMI',
                  'observations', 'date_modified', 'subscapular', 'triceps', 'chest', 'axillary', 'supriailiac',
                  'abdominal', 'thigh', 'calf','biceps', 'waist_circ', 'abdominal_circ', 'hips_circ', 'right_arm_circ',
                  'thigh_circ', 'calf_circ', 'muscular_mass', 'corporal_density', 'tinsley_athlete_non_fat', 'cunningham_athlete',
                  'energy_requirements', 'body_fat_pollok', 'body_fat_faulkner', 'total_weight_methabolic_rate')

    def get_body_fat_pollok(self, obj):

        if obj.patient.biological_sex == 0:
            return obj.body_fat_woman
        else:
            return obj.body_fat_man_pollok

    def get_body_fat_faulkner(self, obj):

        if obj.patient.biological_sex == 0:
            return 0
        else:
            return obj.body_fat_man_faulkner

    def get_total_weight_methabolic_rate(self, obj):

        if obj.is_athlete:
            return obj.tinsley_athlete_tw
        else:
            if obj.patient.biological_sex == 0:
                return obj.woman_rate
            else:
                return obj.men_rate



class AddPatientRecordSerializer(serializers.Serializer):
    is_athlete = serializers.BooleanField()
    physical_activity_level = serializers.FloatField()
    corporal_mass = serializers.FloatField()
    height = serializers.FloatField()
    BMI = serializers.FloatField()
    observations = serializers.CharField(max_length=200, allow_blank=True)

    #Fat Folds
    subscapular = serializers.FloatField()
    triceps = serializers.FloatField()
    biceps = serializers.FloatField()
    chest = serializers.FloatField()
    axillary = serializers.FloatField()
    supriailiac = serializers.FloatField()
    abdominal = serializers.FloatField()
    thigh = serializers.FloatField()
    calf = serializers.FloatField()

    #Circumferences
    waist_circ = serializers.FloatField()
    abdominal_circ = serializers.FloatField()
    hips_circ = serializers.FloatField()
    right_arm_circ = serializers.FloatField()
    thigh_circ = serializers.FloatField()
    calf_circ = serializers.FloatField()

    def create(self, validated_data):
        return PatientRecord(**validated_data)
