import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginRequest } from '../services/authApi';
import { getToken, isTokenExpired, decodeToken, removeToken } from '../config/api';

interface User {
  id: number;
  user_name: string;
  employee_id?: string;
  role: string;
  access?: string[];
  user_access?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginRequest) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && !isTokenExpired(storedToken)) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Create user from token if not in storage
          setUser({
            id: decoded.id || decoded.sub || 0,
            user_name: decoded.user_name || decoded.username || '',
            employee_id: decoded.employee_id || '',
            role: decoded.role || '',
            access: [],
          });
        }
      }
    } else if (storedToken && isTokenExpired(storedToken)) {
      removeToken();
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginRequest): Promise<boolean> => {
    try {
      const response = await authApi.login(data);
      
      if (response && response.success && response.token) {
        setToken(response.token);
        
        // Handle user data - might be string ID or number
        const decoded = response.token ? decodeToken(response.token) : null;
        const userData = response.user || {
          id: decoded?.id || null,
          user_name: data.user_name || data.employee_id || '',
          employee_id: data.employee_id || null,
          role: decoded?.role || 'user',
          user_access: decoded?.user_access || null,
          department: decoded?.department || null,
        };
        
        // Ensure department/user_access is included from response
        if (response.user) {
          userData.user_access = response.user.user_access || response.user.department || userData.user_access;
          userData.department = response.user.department || response.user.user_access || userData.department;
        }
        
        setUser(userData);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        const errorMsg = response?.message || 'Login failed - invalid response';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    await authApi.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

