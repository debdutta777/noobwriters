import { supabaseClient, supabaseAdmin } from "./supabase";
import { hash } from "bcrypt";

export async function signUp(email: string, password: string, name: string) {
  try {
    // Create user in Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Hash the password for extra security in our database
    const hashedPassword = await hash(password, 10);

    // Update the user metadata in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name,
        password: hashedPassword,
        userRole: "READER"
      })
      .eq('id', authData.user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/reset-password`,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePassword(password: string) {
  try {
    const { error } = await supabaseClient.auth.updateUser({
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Update password error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(userId: string, data: { name?: string, bio?: string, image?: string }) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update(data)
      .eq('id', userId);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUser() {
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.user) {
      return { success: false, error: "User not found" };
    }
    
    // Get additional user data from database
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('id, name, email, image, bio, userRole, coins')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      throw new Error(userError.message);
    }
    
    return { 
      success: true, 
      user: {
        ...userData,
        auth: data.user
      }
    };
  } catch (error: any) {
    console.error("Get user error:", error);
    return { success: false, error: error.message };
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data.session) {
      return { success: false, session: null };
    }
    
    return { success: true, session: data.session };
  } catch (error: any) {
    console.error("Get session error:", error);
    return { success: false, error: error.message };
  }
} 