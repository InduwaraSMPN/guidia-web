import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, HelpCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const navigate = useNavigate();

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Pricing plans
  const plans = [
    {
      name: "Free",
      description: "For students exploring career options",
      price: {
        monthly: 0,
        annual: 0,
      },
      features: [
        { name: "Basic profile", included: true },
        { name: "Job search", included: true },
        { name: "Document storage (2 documents)", included: true },
        { name: "Career counseling (1 session/month)", included: true },
        { name: "AI Assistant (limited)", included: true },
        { name: "Priority support", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Custom branding", included: false },
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      description: "For counselors and active job seekers",
      price: {
        monthly: 9.99,
        annual: 7.99,
      },
      features: [
        { name: "Enhanced profile", included: true },
        { name: "Unlimited job applications", included: true },
        { name: "Document storage (10 documents)", included: true },
        { name: "Career counseling (5 sessions/month)", included: true },
        { name: "AI Assistant (full access)", included: true },
        { name: "Priority support", included: true },
        { name: "Basic analytics", included: true },
        { name: "Custom branding", included: false },
      ],
      cta: "Upgrade Now",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For companies and organizations",
      price: {
        monthly: 29.99,
        annual: 24.99,
      },
      features: [
        { name: "Company profile", included: true },
        { name: "Unlimited job postings", included: true },
        { name: "Document storage (unlimited)", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "AI Assistant (full access)", included: true },
        { name: "Priority support", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom branding", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  // FAQ items
  const faqItems = [
    {
      question: "Can I change plans later?",
      answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your subscription will take effect at the start of your next billing cycle.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, all paid plans come with a 14-day free trial. You won't be charged until the trial period ends, and you can cancel anytime during the trial.",
    },
    {
      question: "How does billing work?",
      answer: "We offer both monthly and annual billing options. Annual plans are discounted compared to monthly plans. You can pay using major credit cards or PayPal.",
    },
    {
      question: "Can I get a refund?",
      answer: "If you're not satisfied with our service, you can request a refund within 30 days of your initial purchase. Please contact our support team for assistance.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-brand/10 to-background pt-24 pb-12">
        <div className="max-w-[1216px] mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Choose the plan that's right for you and start your career journey today
            </p>
            
            <div className="flex items-center justify-center space-x-2 mb-8">
              <span className={`text-sm ${billingCycle === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === "annual"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "annual" : "monthly")}
              />
              <span className={`text-sm ${billingCycle === "annual" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Annual
              </span>
              <Badge variant="outline" className="ml-2 bg-brand/10 text-brand border-brand/20">
                Save 20%
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1216px] mx-auto px-6 md:px-8 py-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={item}>
              <Card className={`h-full relative overflow-hidden ${plan.popular ? "border-brand shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {plan.price[billingCycle] > 0 ? `/ ${billingCycle === "monthly" ? "month" : "month, billed annually"}` : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${plan.popular ? "bg-brand hover:bg-brand/90" : ""}`}
                    onClick={() => navigate("/auth/register")}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-brand" />
                    {item.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center bg-brand/5 p-10 rounded-2xl border border-brand/10 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-4">Need a custom solution?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We offer tailored solutions for educational institutions and large organizations.
            Contact our sales team to discuss your specific requirements.
          </p>
          <Button
            className="bg-brand hover:bg-brand/90"
            onClick={() => navigate("/contact")}
          >
            Contact Sales
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
