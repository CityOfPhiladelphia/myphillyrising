from django.contrib import admin
from myphillyrising.models import Neighborhood, UserProfile, UserAction

class UserActionAdmin (admin.ModelAdmin):
    list_display = ('id', 'type', 'user', 'item', 'awarded_at')
    list_filter = ('type', 'awarded_at')


admin.site.register(Neighborhood)
admin.site.register(UserProfile)
admin.site.register(UserAction, UserActionAdmin)
