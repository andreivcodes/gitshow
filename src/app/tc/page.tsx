import { Card } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms and Conditions for using git.show",
};

export default function Page() {
  return (
    <Card className="flex min-w-[300px] max-w-2xl flex-col justify-evenly p-8 m-4">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

      <p className="text-muted-foreground mb-4">
        These Terms and Conditions ("Terms") govern your use of git.show ("we",
        "our", "us"). By accessing or using our app, you agree to be bound by
        these Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">1. Definitions</h2>
      <p className="text-muted-foreground mb-2">In these Terms, the following definitions apply:</p>
      <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
        <li>
          <strong>"App"</strong> refers to the git.show application.
        </li>
        <li>
          <strong>"User"</strong> refers to anyone who uses the app.
        </li>
        <li>
          <strong>"Content"</strong> refers to any text, images, or other
          material provided through the app.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-3">2. Eligibility</h2>
      <p className="text-muted-foreground mb-4">
        To use our app, you must be at least 16 years old or have parental
        consent. By using the app, you represent and warrant that you meet these
        eligibility requirements.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">3. Use of the App</h2>
      <p className="text-muted-foreground mb-4">
        You agree to use the app in accordance with these Terms and all
        applicable laws and regulations. You must not use the app for any
        illegal or unauthorized purpose.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">4. User Accounts</h2>
      <p className="text-muted-foreground mb-4">
        You are responsible for maintaining the confidentiality of your account
        information, including your email, passwords, and authentication tokens.
        You agree to accept responsibility for all activities that occur under
        your account.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">5. Termination</h2>
      <p className="text-muted-foreground mb-4">
        We may terminate or suspend your access to the app immediately, without
        prior notice or liability, for any reason whatsoever, including without
        limitation if you breach the Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">6. Limitation of Liability</h2>
      <p className="text-muted-foreground mb-4">
        In no event shall git.show, nor its directors, employees, partners,
        agents, suppliers, or affiliates, be liable for any indirect,
        incidental, special, consequential, or punitive damages, including
        without limitation, loss of profits, data, use, goodwill, or other
        intangible losses, resulting from your use of the app.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">7. Governing Law</h2>
      <p className="text-muted-foreground mb-4">
        These Terms shall be governed and construed in accordance with the laws
        of Romania, without regard to its conflict of law provisions.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">8. Dispute Resolution</h2>
      <p className="text-muted-foreground mb-4">
        Any disputes arising out of or relating to these Terms or the app shall
        be resolved through amicable negotiations between the parties. If the
        dispute cannot be resolved amicably, it shall be submitted to the
        competent courts in Romania.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">9. Severability</h2>
      <p className="text-muted-foreground mb-4">
        If any provision of these Terms is found to be invalid or unenforceable
        by a court, the remaining provisions will remain in effect.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">10. Entire Agreement</h2>
      <p className="text-muted-foreground mb-4">
        These Terms constitute the entire agreement between us regarding our app
        and supersede and replace any prior agreements we might have had between
        us regarding the app.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">11. Changes to These Terms</h2>
      <p className="text-muted-foreground mb-4">
        We reserve the right, at our sole discretion, to modify or replace these
        Terms at any time. If a revision is material, we will provide at least
        30 days' notice prior to any new terms taking effect. What constitutes a
        material change will be determined at our sole discretion.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">12. Contact Information</h2>
      <p className="text-muted-foreground">
        If you have any questions about these Terms, please contact us at
        contact@andreiv.com.
      </p>
    </Card>
  );
}