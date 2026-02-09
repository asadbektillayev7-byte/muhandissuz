import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ThemeLangToggle from "@/components/ThemeLangToggle";
import { useToast } from "@/hooks/use-toast";

const LoginAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Xatolik", description: error, variant: "destructive" });
      } else {
        setEmailSent(true);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Xatolik", description: error, variant: "destructive" });
      } else {
        navigate("/admin");
      }
    }
    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="absolute top-4 right-4"><ThemeLangToggle /></div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <CardTitle className="text-xl">{t("admin.confirm_email")}</CardTitle>
            <CardDescription>{t("admin.check_email")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => { setEmailSent(false); setIsSignUp(false); }}>
              {t("admin.login_button")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="absolute top-4 right-4"><ThemeLangToggle /></div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <CardTitle className="text-xl">{isSignUp ? t("admin.signup") : t("admin.login_title")}</CardTitle>
          <CardDescription>{isSignUp ? t("admin.signup_subtitle") : t("admin.login_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("admin.fullname")}</Label>
                <Input id="fullName" placeholder="Sardor Alimov" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@muhandiss.uz" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("admin.password")}</Label>
                {!isSignUp && (
                  <button type="button" className="text-xs text-primary hover:underline">{t("admin.forgot")}</button>
                )}
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            {!isSignUp && (
              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={remember} onCheckedChange={(c) => setRemember(c === true)} />
                <Label htmlFor="remember" className="text-sm font-normal">{t("admin.remember")}</Label>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : isSignUp ? (
                <><UserPlus className="h-4 w-4 mr-1" /> {t("admin.signup")}</>
              ) : (
                <><LogIn className="h-4 w-4 mr-1" /> {t("admin.login_button")}</>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <p className="text-muted-foreground">
                {t("admin.have_account")}{" "}
                <button onClick={() => setIsSignUp(false)} className="text-primary hover:underline font-medium">
                  {t("admin.login_button")}
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                {t("admin.no_account")}{" "}
                <button onClick={() => setIsSignUp(true)} className="text-primary hover:underline font-medium">
                  {t("admin.signup")}
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginAdmin;
