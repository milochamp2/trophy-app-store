import Link from "next/link";
import { Trophy, Users, Award, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            <span className="text-xl font-bold">Digital Trophy</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Recognize and Celebrate{" "}
            <span className="text-amber-500">Achievements</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            A powerful platform for sports clubs and organizations to create,
            manage, and award digital trophies. Build a culture of recognition
            and motivate your team members.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Start Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">
            Everything you need to manage awards
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for multi-tenant organizations with security at its core.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Trophy className="h-10 w-10 text-amber-500" />}
            title="Trophy Templates"
            description="Create reusable trophy templates with custom tiers, points, and descriptions."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-blue-500" />}
            title="Multi-Tenant"
            description="Manage multiple clubs or teams, each with their own members and awards."
          />
          <FeatureCard
            icon={<Award className="h-10 w-10 text-green-500" />}
            title="Player Cabinets"
            description="Players can view their personal trophy collection in a beautiful mobile-friendly cabinet."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-purple-500" />}
            title="Secure by Design"
            description="Row-level security ensures members only see data from their own organization."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-16">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-primary-foreground/80">
            Create your club today and start recognizing achievements.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8"
            asChild
          >
            <Link href="/register">Create Your Club</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="font-semibold">Digital Trophy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Next.js and Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
