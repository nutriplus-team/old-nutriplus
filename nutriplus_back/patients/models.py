from django.db import models
from django.contrib.auth.models import User
from food.models import Food


class Patients(models.Model): #TODO: mudar pl singular se tiver tempo
    name = models.CharField(max_length=120)
    date_of_birth = models.DateField()
    biological_sex = models.IntegerField() #0 equals female and 1 equals male
    ethnic_group = models.FloatField() #0 for white/hispanic and 1.1 for afroamerican
    food_restrictions = models.ManyToManyField(Food, blank=True)
    nutritionist = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class PatientRecord(models.Model):
    patient = models.ForeignKey(Patients, on_delete=models.CASCADE)
    is_athlete = models.BooleanField()
    age = models.IntegerField()
    physical_activity_level = models.FloatField()
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
    muscular_mass = models.FloatField(default=0)

    #For both sexes
    corporal_density = models.FloatField(default=0)

    #For woman
    body_fat_woman = models.FloatField(default=0)

    #For man
    body_fat_man_faulkner = models.FloatField(default=0)
    body_fat_man_pollok = models.FloatField(default=0)

    #Basal methabolic rates for athletes
    tinsley_athlete_tw = models.FloatField(default=0)
    tinsley_athlete_non_fat = models.FloatField(default=0)
    cunningham_athlete = models.FloatField(default=0)

    #Basal methabolic rates for non athletes
    woman_rate = models.FloatField(default=0)
    men_rate = models.FloatField(default=0)

    #Energy requirements
    energy_requirements = models.FloatField(default=0)

    def calculateEnergyRequirements(self, method):
        '''
        Methods should be:
        1 -> Tinsley com peso total (para atletas)
        2 -> Tinsley com peso livre de gordura (para atletas)
        3 -> Cunningham com peso livre de gordura (para atletas)
        4 -> Nao atletas (Mifflin)
        '''

        if method == 1:
            self.energy_requirements = self.tinsley_athlete_tw*self.physical_activity_level
        elif method == 2:
            self.energy_requirements = self.tinsley_athlete_non_fat*self.physical_activity_level
        elif method == 3:
            self.energy_requirements = self.cunningham_athlete*self.physical_activity_level
        elif method == 4:

            if self.patient.biological_sex == 0:
                self.energy_requirements = self.woman_rate*self.physical_activity_level
            else:
                self.energy_requirements = self.men_rate*self.physical_activity_level

    def calculateMethabolicRate(self, author):

        if self.is_athlete and author == 'Pollok':
            self.tinsley_athlete_tw = 24.8 * self.corporal_mass + 10
            if self.patient.biological_sex == 0:
                self.tinsley_athlete_non_fat = 25.9*self.corporal_mass*(100 - self.body_fat_woman)/100 + 284
                self.cunningham_athlete = 22*self.corporal_mass*(100 - self.body_fat_woman) + 500
            else:
                self.tinsley_athlete_non_fat = 25.9 * self.corporal_mass * (100 - self.body_fat_man_pollok)/100 + 284
                self.cunningham_athlete = 22 * self.corporal_mass * (100 - self.body_fat_man_pollok)/100 + 500

            self.woman_rate = 0
            self.men_rate = 0

        elif self.is_athlete and author == 'Faulkner':
            self.tinsley_athlete_tw = 24.8 * self.corporal_mass + 10
            if self.patient.biological_sex == 0:
                self.tinsley_athlete_non_fat = 25.9*self.corporal_mass*(100 - self.body_fat_woman)/100 + 284
                self.cunningham_athlete = 22*self.corporal_mass*(100 - self.body_fat_woman)/100 + 500
            else:
                self.tinsley_athlete_non_fat = 25.9 * self.corporal_mass * (100 - self.body_fat_man_faulkner)/100 + 284
                self.cunningham_athlete = 22 * self.corporal_mass * (100 - self.body_fat_man_faulkner)/100 + 500

            self.woman_rate = 0
            self.men_rate = 0

        elif not self.is_athlete:
            self.woman_rate = 9.99*self.corporal_mass + 6.25*self.height - 4.92*self.age - 161
            self.men_rate = 9.99*self.corporal_mass + 6.25*self.height - 4.92*self.age + 5
            self.tinsley_athlete_non_fat = 0
            self.tinsley_athlete_tw = 0
            self.cunningham_athlete = 0

    def calculateMuscularMass(self):
        self.muscular_mass = self.height*0.0074*(self.right_arm_circ - 3.1416*(self.triceps/10))**2 \
                              + 0.00088*(self.thigh_circ - 3.1416*(self.thigh/10))**2 \
                              + 0.00441*(self.calf_circ - 3.1416*(self.calf/10))**2 \
                              + 2.4*self.patient.biological_sex - 0.048*self.age  \
                              + self.patient.ethnic_group + 7.8

    def sumSevenSkinFolds(self):
        return self.subscapular + self.triceps + self.chest + self.axillary + self.supriailiac \
                        + self.abdominal + self.thigh

    def sumAllSkinFolds(self):
        return self.subscapular + self.triceps + self.biceps + self.chest + self.axillary + self.supriailiac \
                + self.abdominal + self.thigh + self.calf

    def calculateCorporalDensity(self):

        if self.patient.biological_sex == 0:
            sum_of_seven = self.sumSevenSkinFolds()
            self.corporal_density = 1.097 - 0.00046971*sum_of_seven + 0.00000056*sum_of_seven**2 \
                - 0.00012828*self.age

        else:
            sum_of_seven = self.sumSevenSkinFolds()
            self.corporal_density = 1.112 - 0.00043499*sum_of_seven + 0.00000055*sum_of_seven**2 \
                - 0.00028826*sum_of_seven*self.age

    def calculateBodyFat(self):

        if self.patient.biological_sex == 0:
            self.body_fat_woman = (4.95/self.corporal_density - 4.5)*100
            self.body_fat_man_pollok = 0
            self.body_fat_man_faulkner = 0

        else:
            self.body_fat_man_faulkner = (self.subscapular + self.triceps + self.abdominal + self.supriailiac)*0.153 \
                                            + 5.18
            self.body_fat_man_pollok = (4.95/self.corporal_density - 4.5)*100
            self.body_fat_woman = 0