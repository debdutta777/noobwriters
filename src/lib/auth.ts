import { supabaseClient } from "./supabase";
import { prisma } from "./prisma";
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

    // Hash the password for our database
    const hashedPassword = await hash(password, 10);

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        password: hashedPassword,
        role: "READER",
      },
    });

    return { success: true, user };
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