import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import logger from '../utils/logger.js'

// Load environment variables
dotenv.config()

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  logger.error('Missing Supabase environment variables')
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set'
  )
}

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  logger: {
    debug: (...args) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(...args)
      }
    },
    info: (...args) => logger.info(...args),
    warn: (...args) => logger.warn(...args),
    error: (...args) => logger.error(...args)
  }
}

const supabase = createClient(supabaseUrl, supabaseKey, options)

// Add request/response interceptors for better error handling and logging
supabase.auth.onAuthStateChange((event, session) => {
  logger.info(`Auth state changed: ${event}`)
})

export default supabase