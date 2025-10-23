'use client';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      } else {
        console.log('Successfully logged out');
        router.push('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="
        w-full flex items-center gap-3 px-4 py-3 
        text-pv-text-secondary hover:text-pv-text-primary 
        hover:bg-pv-surface-elevated rounded-lg 
        transition-all duration-200 group
      "
    >
      <svg 
        className="w-5 h-5 group-hover:scale-110 transition-transform" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
        />
      </svg>
      <span className="font-medium">Logout</span>
    </button>
  );
}