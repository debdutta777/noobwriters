// This is a stub file to prevent import errors
// The application is using MongoDB, not Supabase

export const supabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: null, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
    updateUser: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: null, error: null }),
  },
};

export const supabaseAdmin = {
  auth: {
    getSession: () => Promise.resolve({ data: null, error: null }),
    exchangeCodeForSession: () => Promise.resolve({ data: null, error: null }),
  },
  from: () => ({
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  }),
}; 