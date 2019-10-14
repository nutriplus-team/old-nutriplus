from django.db import models
from django.contrib.auth.models import User


class Patients(models.Model):
    name = models.CharField(max_length=120)
    date_of_birth = models.DateField()
    food_choices = models.CharField(max_length=200)
    food_restrictions = models.CharField(max_length=200, blank=True)
    nutritionist = models.ForeignKey(User, on_delete=models.CASCADE)


class PatientRecord(models.Model):
    patient = models.ForeignKey(Patients, on_delete=models.CASCADE)
    corporal_mass = models.FloatField()
    height = models.FloatField()
    BMI = models.FloatField()
    observations = models.CharField(max_length=200, blank=True)
    date_modified = models.DateField()
