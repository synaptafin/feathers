<script setup lang="ts">
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui';
import * as z from 'zod';
import { FetchError } from 'ofetch';

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
    defaultValue: true,
  },
];

const schema = z
  .object({
    name: z.string().optional(),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    repeatPassword: z
      .string()
      .min(6, 'Repeat Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Passwords don\'t match',
  });

type Schema = z.output<typeof schema>;

const { register } = useAuth();

const signUpFailed = ref(false);
const signUpFailedMsg = ref('');
const loading = ref(false);

const handleSubmit = async (payload: FormSubmitEvent<Schema>) => {
  loading.value = true;
  signUpFailed.value = false;
  signUpFailedMsg.value = '';

  try {
    await register({
      email: payload.data.email,
      password: payload.data.password,
      name: payload.data.name,
    });

  } catch (error) {
    if (error instanceof FetchError) {
      signUpFailedMsg.value = error.data?.message;
    } else {
      signUpFailedMsg.value = 'An unexpected error occurred. Please try again.';
    }
    signUpFailed.value = true;
  } finally {
    loading.value = false;
  }
};

</script>

<template>
  <div>
    <UAuthForm 
      :fields="fields" 
      :loading="loading" 
      :schema="schema" 
      submit-label="Sign Up"
      title="Create an Account" 
      @submit="handleSubmit"
    >
      <template v-if="signUpFailed" #validation>
        <div class="bg-rose-800 text-white rounded-2xl p-2"> {{ signUpFailedMsg }}</div>
      </template>
    </UAuthForm>

    <NuxtLink 
      to="/terms"
      class="block text-center mt-5 text-cyan-500 text-sm font-medium hover:text-blue-500 transition-colors">
      Read User License Agreement
    </NuxtLink>
  </div>
</template>
