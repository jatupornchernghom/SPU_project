import { SignOutButton } from "@/components/auth/sign-out-button";

export function MobileStaffHeader({ title }: { title: string }) {
  return (
    <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card sticky top-0 z-40">
      <span className="font-display font-bold text-foreground">{title}</span>
      <div className="w-28">
        <SignOutButton compact />
      </div>
    </div>
  );
}
