from rest_framework import serializers
from rest_framework import exceptions

from allauth.utils import (email_address_exists, get_username_max_length)
from allauth.account import app_settings as allauth_settings
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email

from django.contrib.auth import get_user_model, authenticate, update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.utils.encoding import force_text
from django.utils.http import urlsafe_base64_decode as uid_decoder

from rest_auth.models import TokenModel
from rest_auth.serializers import UserDetailsSerializer
from rest_auth.utils import import_callable

##REGISTRATION

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length = get_username_max_length(),
        min_length = allauth_settings.USERNAME_MIN_LENGTH,
        required = allauth_settings.USERNAME_REQUIRED
    )
    first_name = serializers.CharField(required=True, write_only=True)
    last_name = serializers.CharField(required=True, write_only=True)
    email = serializers.EmailField(required=True)
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    def validate_username(self, username):
        username = get_adapter().clean_username(username)
        return username

    def validate_email(self, email):
        email = get_adapter().clean_username(email)

        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                raise serializers.ValidationError(
                    ("A user is already registered with this e-mail address.")
                )
        
        return email
    
    def validate_password1(self, password):
        return get_adapter().clean_password(password)

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError(("The two passwords did not match."))
        return data

    def custom_signup(self, request, user):
        pass

    def get_cleaned_data(self):
        return {
            'username': self.validated_data.get('username', ''),
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
            'password1': self.validated_data.get('password1', ''),
            'email': self.validated_data.get('email', ''),
        }

    def save(self, request):
        adapter = get_adapter()
        user = adapter.new_user(request)
        self.cleaned_data = self.get_cleaned_data()
        adapter.save_user(request, user, self)
        self.custom_signup(request, user)
        setup_user_email(request, user, [])
        return user

class VerifyEmailSerializer(serializers.Serializer):
    key = serializers.EmailField()


## LOGIN

UserModel = get_user_model()

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(style={'input_type' : 'password'})

    def authenticate(self, **kwargs):
        return authenticate(self.context['request'], **kwargs)

    def _validate_email(self, email, password):
        user = None

        if email and password:
            user = self.authenticate(email=email, password=password)
        
        else:
            msg = ('Must include email and password.')
            raise exceptions.ValidationError(msg)
        
        return user

    def _validate_username(self, username, password):
        user = None

        if username and password:
            user = self.authenticate(username=username, password=password)
        
        else:
            msg = ('Must include username and password.')
            raise exceptions.ValidationError(msg)

        return user
    
    def _validate_username_email(self, username, email, password):
        user = None

        if email and password:
            user = self.authenticate(email=email, password=password)
        
        elif username and password:
            user = self.authenticate(username=username, password=password)
        
        else:
            msg = ('Must include either username or email and password.')
            raise exceptions.ValidationError(msg)
        
        return user

    def validate(self, attrs):
        username = attrs.get('username')
        email = attrs.get('email')
        password = attrs.get('password')

        user = None

        if 'allauth' in settings.INSTALLED_APPS:
            
            if allauth_settings.AUTHENTICATION_METHOD == allauth_settings.AuthenticationMethod.EMAIL:
                user = self._validate_email(email, password)
            
            elif allauth_settings.AUTHENTICATION_METHOD == allauth_settings.AuthenticationMethod.USERNAME:
                user = self._validate_username(username, password)
            
            else:
                user = self._validate_username_email(username, email, password)
            
        else:

            if email:
                try:
                    username = UserModel.objects.get(email__iexact=email).get_username()
                
                except UserModel.DoesNotExist:
                    pass
            
            if username:
                user = self._validate_username_email(username, '', password)
        
        if user:
            if not user.is_active:
                msg = ('User account is disabled.')
                raise exceptions.ValidationError(msg)
        
        else:
            msg = ('Unable to log in with provided credentials.')
            raise exceptions.ValidationError(msg)

        if 'rest_auth.registration' in settings.INSTALLED_APPS:
            if allauth_settings.EMAIL_VERIFICATION == allauth_settings.EmailVerificationMethod.MANDATORY:
                email_address = user.emailaddress_set.get(email=user.email)

                if not email_address.verified:
                    raise serializers.ValidationError(('E-mail is not verified.'))

        attrs['user'] = user
        return attrs

class PasswordResetSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password_reset_form_class = PasswordResetForm

    def get_email_options(self):
        return {}

    def validate_email(self, value):

        self.reset_form = self.password_reset_form_class(data=self.initial_data)

        if not self.reset_form.is_valid():
            raise serializers.ValidationError(self.reset_form.errors)

        return value

    def save(self):
        request = self.context.get('request')

        opts = {
            'use_https' : request.is_secure(),
            'from_email' : getattr(settings, 'DEFAULT_FROM_EMAIL'),
            'request' : request,
        }

        opts.update(self.get_email_options())
        self.reset_form.save(**opts)

class JWTSerializer(serializers.Serializer):
    """
    Serializer for JWT authentication.
    """
    token = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        """
        Required to allow using custom USER_DETAILS_SERIALIZER in
        JWTSerializer. Defining it here to avoid circular imports
        """
        rest_auth_serializers = getattr(settings, 'REST_AUTH_SERIALIZERS', {})
        JWTUserDetailsSerializer = import_callable(
            rest_auth_serializers.get('USER_DETAILS_SERIALIZER', UserDetailsSerializer)
        )
        user_data = JWTUserDetailsSerializer(obj['user'], context=self.context).data
        return user_data

class PasswordResetConfirmSerializer(serializers.Serializer):

    new_password1 = serializers.CharField(max_length=128)
    new_password2 = serializers.CharField(max_length=128)
    uid = serializers.CharField()
    token = serializers.CharField()

    set_password_form_class = SetPasswordForm

    def custom_validation(self, attrs):
        pass

    def validate(self, attrs):
        self._errors = {}

        try:
            uid = force_text(uid_decoder(attrs['uid']))
            self.user = UserModel._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, UserModel.DoesNotExist):
            raise exceptions.ValidationError({'uid' : ['Invalid value']})
        
        self.custom_validation(attrs)

        self.set_password_form = self.set_password_form_class(user=self.user, data=attrs)

        if not self.set_password_form.is_valid():
            raise serializers.ValidationError(self.set_password_form.errors)
        
        if not default_token_generator.check_token(self.user, attrs['token']):
            raise exceptions.ValidationError({'token' : ['Invalid value']})
        
        return attrs

    def dave(self):
        return self.set_password_form.save()

class PasswordChangeSerialzier(serializers.Serializer):
    #Serializer for requesting a password reset e-mail

    old_password = serializers.CharField(max_length=128)
    new_password1 = serializers.CharField(max_length=128)
    new_password2 = serializers.CharField(max_length=128)

    set_password_form_class = SetPasswordForm

    def __init__(self, *args, **kwargs):
        
        self.old_password_field_enabled = getattr(
            settings, 'OLD_PASSWORD_FIELD_ENABLED', False
        )

        self.logout_on_password_change = getattr(
            settings, 'LOGOUT_ON_PASSWORD_CHANGE', False
        )

        super(PasswordChangeSerialzier, self).__init__(*args, **kwargs)

        if not self.old_password_field_enabled:
            self.fields.pop('old_password')
        
        self.request = self.context.get('request')
        self.user = getattr(self.request, 'user', None)

    
    def validate_old_password(self, value):
        invalid_password_conditions = (
            self.old_password_field_enabled, 
            self.user,
            not self.user.check_password(value)
        )

        if all(invalid_password_conditions):
            err_msg = ("Yout old password was entered incorrectly. Please enter it again.")
            raise serializers.ValidationError(err_msg)

        return value

    def validate(self, attrs):
        self.set_password_form = self.set_password_form_class(
            self.user, data=attrs
        )

        if not self.set_password_form.is_valid():
            raise serializers.ValidationError(self.set_password_form.errors)
        
        return attrs

    def save(self):
        self.set_password_form.save()
        if not self.logout_on_password_change:
            update_session_auth_hash(self.request, self.user)