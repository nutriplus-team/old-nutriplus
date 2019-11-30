from django.db import models
from django.contrib.auth.models import User
from food.models import Food


class Patients(models.Model):
    name = models.CharField(max_length=120)
    date_of_birth = models.DateField()
    biological_sex = models.IntegerField() #0 equals female and 1 equals male
    age = models.IntegerField()
    ethnic_group = models.FloatField() #0 for white/hispanic and 1.1 for afroamerican
    food_restrictions = models.ManyToManyField(Food, blank=True)
    nutritionist = models.ForeignKey(User, on_delete=models.CASCADE)


class PatientRecord(models.Model):
    patient = models.ForeignKey(Patients, on_delete=models.CASCADE)
    corporal_mass = models.FloatField()
    height = models.FloatField()
    BMI = models.FloatField()
    observations = models.CharField(max_length=200, blank=True)
    date_modified = models.DateField()

    #Fat Folds
    subscapular = models.FloatField()
    triceps = models.FloatField()
    biceps = models.FloatField()
    chest = models.FloatField()
    axillary = models.FloatField()
    supriailiac = models.FloatField()
    abdominal = models.FloatField()
    thigh = models.FloatField()
    calf = models.FloatField()

    #Circumferences
    waist_circ = models.FloatField()
    abdominal_circ = models.FloatField()
    hips_circ = models.FloatField()
    right_arm_circ = models.FloatField()
    thigh_circ = models.FloatField()
    calf_circ = models.FloatField()

    #Muscular mass
    muscular_mass = models.FloatField()

    def calculateMuscularMass(self):
        self.muscular_mass = self.height*0.0074*(self.right_arm_circ - 3.1416*(self.triceps/10))**2 \
                              + 0.00088*(self.thigh_circ - 3.1416*(self.thigh/10))**2 \
                              + 0.00441*(self.calf_circ - 3.1416*(self.calf/10))**2 \
                              + 2.4*self.patient.biological_sex - 0.048*self.patient.age  \
                              + self.patient.ethnic_group + 7.8

    def sumSevenSkinFolds(self):
        return self.subscapular + self.triceps + self.chest + self.axillary + self.supriailiac \
                        + self.abdominal + self.thigh

    def sumAllSkinFolds(self):
        return self.subscapular + self.triceps + self.biceps + self.chest + self.axillary + self.supriailiac \
                + self.abdominal + self.thigh + self.calf