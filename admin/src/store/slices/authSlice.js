import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// API base URL
const API_BASE_URL = '/api'

// Async thunks
export const adminSignup = createAsyncThunk(
  'auth/adminSignup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Signup failed')
      }

      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred')
    }
  }
)

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed')
      }

      // Check if user is admin
      if (data.user.role !== 'Admin') {
        return rejectWithValue('Access denied. Admin privileges required.')
      }

      // Store token
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.user))
      
      return data
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred')
    }
  }
)

export const adminLogout = createAsyncThunk(
  'auth/adminLogout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      return {}
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const checkAdminAuth = createAsyncThunk(
  'auth/checkAdminAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken')
      const user = localStorage.getItem('adminUser')
      
      if (!token || !user) {
        // This is not an error - just means no admin is logged in
        return rejectWithValue({ type: 'NO_AUTH', message: 'No admin session found' })
      }

      const userData = JSON.parse(user)
      
      // Verify token is still valid
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        return rejectWithValue({ type: 'TOKEN_INVALID', message: 'Authentication session expired' })
      }

      return { token, user: userData }
    } catch (error) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      return rejectWithValue({ type: 'ERROR', message: error.message })
    }
  }
)

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Signup
      .addCase(adminSignup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(adminSignup.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(adminSignup.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload
      })
      // Admin Logout
      .addCase(adminLogout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
      })
      // Check Admin Auth
      .addCase(checkAdminAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAdminAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(checkAdminAuth.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        // Only set error if it's not a "no auth" case
        if (action.payload?.type !== 'NO_AUTH') {
          state.error = action.payload?.message || 'Authentication check failed'
        }
      })
  },
})

export const { clearError, resetAuth } = authSlice.actions

export default authSlice.reducer 