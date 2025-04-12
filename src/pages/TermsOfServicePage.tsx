import { motion } from "framer-motion";
import { APP_SETTINGS } from "../config";

export function TermsOfServicePage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

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
            Terms of Service
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
              Welcome to {APP_SETTINGS.APP_NAME}. These Terms of Service ("Terms") govern your use of our website, services, and platform (collectively, the "Service") operated by {APP_SETTINGS.APP_NAME} ("us", "we", or "our").
            </p>
            <p className="mb-4">
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>
            <p>
              These Terms apply to all visitors, users, and others who access or use the Service, including students, counselors, companies, and administrators.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">2. Accounts</h2>
            <p className="mb-4">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p className="mb-4">
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
            </p>
            <p className="mb-4">
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
            <p>
              You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity other than you without appropriate authorization, or a name that is otherwise offensive, vulgar, or obscene.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">3. User Content</h2>
            <p className="mb-4">
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p className="mb-4">
              By posting Content on or through the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms.</li>
              <li>The posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.</li>
            </ul>
            <p className="mb-4">
              We reserve the right to terminate the account of any user found to be infringing on a copyright or other intellectual property rights.
            </p>
            <p>
              You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for Content you or any third party posts on or through the Service.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">4. Acceptable Use</h2>
            <p className="mb-4">
              You agree not to use the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful.</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm or offend the Company or users of the Service or expose them to liability.</li>
            </ul>
            <p>
              Additionally, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service in any manner that could disable, overburden, damage, or impair the site or interfere with any other party's use of the Service.</li>
              <li>Use any robot, spider, or other automatic device, process, or means to access the Service for any purpose, including monitoring or copying any of the material on the Service.</li>
              <li>Use any manual process to monitor or copy any of the material on the Service or for any other unauthorized purpose without our prior written consent.</li>
              <li>Use any device, software, or routine that interferes with the proper working of the Service.</li>
              <li>Introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.</li>
              <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
              <li>Attack the Service via a denial-of-service attack or a distributed denial-of-service attack.</li>
              <li>Otherwise attempt to interfere with the proper working of the Service.</li>
            </ul>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">5. Intellectual Property</h2>
            <p className="mb-4">
              The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of {APP_SETTINGS.APP_NAME} and its licensors. The Service is protected by copyright, trademark, and other laws of both the country and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of {APP_SETTINGS.APP_NAME}.
            </p>
            <p>
              You acknowledge and agree that we shall own all right, title, and interest in and to any feedback, suggestions, ideas, or other information or materials regarding the Service that you provide, whether by email, posting through the Service, or otherwise ("Feedback"). You hereby assign to us all right, title, and interest in and to any such Feedback.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">6. Links To Other Web Sites</h2>
            <p className="mb-4">
              Our Service may contain links to third-party web sites or services that are not owned or controlled by {APP_SETTINGS.APP_NAME}.
            </p>
            <p className="mb-4">
              {APP_SETTINGS.APP_NAME} has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that {APP_SETTINGS.APP_NAME} shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.
            </p>
            <p>
              We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or services that you visit.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">7. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="mb-4">
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
            </p>
            <p>
              All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">8. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall {APP_SETTINGS.APP_NAME}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Your access to or use of or inability to access or use the Service;</li>
              <li>Any conduct or content of any third party on the Service;</li>
              <li>Any content obtained from the Service; and</li>
              <li>Unauthorized access, use or alteration of your transmissions or content,</li>
            </ul>
            <p>
              whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">9. Disclaimer</h2>
            <p className="mb-4">
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
            </p>
            <p>
              {APP_SETTINGS.APP_NAME}, its subsidiaries, affiliates, and its licensors do not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The Service will function uninterrupted, secure or available at any particular time or location;</li>
              <li>Any errors or defects will be corrected;</li>
              <li>The Service is free of viruses or other harmful components; or</li>
              <li>The results of using the Service will meet your requirements.</li>
            </ul>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">10. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed and construed in accordance with the laws of Sri Lanka, without regard to its conflict of law provisions.
            </p>
            <p>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and supersede and replace any prior agreements we might have between us regarding the Service.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">11. Changes</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p>
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section className="bg-secondary p-8 rounded-xl shadow-sm border border-border">
            <h2 className="text-2xl font-semibold text-brand mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us:
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
