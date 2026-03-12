from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q

User = get_user_model()


class UsernameOrEmailBackend(ModelBackend):
    """
    Аутентифікація користувача за логіном або email
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Беремо першого користувача, який співпадає по username або email
        user = User.objects.filter(Q(username=username) | Q(email=username)).first()

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None
