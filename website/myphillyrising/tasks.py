from celery import task
from myphillyrising.models import User, UserProfile
from myphillyrising.services import TwitterService
import requests

import logging
logger = logging.getLogger(__name__)

def find_outdated_avatars():
    users = User.objects.all().select_related('profile').prefetch_related('social_auth')
    outdated = []
    for user in users:
        try:
            if not user.profile.avatar_url:
                continue
        except UserProfile.DoesNotExist:
            continue

        avatar_url = user.profile.avatar_url
        try:
            response = requests.get(avatar_url)
            if response.status_code != 200:
                logger.debug('Found an outdated avatar: %s - %s' % (user, response.status_code))
                outdated.append(user)
        except requests.ConnectionError as exc:
            logger.debug('Found an outdated avatar: %s - %s' % (user, exc))
            outdated.append(user)

    return outdated

@task
def update_avatars():
    users = find_outdated_avatars()

    updated = []
    non_twitter = []
    
    for user in users:
        for social_auth in user.social_auth.all():
            if social_auth.provider != 'twitter':
                non_twitter.append(user)
                continue
                
            service = TwitterService()
            user_info = service.get_user_info(user)
            user.profile.avatar_url = service.extract_avatar_url(user_info)
            user.profile.full_name = service.extract_full_name(user_info)
            user.profile.save()
            updated.append(user)
    
    return {
        'updated': updated,
        'non-twitter': non_twitter
    }
