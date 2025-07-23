"use client"
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, GoogleAuthProvider } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AuthButton() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    const handleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success('Signed in successfully!');
            router.push('/dashboard');
        } catch (error) {
            toast.error('Sign-in failed. Please try again.');
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast.success('Signed out successfully!');
            router.push('/');
        } catch (error) {
            toast.error('Sign-out failed. Please try again.');
        }
    };

    return (
        <div className="flex justify-end">
            {loading ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-black text-sm flex items-center"
                >
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                    Loading...
                </motion.div>
            ) : user ? (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="bg-white text-blue-600 py-2 px-6 rounded-full border border-blue-200 shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 font-medium"
                >
                    Sign Out
                </motion.button>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignIn}
                    className="bg-blue-500 text-white py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:bg-blue-600 transition-all duration-300 font-medium flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
                    </svg>
                    Sign In with Google
                </motion.button>
            )}
        </div>

    );
}