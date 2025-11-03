<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';

const fields: AuthFormField[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Enter your name',
    required: false,

  },
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
    name: 'repeatPassword',
    label: 'Repeat Password',
    type: 'password',
    placeholder: 'Repeat your password',
    required: true,
  },
  {
    name: 'rememberMe',
    label: 'Remember me',
    type: 'checkbox',
  },
];

const router = useRouter();

const form = reactive({
  email: '',
  password: '',
  repeatPassword: '',
  rememberMe: false,
});

const error = ref('');
const loading = ref(false);

const handleSubmit = async () => { };

const handleSocialLogin = (provider: string) => {
  // Redirect to OAuth provider
  window.location.href = `/api/auth/${provider}/login`;
};
</script>

<template>
  <div>
    <UAuthForm
      :fields="fields"
      :loading="loading"
      :error="error"
      submit-label="Sign Up"
      title="Create an Account"
      @submit="handleSubmit"
      @social-login="handleSocialLogin"
    />

    <NuxtLink 
      to="/terms"
      class="block text-center mt-5 text-cyan-500 text-sm font-medium hover:text-blue-500 transition-colors">
      Read User License Agreement
    </NuxtLink>
    <!-- Login link -->
    <p class="text-center mt-4 text-gray-500 text-sm">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-cyan-500 font-medium hover:text-blue-500">
        Login
      </NuxtLink>
    </p>
  </div>
</template>

