http "$1"/user/register/ username=ocimar password1=senhadoocimar password2=senhadoocimar email='ocimar@gmail.com' first_name=Ocimar last_name=Santos
token=`http $1/user/login/ username=ocimar password=senhadoocimar |cut -f4 -d '"'`
http "$1"/patients/add-new/ "Authorization:Port $token" patient=Chen date_of_birth=01/10/1996 food_restrictions=
