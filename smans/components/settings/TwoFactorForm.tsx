// components/settings/TwoFactorForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function TwoFactorForm() {
  const [enabled, setEnabled] = useState(false); // Fetch real status from user
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");

  const enable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/2fa/enable", { method: "POST" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to enable 2FA");

      setSecret(data.secret);
      setEnabled(true);
      toast.success("Scan the QR code with your authenticator app");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Invalid code");

      toast.success("2FA enabled successfully");
      setCode("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/2fa/disable", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disable 2FA");

      toast.success("2FA disabled");
      setEnabled(false);
      setSecret(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!enabled ? (
        <div>
          <p className="text-muted-foreground mb-4">
            Two-factor authentication is not enabled.
          </p>
          <Button onClick={enable2FA} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Enable 2FA
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {secret && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center">
                <QRCodeSVG value={secret} size={200} />
              </div>
              <p className="text-sm text-muted-foreground">
                Or manually enter this key: <strong>{secret}</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>

          <div className="flex gap-4">
            <Button onClick={verify2FA} disabled={loading || !code}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify & Enable
            </Button>

            <Button variant="destructive" onClick={disable2FA} disabled={loading}>
              Disable 2FA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}