import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const LoginAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — navigate to dashboard
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">M</span>
          </div>
          <CardTitle className="text-xl">Muhandiss.uz Admin</CardTitle>
          <CardDescription>Boshqaruv paneliga kirish</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@muhandiss.uz" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Parol</Label>
                <button type="button" className="text-xs text-primary hover:underline">Parolni unutdingizmi?</button>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(c) => setRemember(c === true)} />
              <Label htmlFor="remember" className="text-sm font-normal">Meni eslab qol</Label>
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4 mr-1" /> Kirish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginAdmin;
