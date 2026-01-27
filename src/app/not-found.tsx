import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Trophy className="h-16 w-16 text-muted-foreground/50 mb-6" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-xl text-muted-foreground mb-6">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t
        have permission to access it.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/player">My Clubs</Link>
        </Button>
      </div>
    </div>
  );
}
