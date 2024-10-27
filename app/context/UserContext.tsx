import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction, ReactNode } from 'react';
import { createClient } from '../../utils/supabase/client';

interface UserContextType {
    user: any;
    setUser: Dispatch<SetStateAction<any>>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user ?? null);
        }
        fetchUser();
    }, [supabase]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
