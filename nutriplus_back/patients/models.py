from django.db import models
from django.contrib.auth.models import User
from food.models import Food


class Patients(models.Model): #TODO: mudar pl singular se tiver tempo
    name = models.CharField(max_length=120)
    date_of_birth = models.DateField()
    food_restrictions = models.ManyToManyField(Food, blank=True)
    nutritionist = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class PatientRecord(models.Model):
    patient = models.ForeignKey(Patients, on_delete=models.CASCADE)
    corporal_mass = models.FloatField()
    height = models.FloatField()
    BMI = models.FloatField()
    observations = models.CharField(max_length=200, blank=True)
    date_modified = models.DateField()
