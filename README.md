# Nutriplus

This is a college project developed during our software engineering class. We devised a web application to help nutritionists plan their patients' diet. It can calculate a patient's daily intake of nutrients. If the nutritionist think the result is correct, the system will aks permission to generate a suggestion of a diet based on such data.

In addition, nutrtionits are able to plan a diet themselves on our application and use the latter to find substitions of meals that have the same amount of nutrients as those they devised.

To run the back end of our application, enter the folder ```nutriplus_back``` and install the dependencies by running the command:

```
pip install -r requirements.txt
```

Then, to start the server, run

```
python manage.py runserver
```

If you would like to run the front end of our application, enter the folder ```nutriplus_front``` and install the dependencies by running the command:
```
yarn
```

Then, start the server using the command
```
npm start
```
