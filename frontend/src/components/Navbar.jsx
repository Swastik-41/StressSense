import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isMock } from '../services/firebase';
import { Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from './ui/Button';

export default function Navbar({ theme, toggleTheme }) {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl tracking-tight text-primary">StressSense</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button variant="ghost" size="icon" aria-label="Profile">
                    <UserIcon className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
                  <LogOut className="w-5 h-5 text-destructive" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button>Create Account</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {isMock && (
        <div className="bg-amber-500 text-white text-xs font-bold text-center py-1">
          DEVELOPMENT MODE (MOCK AUTH)
        </div>
      )}
    </nav>
  );
}
