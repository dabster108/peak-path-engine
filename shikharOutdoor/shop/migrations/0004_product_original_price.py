from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shop", "0003_rename_categorys_product_category_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="original_price",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
            ),
        ),
    ]
