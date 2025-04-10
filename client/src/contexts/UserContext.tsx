'use client'

import User from "@/types/User";
import { createContext } from "react";

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType>({ user: null, setUser: () => {} })

export default UserContext;
