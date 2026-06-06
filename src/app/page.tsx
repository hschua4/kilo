import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ActivityIcon,
  LineChartIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: LineChartIcon,
    title: "Track effortlessly",
    body: "Log your weight in seconds and see daily values with a smooth 7-day average.",
  },
  {
    icon: TargetIcon,
    title: "Stay on pace",
    body: "Set a target and pace — ScaleIQ projects your completion date automatically.",
  },
  {
    icon: SparklesIcon,
    title: "AI insights",
    body: "Get a plain-English read on your trend, plateaus, and goal progress.",
  },
];

export default async function Home() {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ActivityIcon className="size-4" />
          </span>
          ScaleIQ
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/sign-up">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Weight tracking that actually tells you something.
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          Log your weight, visualize the trend, and get AI-powered insights about
          your progress and goal — without the noise of calorie counting or social
          feeds.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/sign-up">Start tracking free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in">I have an account</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-24 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-2 rounded-lg border p-6">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
