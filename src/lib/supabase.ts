// This is a stub file to prevent import errors
// The application is using MongoDB, not Supabase

export const supabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: null, error: null }),
    signInWithPassword: (params: any) => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signUp: (params: any) => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: (email: string, options?: any) => Promise.resolve({ error: null }),
    updateUser: (params: any) => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  },
};

export const supabaseAdmin = {
  auth: {
    getSession: () => Promise.resolve({ data: null, error: null }),
    exchangeCodeForSession: (code: string) => Promise.resolve({ data: null, error: null }),
  },
  from: (table: string) => ({
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