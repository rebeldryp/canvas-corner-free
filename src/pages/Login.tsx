import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSuccess(null);
    if (!supabase) { setError("Live auth disabled"); return; }
    if (!email || !password) { setError("Enter email and password"); return; }
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setSuccess("Sign up successful. Please sign in.");
        setMode("signin");
        return;
      }
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (data?.session) {
        setSuccess("Signed in");
        navigate("/admin");
      } else {
        setError("No session created");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Authentication failed");
    }
  };

  const signOut = async () => {
    setError(null);
    setSuccess(null);
    if (!supabase) return;
    await supabase.auth.signOut();
    setSuccess("Signed out");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8 flex items-center justify-center">
      <div className="w-full max-w-sm border rounded-lg p-6 space-y-4">
        <div className="text-2xl font-semibold">{mode === "signin" ? "Sign In" : "Sign Up"}</div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={submit}>{mode === "signin" ? "Sign In" : "Sign Up"}</Button>
          <Button variant="outline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Create Account" : "Have an account?"}</Button>
          <Button variant="ghost" onClick={signOut}>Sign Out</Button>
        </div>
        <div className="text-sm text-muted-foreground">After signing in, visit /admin</div>
      </div>
      </main>
    </div>
  );
}