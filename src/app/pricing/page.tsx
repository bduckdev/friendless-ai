import Link from "next/link";
import { auth } from "~/server/auth";
import { Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default async function PricingPage() {
  const session = await auth();

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-lg">
          Choose the plan that works best for you
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {/* Free Tier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Perfect for trying out friendless</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span>100 messages per day</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span>Unlimited AI friends</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span>Basic personality customization</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span>Message history</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={session ? "/friends" : "/api/auth/signin"}>
                {session ? "Current Plan" : "Get Started"}
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Tier */}
        <Card className="border-primary relative border-2">
          <div className="bg-primary text-primary-foreground absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-medium">
            Popular
          </div>

          <CardHeader>
            <CardTitle className="text-2xl">Premium</CardTitle>
            <CardDescription>For unlimited conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <span className="text-4xl font-bold">$15</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span className="font-medium">Unlimited messages</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span>Unlimited AI friends</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span>Advanced personality customization</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
                <span>Early access to new features</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href={session ? "/profile" : "/api/auth/signin"}>
                {session ? "Upgrade to Premium" : "Get Started"}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium">Can I cancel anytime?</h3>
            <p className="text-muted-foreground">
              Yes! You can cancel your subscription at any time from your
              profile page. Your premium features will remain active until the
              end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium">
              What happens when I reach the free tier limit?
            </h3>
            <p className="text-muted-foreground">
              Your message quota resets every 24 hours. If you reach your daily
              limit, you&apos;ll need to wait until the next day or upgrade to
              Premium for unlimited messages.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium">
              Do my friends carry over if I upgrade?
            </h3>
            <p className="text-muted-foreground">
              Absolutely! All your friends and conversation history remain
              intact when you upgrade or downgrade. Nothing is lost in the
              transition.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium">
              How does the message count work?
            </h3>
            <p className="text-muted-foreground">
              Each message you send to any of your AI friends counts toward your
              daily limit. AI responses don&apos;t count against your quota -
              only the messages you send.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
