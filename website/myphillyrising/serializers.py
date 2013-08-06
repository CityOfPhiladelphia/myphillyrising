from rest_framework.serializers import ModelSerializer, URLField, IntegerField
from myphillyrising.models import Neighborhood, User, UserProfile
from utils.rest_framework_extensions import ManyToNativeMixin


class NeighborhoodSerializer(ManyToNativeMixin, ModelSerializer):
    user_points = IntegerField(read_only=True)
    item_points = IntegerField(read_only=True)

    class Meta:
        model = Neighborhood


class UserProfileSerializer(ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('full_name', 'avatar_url', 'neighborhood')


class UserSerializer(ModelSerializer):
    profile = UserProfileSerializer()
    points = IntegerField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'last_login', 'profile', 'points')


class LoggedInUserProfileSerializer(UserProfileSerializer):
    class Meta:
        model = UserProfile
        fields = ('full_name', 'avatar_url', 'neighborhood', 'email_permission')


class LoggedInUserSerializer(UserSerializer):
    profile = LoggedInUserProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'last_login', 'profile', 'email')

    def from_native(self, data, files):
        profile_data = data.get('profile')
        user = super(UserSerializer, self).from_native(data, files)
        
        if profile_data:
            profile_serializer = LoggedInUserProfileSerializer(
                instance=user.profile, data=profile_data)

            if profile_serializer.is_valid():
                profile_serializer.save()

        return user
