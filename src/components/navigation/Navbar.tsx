"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Header } from "./Header";

export function Navbar() {
  return <Header />;
} 