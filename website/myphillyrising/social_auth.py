from models import UserProfile
from services import CacheService


def get_user_profile(*auth_args, **auth_kwargs):
    user = auth_kwargs['social_user'].user

    if auth_kwargs.get('is_new'):
        profile = UserProfile(user=user)
    else:
        profile, created = UserProfile.objects.get_or_create(user=user)
    return {'profile': profile}


def get_neighborhood_preference(*auth_args, **auth_kwargs):
    pass


def update_user_profile(*auth_args, **auth_kwargs):
    user_info = auth_kwargs['response']
    profile = auth_kwargs['profile']
    new_neighborhood = auth_kwargs.get('neighborhood')

    service = CacheService.get_social_media_service(auth_kwargs['backend'].name)

    profile.avatar_url = service.extract_avatar_url(user_info)
    profile.full_name = service.extract_full_name(user_info)
    profile.neighborhood = new_neighborhood or profile.neighborhood
    profile.save()