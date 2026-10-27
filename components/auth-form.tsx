"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { useLocalDemo } from "@/lib/demo-client";

export function AuthForm({
  mode,
  demo,
  demoUsers,
  demoPassword,
}: {
  mode: "login" | "register";
  demo: boolean;
  demoUsers?: string[];
  demoPassword?: string;
}) {
  const router = useRouter();
  const [localDemo, setLocalDemo] = useLocalDemo();
  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { login, password } : { name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Midagi läks valesti.");
        return;
      }
      router.push(mode === "login" ? "/" : "/leibkond");
      router.refresh();
    } catch {
      setError("Ühendus serveriga ebaõnnestus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-4 py-10">
      <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-primary">
        <Receipt className="h-7 w-7" /> Tšekihoidja
      </div>
      <Card className="space-y-4 p-5">
        <h1 className="text-xl font-semibold">{mode === "login" ? "Logi sisse" : "Loo konto"}</h1>
        <form onSubmit={submit} className="space-y-4">
          {mode === "login" ? (
            <Field label="Nimi või e-post">
              <Input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
                required
              />
            </Field>
          ) : (
            <>
              <Field label="Nimi">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </Field>
              <Field label="E-post (valikuline)">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
            </>
          )}
          <Field label="Parool" hint={mode === "register" ? "Vähemalt 8 märki" : undefined}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "register" ? 8 : undefined}
              required
            />
          </Field>
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Palun oota..." : mode === "login" ? "Logi sisse" : "Loo konto"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted">
          {mode === "login" ? (
            <>
              Kontot pole?{" "}
              <Link href="/register" className="font-medium text-primary underline">
                Registreeru
              </Link>
            </>
          ) : (
            <>
              Konto juba olemas?{" "}
              <Link href="/login" className="font-medium text-primary underline">
                Logi sisse
              </Link>
            </>
          )}
        </p>
      </Card>

      {demo && mode === "login" && localDemo && demoUsers && (
        <Card className="space-y-2 border-dashed p-4 text-sm">
          <p className="font-medium">Demorežiim</p>
          <p className="text-muted">
            Proovi rakendust demokontoga: <b>{demoUsers.join("</b> või <b>")}</b>, parool{" "}
            <code className="rounded bg-primary-soft px-1">{demoPassword}</code>
          </p>
          <div className="flex flex-wrap gap-2">
            {demoUsers.map((u) => (
              <Button
                key={u}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setLogin(u);
                  setPassword(demoPassword ?? "");
                }}
              >
                Täida: {u}
              </Button>
            ))}
            <Button type="button" size="sm" variant="ghost" onClick={() => setLocalDemo(false)}>
              Lülita demorežiim välja
            </Button>
          </div>
        </Card>
      )}
    </main>
  );
}
