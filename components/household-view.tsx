"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { ErrorState } from "@/components/states";
import { useLocalDemo } from "@/lib/demo-client";

type Me = { name: string; householdId: string | null; demo: boolean };
type Household = {
  name: string;
  inviteCode: string;
  members: { id: string; name: string }[];
};

async function post(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function HouseholdView() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [localDemo, setLocalDemo] = useLocalDemo();

  const load = useCallback(async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.status === 401) return router.replace("/login");
      if (!meRes.ok) return setFailed(true);
      const meData: Me = await meRes.json();
      setMe(meData);
      if (meData.householdId) {
        const hRes = await fetch("/api/household");
        if (hRes.ok) setHousehold(await hRes.json());
        else setFailed(true);
      }
    } catch {
      setFailed(true);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function act(url: string, body: unknown) {
    setError("");
    const { ok, data } = await post(url, body);
    if (!ok) return setError(data.error ?? "Midagi läks valesti.");
    await load();
    router.refresh();
  }

  async function logout() {
    await post("/api/auth/logout");
    router.replace("/login");
    router.refresh();
  }

  async function copyCode() {
    if (!household) return;
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable: the code is visible anyway
    }
  }

  if (failed) return <ErrorState />;
  if (!me) return <p className="text-sm text-muted">Laen...</p>;

  return (
    <div className="space-y-4">
      {household ? (
        <Card className="space-y-4 p-5">
          <div>
            <p className="text-sm text-muted">Sinu leibkond</p>
            <h2 className="text-xl font-semibold">{household.name}</h2>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Liikmed</p>
            <ul className="flex flex-wrap gap-2">
              {household.members.map((m) => (
                <li key={m.id} className="rounded-full bg-primary-soft px-3 py-1 text-sm">
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Kutsekood</p>
            <div className="flex items-center gap-2">
              <code className="rounded-lg bg-primary-soft px-3 py-2 text-lg font-semibold tracking-widest">
                {household.inviteCode}
              </code>
              <Button variant="outline" size="sm" onClick={copyCode}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Kopeeritud" : "Kopeeri"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted">
              Jaga seda koodi inimestega, kes peaksid sinu leibkonna tšekke nägema.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card className="space-y-4 p-5">
            <h2 className="text-lg font-semibold">Loo uus leibkond</h2>
            <Field label="Leibkonna nimi">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="nt Tamme pere" />
            </Field>
            <Button onClick={() => act("/api/household", { name })} disabled={name.trim().length < 2}>
              Loo leibkond
            </Button>
          </Card>
          <Card className="space-y-4 p-5">
            <h2 className="text-lg font-semibold">Liitu kutsekoodiga</h2>
            <Field label="Kutsekood">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="nt ABCD2345"
                autoCapitalize="characters"
              />
            </Field>
            <Button variant="outline" onClick={() => act("/api/household/join", { code })} disabled={!code.trim()}>
              Liitu
            </Button>
          </Card>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <Card className="space-y-3 p-5">
        <h2 className="text-lg font-semibold">Seaded</h2>
        <p className="text-sm text-muted">Sisse logitud: {me.name}</p>
        {me.demo && (
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 accent-primary"
              checked={localDemo}
              onChange={(e) => setLocalDemo(e.target.checked)}
            />
            Demorežiim
          </label>
        )}
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" /> Logi välja
        </Button>
      </Card>
    </div>
  );
}
