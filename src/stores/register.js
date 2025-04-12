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
        password: '',
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
      
      // Length check
      if (password.length >= 8) strength += 25
      
      // Complexity checks
      if (/[A-Z]/.test(password)) strength += 25
      if (/[0-9]/.test(password)) strength += 25
      if (/[^A-Za-z0-9]/.test(password)) strength += 25
      
      return strength
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
      } else if (!/[A-Z]/.test(this.password)) {
        this.errors.password = 'Password must contain at least one uppercase letter'
      } else if (!/[0-9]/.test(this.password)) {
        this.errors.password = 'Password must contain at least one number'
      } else if (!/[^A-Za-z0-9]/.test(this.password)) {
        this.errors.password = 'Password must contain at least one special character'
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
        await axios.post('http://localhost/task-manager/public/api/register', {
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
    },
   
    showPrivacy() {
      alert('Privacy Policy')
    }
  }
}