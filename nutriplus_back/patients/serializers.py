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

    def update(self, instance, validated_data):
        instance.is_athlete = validated_data.get('is_athlete', instance.is_athlete)
        instance.physical_activity_level = validated_data.get('physical_activity_level', instance.physical_activity_level)
        instance.corporal_mass = validated_data.get('coroporal_mass', instance.corporal_mass)
        instance.height = validated_data.get('height', instance.height)
        instance.BMI = validated_data.get('BMI', instance.BMI)
        instance.observations = validated_data.get('observations', instance.observations)

        # Fat Folds
        instance.subscapular = validated_data.get('subscapular', instance.subscapular)
        instance.triceps = validated_data.get('triceps', instance.triceps)
        instance.biceps = validated_data.get('biceps', instance.biceps)
        instance.chest = validated_data.get('chest', instance.chest)
        instance.axillary = validated_data.get('axillary', instance.axillary)
        instance.supriailiac = validated_data.get('supriailiac', instance.supriailiac)
        instance.abdominal = validated_data.get('abdominal', instance.abdominal)
        instance.thigh = validated_data.get('thigh', instance.thigh)
        instance.calf = validated_data.get('calf', instance.calf)

        # Circumferences
        instance.waist_circ = validated_data.get('waist_circ', instance.waist_circ)
        instance.abdominal_circ = validated_data.get('abdominal_circ', instance.abdominal_circ)
        instance.hips_circ = validated_data.get('hips_circ', instance.hips_circ)
        instance.right_arm_circ = validated_data.get('right_arm_circ', instance.right_arm_circ)
        instance.thigh_circ = validated_data.get('thigh_circ', instance.thigh_circ)
        instance.calf_circ = validated_data.get('calf_circ', instance.calf_circ)

        return instance