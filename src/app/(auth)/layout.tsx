import { UtensilsCrossed } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
            <UtensilsCrossed size={24} />
          </div>
          <span className="font-display text-lg font-bold text-foreground">SPU SkipQ</span>
        </div>
        {children}
      </div>
    </main>
  );
}
