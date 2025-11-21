import {createContext} from "react";
import {AuthContextType} from "../types";
import {ThemeContextType} from "./useTheme";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
