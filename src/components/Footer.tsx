;

import { Github, Linkedin, Twitter, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeContext } from "@/contexts/ThemeContext";

export function Footer() {
  const { isDark } = useThemeContext();
  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  ];

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Testimonials", href: "/testimonials" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Support", href: "/support" },
      ],
    },
  ];

  return (
    <footer className="bg-background pt-16 pb-12 rounded-t-xl">
      <div className="max-w-[1216px] mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {isDark ? (
                <img src="/images/logo-light.svg" alt="Guidia" className="h-10" />
              ) : (
                <img src="/images/logo-dark.svg" alt="Guidia" className="h-10" />
              )}
              <p className="text-muted-foreground max-w-xs">
                Empowering students and professionals to navigate their career
                paths with confidence.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary-light text-muted-foreground hover:bg-brand/10 hover:text-brand transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {footerLinks.map((group) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="font-semibold text-foreground mb-4">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-brand transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="pt-8 border-t border-secondary-light flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Guidia. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 sm:mt-0 text-sm text-muted-foreground">
            <a
              href="/privacy"
              className="hover:text-brand transition-colors"
            >
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-brand transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
