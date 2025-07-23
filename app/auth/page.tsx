"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/firebase/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useToast } from "@/components/ToastProvide";
import { Briefcase, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import logo from "@/public/logo.png"
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";

export default function AuthPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified) {
                    showToast("✅ Successfully signed in!", "success");
                    router.push("/dashboard");
                } else {
                    showToast("⚠️ Please verify your email before signing in.", "warning");
                    auth.signOut();
                }
            }
        });

        return () => unsubscribe();
    }, [router, showToast]);


    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError("");
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            showToast("✅ Signed in with Google!", "success");
        } catch (error: any) {
            setError(error.message);
            showToast(`❌ Google sign-in failed: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) return showToast("❌ Enter your email to reset password.", "error");

        try {
            await sendPasswordResetEmail(auth, email);
            showToast("✅ Password reset email sent.", "success");
        } catch (error: any) {
            showToast(`❌ Failed to send reset email: ${error.message}`, "error");
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isSignUp) {
                if (password.length <= 8) {
                    throw new Error("Password must be at least 8 characters long.");
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                if (userCredential.user) {
                    await updateProfile(userCredential.user, {
                        displayName: name,
                    });
                    await sendEmailVerification(userCredential.user);
                    showToast("✅Please verify your email before signing in.", "success");
                    setShowVerifyModal(true);
                }
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                if (!userCredential.user.emailVerified) {
                    setError("Please verify your email before signing in.");
                    showToast("❌ Please verify your email before signing in.", "error");
                    setLoading(false);
                    return;
                }
                showToast("✅ Signed in successfully!", "success");
                router.push("/dashboard");
            }
        } catch (error: any) {
            if (error.code === "auth/user-not-found") {
                setError("No account found with this email.");
                showToast("❌ No account found with this email.", "error");
            } else if (error.code === "auth/wrong-password") {
                setError("Incorrect password.");
                showToast("❌ Incorrect password.", "error");
            } else if (error.code === "auth/invalid-email") {
                setError("Invalid email format.");
                showToast("❌ Invalid email format.", "error");
            } else {
                setError(error.message);
                showToast(`❌ ${isSignUp ? "Sign-up" : "Sign-in"} failed: ${error.message}`, "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const resendVerificationEmail = async () => {
        if (resendCooldown) {
            showToast("⏳ Please wait before resending.", "warning");
            return;
        }

        const user = auth.currentUser;
        if (user && !user.emailVerified) {
            try {
                await sendEmailVerification(user);
                showToast("✅ New verification email sent.", "success");
                setResendCooldown(true);
                setTimeout(() => setResendCooldown(false), 30000);
            } catch (error: any) {
                showToast(`❌ Failed to resend: ${error.message}`, "error");
            }
        } else {
            showToast("⚠️ Email is already verified. Go to Sign In page", "warning");
        }
    };



    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="space-orb pointer-events-none"></div>

            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <div className="bg-white/2 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-6 max-w-sm w-full transition-all duration-300 ease-in-out">
                <div className="text-center mb-6">
                    <div className="inline-flex rounded-xl mb-3">
                        <Image src={logo} alt="JobFlow AI Logo" className="w-12 h-12 md:w-14 md:h-14 rounded-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-300">{isSignUp ? "Create Account" : "Sign In"}</h2>
                    <p className="text-gray-400 mt-1 text-xs">{isSignUp ? "Join PreplystHub - AI to start preparing" : "Access your PreplystHub - AI account"}</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 flex items-center animate-fade-in text-xs">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label className="flex items-center text-xs font-semibold text-gray-300 mb-1">
                                <User className="w-4 h-4 mr-1 text-blue-700" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                required={isSignUp}
                                className="w-full px-3 py-2 text-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm"
                            />
                        </div>
                    )}
                    <div>
                        <label className="flex items-center text-xs font-semibold text-gray-300 mb-1">
                            <Mail className="w-4 h-4 mr-1 text-blue-700" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-3 py-2 text-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm"
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-xs font-semibold text-gray-300 mb-1">
                            <Lock className="w-4 h-4 mr-1 text-blue-700" />
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full text-white px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm"
                        />
                        {!isSignUp && (
                            <p className="text-[10px] text-gray-500 mt-1">
                                Forgot your password?
                                <button onClick={handleForgotPassword} className="text-blue-600 hover:underline ml-1">Reset it</button>
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center justify-center space-x-1 text-sm"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px]">
                        <span className="px-2 bg-white/90 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-1 text-sm"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">...</svg>
                    <span>Sign in with Google</span>
                </button>

                <p className="text-center mt-4 text-gray-500 text-xs">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(""); setEmail(""); setPassword(""); setName("");
                        }}
                        className="ml-1 text-blue-600 hover:underline font-medium"
                    >
                        {isSignUp ? "Sign In" : "Create an Account"}
                    </button>
                </p>
            </div>
            {showVerifyModal && (
                <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white text-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative transform transition-all duration-300 animate-in fade-in-0 zoom-in-95 border border-gray-100">
                        {/* Decorative gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl opacity-40"></div>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-amber-900">!</span>
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Verify Your Email
                            </h3>

                            {/* Description */}
                            <div className="text-center mb-8">
                                <p className="text-gray-600 leading-relaxed">
                                    A verification email has been sent to
                                </p>
                                <div className="mt-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 inline-block">
                                    <span className="font-semibold text-gray-900">{email}</span>
                                </div>
                                <p className="text-gray-600 mt-2 text-sm">
                                    Please verify your email before continuing.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        auth.signOut();
                                        setShowVerifyModal(false);
                                    }}
                                    className="flex-1 text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={async () => {
                                        try {
                                            const user = auth.currentUser;
                                            await user?.reload();
                                            if (user?.emailVerified) {
                                                showToast("✅ Email verified!", "success");
                                                setShowVerifyModal(false);
                                                router.push("/dashboard");
                                            } else {
                                                showToast("❌ Email not verified yet.", "error");
                                            }
                                        } catch (error: any) {
                                            showToast(`❌ Failed to check verification: ${error.message}`, "error");
                                        }
                                    }}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Done
                                </button>
                            </div>

                            {/* Additional info */}
                            <div className="mt-6 text-center">
                                <p className="text-xs font-bold text-red-500 mb-2">
                                    Didn't receive the email? Check your spam folder
                                </p>
                                <button
                                    onClick={resendVerificationEmail}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Resend Verification Email
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
        </div>

    );
}