from django.urls import path
#from django.conf.urls import url
from .views import (AddNewPatient, SearchPatients, EditPatient, AddPatientRecord,
                    EditPatientRecord, GetPatientInfo, GetPatientRecords, GetAllPatients,
                    GetSingleRecord)

urlpatterns = [
    path(r'add-new/', AddNewPatient.as_view(), name='NewPatientAddition'),
    path(r'search/<slug:name>/', SearchPatients.as_view(), name='SearchPatients'),
    path(r'edit/<int:id>/', EditPatient.as_view(), name='EditPatient'),
    path(r'add-record/<int:id>/', AddPatientRecord.as_view(), name='NewRecord'),
    path(r'edit-record/<int:id>/', EditPatientRecord.as_view(), name='EditPatientRecord'),
    path(r'get-info/<int:id>/', GetPatientInfo.as_view(), name='GetPatientInfo'),
    path(r'get-records/<int:id>/', GetPatientRecords.as_view(), name='GetRecords'),
    path(r'get-all-patients/', GetAllPatients.as_view(), name='AllPatients'),
    path(r'get-single-record/<int:id>/', GetSingleRecord.as_view(), name='SingleRecord'),
]