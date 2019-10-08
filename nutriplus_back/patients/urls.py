from django.urls import path
from django.conf.urls import url
from .views import AddNewPatient, SearchPatients, EditPatient, AddPatientRecord

urlpatterns = [
    path(r'add-new-patient/', AddNewPatient.as_view(), name='NewPatientAddition'),
    url('seach-patient/<slug:name>/', SearchPatients.as_view(), name='SearchPatients'),
    url('edit-patient/<int:id>/', EditPatient.as_view(), name='EditPatient'),
    url('add-patient-record/<int:id>/', AddPatientRecord.as_view(), name='NewRecord'),
]