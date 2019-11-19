from __future__ import unicode_literals
from django.db import migrations


def forwards_func(apps, schema_editor):
    Meal = apps.get_model("food", "Meal")
    db_alias = schema_editor.connection.alias
    Meal.objects.using(db_alias).bulk_create([
        Meal(meal_name="Breakfast"),
        Meal(meal_name="Morning snack"),
        Meal(meal_name="Lunch"),
        Meal(meal_name="Afternoon snack"),
        Meal(meal_name="Pre workout"),
        Meal(meal_name="Dinner"),
    ])


def reverse_func(apps, schema_editor):
    Meal = apps.get_model("home_application", "Person")
    db_alias = schema_editor.connection.alias
    Meal.objects.using(db_alias).filter(meal_name="Breakfast").delete()
    Meal.objects.using(db_alias).filter(meal_name="Morning snack").delete()
    Meal.objects.using(db_alias).filter(meal_name="Lunch").delete()
    Meal.objects.using(db_alias).filter(meal_name="Afternoon snack").delete()
    Meal.objects.using(db_alias).filter(meal_name="Pre workout").delete()
    Meal.objects.using(db_alias).filter(meal_name="Dinner").delete()


class Migration(migrations.Migration):

    dependencies = [
        ('food', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(forwards_func, reverse_func),
    ]





