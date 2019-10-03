from django.urls import path
from .views import AddNewPatient

urlpatterns = [
    path(r'add-new-patient/', AddNewPatient.as_view(), name='NewPatientAddition'),
]