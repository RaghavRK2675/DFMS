import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { user, login, loginWithGoogle, loading } = useAuth();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to={(loc.state as any)?.from || "/"} replace />;

  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  const form = (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-elevated p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl">DFMS Login</h1>
            <p className="text-xs text-muted-foreground">Digital Farm Management System</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>
        </form>

        {googleId && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 border-t" /> OR <div className="flex-1 border-t" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (cred) => {
                  if (!cred.credential) return toast.error("Google sign-in failed");
                  try {
                    await loginWithGoogle(cred.credential);
                    toast.success("Signed in with Google");
                  } catch (err: any) {
                    toast.error(err?.response?.data?.error || "Google sign-in failed");
                  }
                }}
                onError={() => toast.error("Google sign-in failed")}
              />
            </div>
          </>
        )}

        <p className="text-sm text-center mt-6 text-muted-foreground">
          New farmer?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );

  return googleId ? <GoogleOAuthProvider clientId={googleId}>{form}</GoogleOAuthProvider> : form;
}
