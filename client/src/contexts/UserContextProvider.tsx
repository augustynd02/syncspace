'use client'
import UserContext from "@/contexts/UserContext";
import User from "@/types/User";
import { useState } from "react";

interface ProvidersProps {
  initialUser: User | null;
  children: React.ReactNode;
}

export default function UserContextProvider({ initialUser, children }: ProvidersProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
