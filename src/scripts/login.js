// import { loginApi } from '@/services/authService'

// export default {
//   name: 'UserLoginPage',  // Changed from 'LoginPage' to a multi-word name
//   data() {
//     return {
//       email: '',
//       password: '',
//       error: '',
//       isSubmitting: false,
//       showPassword: false,
//       rememberMe: false
//     }
//   },
//   methods: {
//     async login() {
//       this.error = ''
//       this.isSubmitting = true
      
//       try {
//         const response = await loginApi(this.email, this.password)
        
//         // Store token
//         localStorage.setItem('token', response.token)
        
//         // Store email if remember me is checked
//         if (this.rememberMe) {
//           localStorage.setItem('rememberedEmail', this.email)
//         } else {
//           localStorage.removeItem('rememberedEmail')
//         }
        
//         // Redirect to tasks page
//         this.$router.push('/tasks')
//       } catch (error) {
//         if (error.response && error.response.status === 401) {
//           this.error = 'Invalid email or password'
//         } else {
//           this.error = 'Login failed. Please try again later.'
//         }
//       } finally {
//         this.isSubmitting = false
//       }
//     },
//     goToRegister() {
//       this.$router.push('/register')
//     }
//   },
//   mounted() {
//     // Check for remembered email
//     const rememberedEmail = localStorage.getItem('rememberedEmail')
//     if (rememberedEmail) {
//       this.email = rememberedEmail
//       this.rememberMe = true
//     }
//   }
// }