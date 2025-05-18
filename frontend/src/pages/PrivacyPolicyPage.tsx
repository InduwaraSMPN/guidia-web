import { motion } from "framer-motion";
import { APP_SETTINGS } from "../config";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PrivacyPolicyPage() {
  const [loading, setLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-32">
        <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <div className="mb-16">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="h-5 w-64" />
          </div>

          <div className="space-y-8">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />

                  {index % 2 === 0 && (
                    <div className="pl-6 space-y-2 mt-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 pt-32">
      <div className="max-w-[1216px] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-16"
        >
          <h1 className="text-3xl font-bold text-brand mb-6">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="space-y-8 text-foreground leading-relaxed"
        >
          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to {APP_SETTINGS.APP_NAME}. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
              This privacy policy applies to all users of our platform, including students, counselors, companies, and administrators. Please read this privacy policy carefully to understand our policies and practices regarding your personal data.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">2. Data We Collect</h2>
            <p className="mb-4">
              We collect several types of information from and about users of our platform, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <span className="font-medium">Personal identifiers:</span> Such as name, email address, phone number, and profile information.
              </li>
              <li>
                <span className="font-medium">Profile data:</span> Including your educational background, work experience, skills, and career interests.
              </li>
              <li>
                <span className="font-medium">Usage data:</span> Information about how you use our website, services, and features.
              </li>
              <li>
                <span className="font-medium">Communication data:</span> Messages, chat logs, and other communications within our platform.
              </li>
              <li>
                <span className="font-medium">Technical data:</span> Internet protocol (IP) address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access our platform.
              </li>
            </ul>
            <p>
              We do not collect any special categories of personal data about you (this includes details about your race or ethnicity, religious or philosophical beliefs, sex life, sexual orientation, political opinions, trade union membership, information about your health, and genetic and biometric data) unless you explicitly provide such information in your profile or communications.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">3. How We Use Your Data</h2>
            <p className="mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features of our service when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To facilitate connections between students, counselors, and companies</li>
              <li>To provide personalized job recommendations and career guidance</li>
            </ul>
            <p>
              We will only use your personal data for the purposes for which we collected it, unless we reasonably consider that we need to use it for another reason and that reason is compatible with the original purpose.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-4">
              We may share your personal information in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                <span className="font-medium">With other users:</span> Information you include in your profile may be visible to other users of the platform as appropriate for the functionality of the service.
              </li>
              <li>
                <span className="font-medium">With service providers:</span> We may share your information with service providers to perform services on our behalf (e.g., hosting, maintenance, database management, analytics).
              </li>
              <li>
                <span className="font-medium">For business transfers:</span> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
              </li>
              <li>
                <span className="font-medium">With your consent:</span> We may disclose your personal information for any other purpose with your consent.
              </li>
              <li>
                <span className="font-medium">Legal obligations:</span> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.
              </li>
            </ul>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">5. Data Security</h2>
            <p className="mb-4">
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
            </p>
            <p>
              Although we will do our best to protect your personal information, transmission of personal information to and from our platform is at your own risk. You should only access the services within a secure environment.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">6. Your Data Protection Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have the following data protection rights:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The right to access, update or delete the information we have on you</li>
              <li>The right of rectification - the right to have your information corrected if it is inaccurate or incomplete</li>
              <li>The right to object to our processing of your personal data</li>
              <li>The right of restriction - the right to request that we restrict the processing of your personal information</li>
              <li>The right to data portability - the right to be provided with a copy of your personal data in a structured, machine-readable format</li>
              <li>The right to withdraw consent at any time where we relied on your consent to process your personal information</li>
            </ul>
            <p>
              Please note that we may ask you to verify your identity before responding to such requests. You have the right to complain to a Data Protection Authority about our collection and use of your personal data.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to track the activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="mb-4">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
            <p>
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To maintain your authenticated session</li>
              <li>To remember your preferences and settings</li>
              <li>To analyze how you use our platform</li>
              <li>To help us improve our service</li>
            </ul>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">8. Children's Privacy</h2>
            <p>
              Our service is not intended for use by children under the age of 16. We do not knowingly collect personally identifiable information from children under 16. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from children without verification of parental consent, we take steps to remove that information from our servers.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">9. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date at the top of this privacy policy.
            </p>
            <p>
              You are advised to review this privacy policy periodically for any changes. Changes to this privacy policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this privacy policy, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>By email: {APP_SETTINGS.SUPPORT_EMAIL}</li>
              <li>By visiting the contact page on our website</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
