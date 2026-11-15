"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const OAUTH_ERRORS: Record<string, string> = {
  GoogleDomain: "เข้าสู่ระบบด้วย Google ได้เฉพาะอีเมล @spumail.net",
  GoogleEmail: "บัญชี Google นี้ยังไม่ได้ยืนยันอีเมล",
  AccessDenied: "ไม่ได้รับอนุญาตให้เข้าสู่ระบบ",
  OAuthCallbackError: "เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง",
  Configuration: "เข้าสู่ระบบด้วย Google ไม่สำเร็จ ลองใหม่อีกครั้ง",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const oauthError = searchParams.get("error");
  const [error, setError] = useState(
    oauthError ? (OAUTH_ERRORS[oauthError] ?? "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง") : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    // Full page load (not router.push + refresh) so the client router cache —
    // which still holds pages/layouts rendered for the previous account if
    // someone signs in over an existing session — is thrown away entirely.
    window.location.assign(safeCallbackUrl());
  }

  function safeCallbackUrl() {
    // Only same-site paths are honored, so callbackUrl can't redirect off-site.
    const callbackUrl = searchParams.get("callbackUrl");
    return callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/";
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="font-display text-xl font-bold text-foreground">เข้าสู่ระบบ</h1>
        <p className="text-sm text-muted-foreground mt-1">ใช้อีเมล SPU ของคุณเพื่อสั่งอาหารล่วงหน้า</p>
      </div>

      <div className="flex flex-col gap-4">
        <GoogleSignInButton label="เข้าสู่ระบบด้วย Google (@spumail.net)" callbackUrl={safeCallbackUrl()} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@spumail.net"
              className="h-12 pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Link href="/forgot-password" className="text-xs text-primary font-semibold">
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านของคุณ"
              className="h-12 pl-10"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="h-12 rounded-full text-base mt-2">
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="text-primary font-semibold">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
