// This is a stub file to prevent import errors
// The application is using MongoDB, not Supabase

export const supabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: null, error: null }),
  },
};

export const supabaseAdmin = {
  auth: {
    getSession: () => Promise.resolve({ data: null, error: null }),
  },
}; 