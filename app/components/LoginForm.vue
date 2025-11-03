<script setup lang="ts">
import { ref } from 'vue';
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';
import { FetchError } from 'ofetch';

const toast = useToast();
const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
  },
  {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox',
    defaultValue: true,
  },
];

const providers = [
  {
    label: 'Login With Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
      toast.add({ title: 'Google', description: 'Login with Google' });
    },
  },
  {
    label: 'Login With GitHub',
    icon: 'i-simple-icons-github',
    onClick: () => {
      toast.add({ title: 'GitHub', description: 'Login with GitHub' });
      handleSocialLogin('github');
    },
  },
];

const route = useRoute();
const submitLabel = ref('Login');
const { login } = useAuth();

// Show error if OAuth failed
const oauthError = computed(() => route.query.error === 'github_auth_failed');

const loginFailedMsg = ref('');
const loginFailed = ref(false);
const loading = ref(false);

const schema = z.object({
  email: z.email(),
  password: z.string('password is required'),
});

type Schema = z.output<typeof schema>;

const emailLoginHandler = async (payload: FormSubmitEvent<Schema>) => {
  loginFailed.value = false;
  loading.value = true;

  try {
    await login(payload.data);
  } catch (error) {
    if (error instanceof FetchError) {
      loginFailedMsg.value = error.data.message;
    } else {
      loginFailedMsg.value = 'An unexpected error occurred. Please try again.';
    }
    loginFailed.value = true;
  } finally {
    loading.value = false;
  }
};

const handleSocialLogin = (provider: string) => {
  // Redirect to OAuth provider
  window.location.href = `/api/auth/${provider}/login`;
};
</script>

<template>
  <div>
    <div
      v-if="oauthError"
      class="text-red-500 mb-4 p-3 bg-red-100 rounded text-sm"
    >
      GitHub authentication failed. Please try again.
    </div>

    <UAuthForm 
      :fields="fields" 
      :providers="providers" 
      :schema="schema"
      :loading="loading" 
      title="Login Your Account"
      subtitle="Welcome back! Please login to your account." 
      :submit-label="submitLabel" 
      @submit="emailLoginHandler" 
    >
      <template #password-hint>
        <NuxtLink to="/forgot-password" class="text-sm text-blue-400 hover:underline" tabindex="-1">
          Forgot your password?
        </NuxtLink>
      </template>
      <template v-if="loginFailed" #validation>
        <div class="bg-rose-800 text-white rounded-2xl p-2"> {{ loginFailedMsg }}</div>
      </template>
    </UAuthForm>
  </div>
</template>
