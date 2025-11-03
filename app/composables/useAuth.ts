import { FetchError } from 'ofetch';

interface AuthUser {
  email: string;
  id: string;
  name: string;
  avatar: string | null;
}

const realUser = ref<AuthUser | null>(null);
const isAuthenticated = computed(() => !!realUser.value);

export const useAuth = () => {

  const fetchUser = async (silent: boolean = false) => {
    try {
      const { user, success } = await $fetch('/api/me', {
        credentials: 'include',
        ignoreResponseError: silent,
      });
      if (success && user) {
        realUser.value = user;
      }
    } catch (error) {
      if (error instanceof FetchError) {
        if (error.statusCode! == 500) {
          console.error(error.message);
        }
      }
    }
  };

  const register = async (data: { email: string; password: string; name?: string }) => {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: data,
      credentials: 'include',
    });

    if (res.success) {
      realUser.value = res.user;
    } else {
      realUser.value = null;
    }
  };

  const login = async (credentials: { email: string; password: string }) => {

    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials,
      credentials: 'include',
    });
    
    if (res) {
      realUser.value = res.user;
    } else {
      realUser.value = null;
    }
  };

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      realUser.value = null;
    }
  };

  return {
    user: readonly(realUser),
    isAuthenticated: readonly(isAuthenticated),
    register,
    login,
    logout,
    fetchUser,
  };
};
