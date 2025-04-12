
const baseURL = 'http://localhost/task-manager/public/api';

/**
 * Get the authentication token from local storage
 * @returns {string|null} The authentication token
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Generate request headers including authentication if available
 * @returns {Object} Headers object with appropriate content type and auth
 */
function getHeaders() {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Build query string from params object
 * @param {Object} params
 * @returns {string} Query string starting with ?
 */
function buildQuery(params = {}) {
  const query = new URLSearchParams(params).toString();
  return query ? `?${query}` : '';
}

/**
 * Generic request function to handle API calls
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - API endpoint
 * @param {Object|null} data - Request payload (for POST, PUT)
 * @param {Object|null} params - Query params for GET
 * @param {boolean} redirectOn401 - Whether to redirect on 401 (default true)
 * @returns {Promise<Object>} Response data
 * @throws {Error} If the request fails
 */
async function request(method, url, data = null, params = null, redirectOn401 = true) {
  try {
    const fullUrl = `${baseURL}${url}${method === 'GET' && params ? buildQuery(params) : ''}`;

    const options = {
      method,
      headers: getHeaders(),
    };

    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(fullUrl, options);

    if (response.status === 401) {
      localStorage.removeItem('token');
      if (redirectOn401) {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(
        (isJson && responseData.message) || `Request failed with status ${response.status}`
      );
    }

    return responseData;
  } catch (error) {
    console.error(`API Error (${method} ${url}):`, error);
    throw error;
  }
}

/**
 * Task management API service
 */
const TaskService = {
  // Authentication
  login(credentials) {
    return request('POST', '/login', credentials);
  },

  register(userData) {
    return request('POST', '/register', userData);
  },

  // Task CRUD operations
  getTasks(queryParams = {}) {
    return request('GET', '/tasks', null, queryParams);
  },

  getTask(id) {
    return request('GET', `/tasks/${id}`);
  },

  createTask(task) {
    return request('POST', '/tasks', task);
  },

  updateTask(id, task) {
    return request('PUT', `/tasks/${id}`, task);
  },

  deleteTask(id) {
    return request('delete', `/tasks/${id}`);
  },
};

export default TaskService;
