from django.urls import path
from django.conf.urls import url
from .views import AddNewPatient, SearchPatients, EditPatient, AddPatientRecord

urlpatterns = [
    path(r'add-new/', AddNewPatient.as_view(), name='NewPatientAddition'),
    path(r'search/<slug:name>/', SearchPatients.as_view(), name='SearchPatients'),
    path(r'edit/<int:id>/', EditPatient.as_view(), name='EditPatient'),
    path(r'add-record/<int:id>/', AddPatientRecord.as_view(), name='NewRecord'),
]