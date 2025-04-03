'use client'

import User from "@/types/User";
import { createContext } from "react";

interface UserContextType {
    user: User | null;
}

const UserContext = createContext<UserContextType>({ user: null })

export default UserContext;
