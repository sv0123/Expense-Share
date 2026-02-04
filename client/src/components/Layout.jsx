import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogIn, User } from 'lucide-react';

const Layout = ({ children, variant = 'centered' }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';

    return (
        <div className="min-h-screen min-h-[100dvh] relative text-foreground font-sans transition-colors duration-300 overflow-x-hidden bg-background">
            {/* Permanent background - subtle gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-950 dark:to-slate-900" />
            </div>

            {/* Navigation - top right */}
            <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/60 shadow-sm hover:opacity-90 active:scale-95 transition-all duration-200 touch-manipulation"
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? (
                        <Sun className="w-5 h-5 text-amber-500" />
                    ) : (
                        <Moon className="w-5 h-5 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Content - responsive padding and max-width */}
            <div
                className={`relative z-10 w-full mx-auto px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 max-w-md ${variant === 'centered'
                    ? 'flex items-center justify-center min-h-[100dvh] min-h-[calc(100vh-2rem)]'
                    : 'pb-24 sm:pb-28'
                    }`}
            >
                {children}
            </div>
        </div>
    );
};

export default Layout;
