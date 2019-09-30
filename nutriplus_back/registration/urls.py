from .views import (RegisterView, VerifyEmailView,
    LoginView, LogoutView, UserDetailsView, PasswordChangeView,
    PasswordResetView, PassWordResetConfirmView)
from django.conf.urls import url
from django.views.generic import TemplateView
from rest_framework_simplejwt import views as simplejwt_views




urlpatterns = [

    url(r'^register/$', RegisterView.as_view(), name='rest_register'),
    url(r'^login/$', LoginView.as_view(), name='rest_login'),

    #URLS DAQUI PARA BAIXO REQUEREM INTEGRACAO COM EMAIL
    #url(r'^verify-email/$', VerifyEmailView.as_view(), name='rest_verify_email'),
    #url(r'^account-confirm-email/(?P<key>[-:\w]+)/$', TemplateView.as_view(),
    #    name='account_confirm_email'),
    #url(r'^password/reset/$', PasswordResetView.as_view(), name='rest_password_reset'),
    #url(r'^password/reset/confirm/$', PassWordResetConfirmView.as_view(), name='rest_password_reset_confirm'),

    #URLs that require a user to be logged in with a valid session/token
    url(r'^logout/$', LogoutView.as_view(), name='rest_logout'),
    url(r'^user_details/$', UserDetailsView.as_view(), name='rest_user_details'),
    url(r'^token/refresh/$', simplejwt_views.TokenRefreshView.as_view(), name='token_refresh'),     
    
    #Nao permitir a mudança de senha neste momento, pois nao ha como validar a identidade do usuario
    #url(r'^password/change/$', PasswordChangeView.as_view(), 
    #    name='rest_password_change'),
   
]