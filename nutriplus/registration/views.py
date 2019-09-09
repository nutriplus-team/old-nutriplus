from datetime import datetime

from django.shortcuts import render
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from django.contrib.auth import (login as djang_login, logout as django_logout, get_user_model)
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView, RetrieveUpdateAPIView, DestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_jwt.settings import api_settings as jwt_settings

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (RegisterSerializer, VerifyEmailSerializer, PasswordResetSerializer, PasswordChangeSerialzier, 
                    PasswordResetConfirmSerializer, LoginSerializer, JWTSerializer)
from .app_settings import register_permission_classes

from rest_auth.models import TokenModel
from rest_auth.app_settings import TokenSerializer, create_token, UserDetailsSerializer
from rest_auth.utils import jwt_encode

from allauth.account import app_settings as allauth_settings
from allauth.account.utils import complete_signup
from allauth.account.views import ConfirmEmailView

# Decorators

sensitive_post_parameters_register = method_decorator(
    sensitive_post_parameters('password1', 'password2')
)

sensitive_post_parameters_login = method_decorator(
    sensitive_post_parameters('password', 'old_password', 'new_password1', 'new_password2')
)

#Registration

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = register_permission_classes()
    token_model = TokenModel

    #@sensitive_post_parameters_register
    def dispatch(self, *args, **kwargs):
        return super(RegisterView, self).dispatch(*args, **kwargs)

    def get_response_data(self, user):
        if allauth_settings.EMAIL_VERIFICATION == \
            allauth_settings.EmailVerificationMethod.MANDATORY:
            return {"detail": ("Verification e-mail sent.")}
        
        #if getattr(settings, 'REST_USER_JWT', False):
        data = {
            'user': user,
            'token': self.token,
            'refresh' : self.refresh_token 
        }
        return JWTSerializer(data).data
        
       # else:
        #    return TokenSerializer(user.auth_token).data

    def perform_create(self, serializer):
        user = serializer.save(self.request)

        #if getattr(settings, 'REST_USE_JWT', False):
        tokens = RefreshToken.for_user(user)
        self.token = str(tokens.access_token)
        self.refresh_token = str(tokens)
        #else:
        #    create_token(self.token_model, user, serializer)

        complete_signup(self.request._request, user,
                            allauth_settings.EmailVerificationMethod.NONE, None)
        
        return user
        

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(self.get_response_data(user), status=status.HTTP_201_CREATED,
                            headers=headers)

class VerifyEmailView(APIView, ConfirmEmailView):
    permission_classes = (AllowAny, )
    allowed_methods = ('POST', 'OPTIONS','HEAD')

    def get_serializer(self, *args, **kwargs):
        return VerifyEmailSerializer(*args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_excepttion=True)
        self.kwargs['key'] = serializer.validated_data['key']
        confirmation = self.get_object()
        confirmation.confirm(self.request)

        return Response({'detail': 'ok'}, status=status.HTTP_200_OK)

#Login

class LoginView(GenericAPIView):

    permission_classes = (AllowAny, )
    serializer_class = LoginSerializer
    token_model = TokenModel

    @sensitive_post_parameters_login
    def dispatch(self, *args, **kwargs):
        return super(LoginView, self).dispatch(*args, **kwargs)

    def process_login(self):
        djang_login(self.request, self.user)

    def get_response_serializer(self):
        #if getattr(settings, 'REST_USE_JWT', False):
        response_serializer = JWTSerializer
        #else:
        #    response_serializer = TokenSerializer
        return response_serializer
    
    def login(self):
        self.user = self.serializer.validated_data['user']

        #if getattr(settings, 'REST_USE_JWT', False):
        #self.token = jwt_encode(self.user) 
        tokens = RefreshToken.for_user(self.user)
        self.token = str(tokens.access_token)
        self.refresh_token = str(tokens)
        
        #else:
        #   self.token = create_token(self.token_model, self.user, self.serializer)
        
        if getattr(settings, 'REST_SESSION_LOGIN', True):
            self.process_login()

    def get_response(self):
        serializer_class = self.get_response_serializer()

        #if getattr(settings, 'REST_USE_JWT', False):
        data = {
            'user' : self.user,
            'token' : self.token,
            'refresh' : self.refresh_token
        }
        serializer = serializer_class(instance=data, context={'request' : self.request})
        #else:
        #    serializer = serializer_class(instace=data, context={'request' : self.request})
        
        response = Response(serializer.data, status=status.HTTP_200_OK)

        #if getattr(settings, 'REST_USE_JWT', False):
        if jwt_settings.JWT_AUTH_COOKIE:
            expiration = (datetime.utcnow() + jwt_settings.JWT_EXPIRATION_DELTA)
            response.set_cookie(jwt_settings.JWT_AUTH_COOKIE, self.token,
                                    expires=expiration, httponly=True)
    
        return response


    def post(self, request, *args, **kwargs):
        self.request = request
        self.serializer = self.get_serializer(data=self.request.data, context={'request' : request})

        self.serializer.is_valid(raise_exception=True)

        self.login()

        return self.get_response()

class LogoutView(APIView):

    permission_classes = (AllowAny, )

    def get(self, request, *args, **kwargs):
        
        #if getattr(settings, 'ACCOUNT_LOGOUT_ON_GET', False):
        response = self.logout(request)
        return self.finalize_response(request, response, *args, **kwargs)
        #else:
        #    self.http_method_not_allowed(request, *args, **kwargs)
        
        

    def post(self, request, *args, **kwargs):
        return self.logout(request)

    def logout(self, request):
        try:
            request.user.auth_token.delete()
        except (AttributeError, ObjectDoesNotExist):
            pass
        if getattr(settings, 'REST_SESSION_LOGIN', True):
            django_logout(request)

        response = Response({"detail" : ("Successfully logget out.")}, status=status.HTTP_200_OK)

        #if getattr(settings, 'REST_USE_JWT', False):
        if jwt_settings.JWT_AUTH_COOKIE:
            response.delete_cookie(jwt_settings.JWT_AUTH_COOKIE)
    
        return response

class UserDetailsView(RetrieveUpdateAPIView):
    serializer_class = UserDetailsSerializer
    permission_classes = (IsAuthenticated, )

    def get_object(self):
        return self.request.user

    def get_queryset(self):
        return get_user_model().objects.none()

class PasswordResetView(GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = (AllowAny, )

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {"detail": ("Password reset e-mail has been sent.")},
            status=status.HTTP_200_OK
        )

class PassWordResetConfirmView(GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = (AllowAny, )

    @sensitive_post_parameters_login
    def dispatch(self, *args, **kwargs):
        return super(PassWordResetConfirmView, self).dispatch(*args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": ("Password has been reset with the new password.")}
        )

class PasswordChangeView(GenericAPIView):

    serializer_class = PasswordChangeSerialzier
    permission_classes = (IsAuthenticated, )

    @sensitive_post_parameters_login
    def dispatch(self, *args, **kwargs):
        return super(PasswordChangeView, self).dispatch(*args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"detail": ("New password has been saved.")})