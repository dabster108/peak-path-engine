from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shop", "0010_aboutreview"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="description",
            field=models.TextField(blank=True, default=""),
        ),
    ]
