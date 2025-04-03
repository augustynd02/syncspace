'use client'
import UserContext from "@/contexts/UserContext";
import User from "@/types/User";

interface ProvidersProps {
  user: User | null;
  children: React.ReactNode;
}

export default function UserContextProvider({ user, children }: ProvidersProps) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}
