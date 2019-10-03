from django.db import models


class Patients(models.Model):
    name = models.CharField(max_length=120)
    date_of_birth = models.DateField()
    food_choices = models.CharField(max_length=200)


class PatientRecord(models.Model):
    patient = models.ForeignKey(Patients, on_delete=models.CASCADE)
    corporal_mass = models.FloatField()
    height = models.FloatField()
    BMI = models.FloatField()
    food_restrictions = models.CharField(max_length=200,blank=True)
    observations = models.CharField(max_length=200, blank=True)




# Create your models here.
