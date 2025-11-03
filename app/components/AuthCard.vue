<script setup lang="ts">
const isLogin = ref<boolean>(true);
const toggleForm = () => {
  isLogin.value = !isLogin.value;
};
</script>
<template>
  <LoginForm v-if="isLogin"/>
  <SignUpForm v-else/>

  <!-- ToggleInfo -->
  <div v-if="isLogin" class="text-center mt-4 text-gray-500 text-sm">
    <span>Don't have an account?</span>
    <UButton 
      label="SignUp" 
      color="info" 
      variant="link" 
      @click="toggleForm"
    />
  </div>
  <div v-else class="text-center mt-4 text-gray-500 text-sm">
    <span>Already have an account?</span>
    <UButton 
      label="Login" 
      color="info" 
      variant="link" 
      @click="toggleForm"
    />
  </div>
</template>
