import axios from 'axios'

const API_URL = 'http://16.171.7.97/api'

/**
 * Handle login request
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Response with user token
 */
export const loginApi = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password
  })
  return response.data
}

/**
 * Handle register request
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Response with registration result
 */
export const registerApi = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password
  })
  return response.data
}

/**
 * Handle logout request
 * @returns {Promise} - Response with logout result
 */
export const logoutApi = async () => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('No authentication token found')
  }
  
  const response = await axios.post(`${API_URL}/logout`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  // Clear local storage
  localStorage.removeItem('token')
  
  return response.data
}

/**
 * Check if user is authenticated
 * @returns {boolean} - Authentication status
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

/**
 * Get user token
 * @returns {string|null} - User token or null
 */
export const getToken = () => {
  return localStorage.getItem('token')
}

/**
 * Get authentication headers
 * @returns {Object} - Headers with authorization token
 */
export const getAuthHeaders = () => {
  const token = getToken()
  
  if (!token) {
    return {}
  }
  
  return {
    'Authorization': `Bearer ${token}`
  }
}