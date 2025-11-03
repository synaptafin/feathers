<script setup lang="ts">
import { ref } from 'vue';
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

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
      loginWithGitHub();
    },
  },
];

const route = useRoute();
const router = useRouter();
const submitLabel = ref('Login');

// Show error if OAuth failed
const oauthError = computed(() => route.query.error === 'github_auth_failed');

const error = ref('');
const loading = ref(false);

const schema = z.object({
  email: z.email(),
  password: z.string('password is required').min(6),
});

type Schema = z.output<typeof schema>;

const emailLoginHandler = async (payload: FormSubmitEvent<Schema>) => {
  error.value = '';
  loading.value = true;

  try {
    await login(payload.data);
    // Redirect to home page after successful login
    router.push('/');
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    error.value = err?.data?.message || err?.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};

const loginWithGitHub = () => {
  // Redirect to GitHub OAuth
  window.location.href = '/api/auth/github/login';
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
      :error="error" 
      title="Login Your Account"
      subtitle="Welcome back! Please login to your account." 
      :submit-label="submitLabel" 
      @submit="emailLoginHandler" 
    />
    <p class="text-center mt-4 text-gray-500 text-sm">
      Don't have an account?
      <NuxtLink to="/auth/sign-up" class="text-cyan-500 font-medium hover:text-blue-500">
        Sign Up
      </NuxtLink>
    </p>
  </div>
</template>
