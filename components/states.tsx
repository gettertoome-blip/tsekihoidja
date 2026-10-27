import { AlertTriangle, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="rounded-full bg-primary-soft p-4 text-primary">
        <Inbox className="h-8 w-8" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {text && <p className="max-w-xs text-sm text-muted">{text}</p>}
      {action}
    </Card>
  );
}

export function ErrorState({ text }: { text?: string }) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center" role="alert">
      <span className="rounded-full bg-red-100 p-4 text-red-700">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h2 className="text-lg font-semibold">Midagi läks valesti</h2>
      <p className="max-w-xs text-sm text-muted">
        {text ?? "Andmebaasiga ei õnnestunud ühendust luua. Palun proovi mõne hetke pärast uuesti."}
      </p>
    </Card>
  );
}
