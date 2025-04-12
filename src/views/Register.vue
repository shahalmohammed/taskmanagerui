<template>
    <div class="register-container">
        <div class="register-card">
            <div class="register-header">
                <h1>Create Account</h1>
                <p>Please fill in the details to get started</p>
            </div>

            <form @submit.prevent="register" class="register-form">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input id="name" type="text" v-model="name" :class="{ 'input-error': errors.name }"
                            placeholder="Enter your full name" @blur="validateName" />
                    </div>
                    <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
                </div>

                <div class="form-group">
                    <label for="email">Email Address</label>
                    <div class="input-wrapper">
                        <i class="fas fa-envelope input-icon"></i>
                        <input id="email" type="email" v-model="email" :class="{ 'input-error': errors.email }"
                            placeholder="Enter your email" @blur="validateEmail" />
                    </div>
                    <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password"
                            :class="{ 'input-error': errors.password }" placeholder="Create a password (min 8 characters)"
                            @blur="validatePassword" />
                        <i class="eye-icon" :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                            @click="showPassword = !showPassword"></i>
                    </div>
                    <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
                    <div class="password-strength" v-if="password">
                        <div class="strength-bar">
                            <div class="strength-indicator" :style="{ width: passwordStrength + '%' }"
                                :class="strengthClass"></div>
                        </div>
                        <span class="strength-text">{{ strengthText }}</span>
                    </div>
                </div>

                <button type="submit" class="register-button" :disabled="isSubmitting || !isFormValid">
                    <span v-if="!isSubmitting">Create Account</span>
                    <span v-else class="spinner"></span>
                </button>
            </form>

            <div class="login-link">
                Already have an account? <a @click="goToLogin">Log in</a>
            </div>
        </div>

        <div class="alert-container" v-if="alert.show">
            <div class="alert" :class="alert.type">
                <i :class="alertIcon"></i>
                <span>{{ alert.message }}</span>
                <button @click="closeAlert" class="close-alert">&times;</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'RegisterPage',
    data() {
        return {
            name: '',
            email: '',
            password: '',
            errors: {
                name: '',
                email: '',
                password: ''
            },
            isSubmitting: false,
            showPassword: false,
            alert: {
                show: false,
                message: '',
                type: 'success'
            }
        }
    },
    computed: {
        isFormValid() {
            return (
                this.name.trim() !== '' &&
                this.email.trim() !== '' &&
                this.password.trim() !== '' &&
                !this.errors.name &&
                !this.errors.email &&
                !this.errors.password
            )
        },
        passwordStrength() {
            if (!this.password) return 0

            let strength = 0
            const password = this.password

            if (password.length < 8) {
                return 25; 
            }

            if (password.length >= 12) {
                strength += 50;
            } else if (password.length >= 8) {
                strength += 25;
            }

            if (/[A-Z]/.test(password)) strength += 15;
            if (/[0-9]/.test(password)) strength += 15;
            if (/[^A-Za-z0-9]/.test(password)) strength += 20;

            return Math.min(strength, 100);
        },
        strengthClass() {
            if (this.passwordStrength <= 25) return 'weak'
            if (this.passwordStrength <= 50) return 'medium'
            if (this.passwordStrength <= 75) return 'good'
            return 'strong'
        },
        strengthText() {
            if (this.passwordStrength <= 25) return 'Weak'
            if (this.passwordStrength <= 50) return 'Medium'
            if (this.passwordStrength <= 75) return 'Good'
            return 'Strong'
        },
        alertIcon() {
            return this.alert.type === 'success'
                ? 'fas fa-check-circle'
                : 'fas fa-exclamation-circle'
        }
    },
    methods: {
        validateName() {
            if (!this.name.trim()) {
                this.errors.name = 'Name is required'
            } else if (this.name.length < 2) {
                this.errors.name = 'Name must be at least 2 characters'
            } else {
                this.errors.name = ''
            }
        },
        validateEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!this.email.trim()) {
                this.errors.email = 'Email is required'
            } else if (!emailRegex.test(this.email)) {
                this.errors.email = 'Please enter a valid email address'
            } else {
                this.errors.email = ''
            }
        },
        validatePassword() {
            if (!this.password) {
                this.errors.password = 'Password is required'
            } else if (this.password.length < 8) {
                this.errors.password = 'Password must be at least 8 characters'
            } else {
                this.errors.password = ''
            }
        },
        validateForm() {
            this.validateName()
            this.validateEmail()
            this.validatePassword()

            return !Object.values(this.errors).some(error => error)
        },
        async register() {
            if (!this.validateForm()) return

            this.isSubmitting = true

            try {
                await axios.post('http://16.171.7.97/api/register', {
                    name: this.name,
                    email: this.email,
                    password: this.password
                })

                this.showAlert('Registration successful! Redirecting to login...', 'success')

                setTimeout(() => {
                    this.$router.push('/login')
                }, 2000)
            } catch (error) {
                let errorMessage = 'Registration failed. Please try again.'
                if (error.response) {
                    if (error.response.status === 422) {
                        // Validation errors
                        const validationErrors = error.response.data.errors
                        if (validationErrors) {
                            if (validationErrors.email) {
                                this.errors.email = validationErrors.email[0]
                            }
                            if (validationErrors.password) {
                                this.errors.password = validationErrors.password[0]
                            }
                            if (validationErrors.name) {
                                this.errors.name = validationErrors.name[0]
                            }
                            errorMessage = 'Please correct the errors and try again.'
                        }
                    } else if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message
                    }
                }

                this.showAlert(errorMessage, 'error')
            } finally {
                this.isSubmitting = false
            }
        },
        showAlert(message, type = 'success') {
            this.alert = {
                show: true,
                message,
                type
            }

            setTimeout(() => {
                this.closeAlert()
            }, 5000)
        },
        closeAlert() {
            this.alert.show = false
        },
        goToLogin() {
            this.$router.push('/login')
        }
    }
}
</script>

<style src="@/assets/styles/style.css" scoped></style>