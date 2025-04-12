<template>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Welcome Back</h1>
          <p>Login to your account</p>
        </div>
        
        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
              <i class="fas fa-envelope input-icon"></i>
              <input 
                id="email"
                type="email" 
                v-model="email" 
                :class="{'input-error': error}"
                placeholder="Enter your email" 
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input 
                id="password"
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                :class="{'input-error': error}"
                placeholder="Enter your password" 
              />
              <i 
                class="eye-icon" 
                :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                @click="showPassword = !showPassword"
              ></i>
            </div>
          </div>
          
          <div class="form-options">
            <label class="checkbox-container">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              Remember me
            </label>
          </div>
          
          <button 
            type="submit" 
            class="login-button" 
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">Log In</span>
            <span v-else class="spinner"></span>
          </button>
        </form>
        
        <div class="error-message" v-if="error">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>
        
        <div class="register-link">
          Don't have an account? <a @click="goToRegister">Create one now</a>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { loginApi } from '@/services/authService'
  
  export default {
    name: 'UserLogin', 
    data() {
      return {
        email: '',
        password: '',
        error: '',
        isSubmitting: false,
        showPassword: false,
        rememberMe: false
      }
    },
    methods: {
      async login() {
        this.error = ''
        this.isSubmitting = true
        
        try {
          const response = await loginApi(this.email, this.password)
          
          localStorage.setItem('token', response.token)
          
          if (this.rememberMe) {
            localStorage.setItem('rememberedEmail', this.email)
          } else {
            localStorage.removeItem('rememberedEmail')
          }
          
          this.$router.push('/tasks')
        } catch (error) {
          if (error.response && error.response.status === 401) {
            this.error = 'Invalid email or password'
          } else {
            this.error = 'Login failed. Please try again later.'
          }
        } finally {
          this.isSubmitting = false
        }
      },
      goToRegister() {
        this.$router.push('/register')
      }
    },
    mounted() {
      const rememberedEmail = localStorage.getItem('rememberedEmail')
      if (rememberedEmail) {
        this.email = rememberedEmail
        this.rememberMe = true
      }
    }
  }
  </script>
  
  <style src="@/assets/styles/style.css" scoped></style>