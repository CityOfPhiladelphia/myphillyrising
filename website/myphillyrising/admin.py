from django.contrib import admin
from myphillyrising.models import Neighborhood, UserProfile, UserAction

class UserActionAdmin (admin.ModelAdmin):
    list_display = ('id', 'type', 'user', 'item')
    list_filter = ('type',)


admin.site.register(Neighborhood)
admin.site.register(UserProfile)
admin.site.register(UserAction, UserActionAdmin)
