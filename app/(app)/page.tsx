import Link from "next/link";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Avaleht</h1>
      <EmptyState
        title="Tšekke veel pole"
        text="Pildista oma esimene tšekk ja see on alati käepärast, kui seda vaja läheb."
        action={
          <Link href="/lisa">
            <Button>Lisa tšekk</Button>
          </Link>
        }
      />
    </div>
  );
}
