import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <Card className="flex min-w-[300px] max-w-2xl flex-col justify-evenly p-8 m-4">
      <h1>Terms and Conditions</h1>

      <br />
      <p>
        These Terms and Conditions ("Terms") govern your use of git.show ("we",
        "our", "us"). By accessing or using our app, you agree to be bound by
        these Terms.
      </p>
      <br />

      <h2>1. Definitions</h2>
      <p>In these Terms, the following definitions apply:</p>
      <ul>
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
      <br />

      <h2>2. Eligibility</h2>
      <p>
        To use our app, you must be at least 16 years old or have parental
        consent. By using the app, you represent and warrant that you meet these
        eligibility requirements.
      </p>
      <br />

      <h2>3. Use of the App</h2>
      <p>
        You agree to use the app in accordance with these Terms and all
        applicable laws and regulations. You must not use the app for any
        illegal or unauthorized purpose.
      </p>
      <br />

      <h2>4. User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        information, including your email, passwords, and authentication tokens.
        You agree to accept responsibility for all activities that occur under
        your account.
      </p>
      <br />

      <h2>5. Termination</h2>
      <p>
        We may terminate or suspend your access to the app immediately, without
        prior notice or liability, for any reason whatsoever, including without
        limitation if you breach the Terms.
      </p>
      <br />

      <h2>6. Limitation of Liability</h2>
      <p>
        In no event shall git.show, nor its directors, employees, partners,
        agents, suppliers, or affiliates, be liable for any indirect,
        incidental, special, consequential, or punitive damages, including
        without limitation, loss of profits, data, use, goodwill, or other
        intangible losses, resulting from your use of the app.
      </p>
      <br />

      <h2>7. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws
        of Romania, without regard to its conflict of law provisions.
      </p>
      <br />

      <h2>8. Dispute Resolution</h2>
      <p>
        Any disputes arising out of or relating to these Terms or the app shall
        be resolved through amicable negotiations between the parties. If the
        dispute cannot be resolved amicably, it shall be submitted to the
        competent courts in Romania.
      </p>
      <br />

      <h2>9. Severability</h2>
      <p>
        If any provision of these Terms is found to be invalid or unenforceable
        by a court, the remaining provisions will remain in effect.
      </p>
      <br />

      <h2>10. Entire Agreement</h2>
      <p>
        These Terms constitute the entire agreement between us regarding our app
        and supersede and replace any prior agreements we might have had between
        us regarding the app.
      </p>
      <br />

      <h2>11. Changes to These Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these
        Terms at any time. If a revision is material, we will provide at least
        30 days' notice prior to any new terms taking effect. What constitutes a
        material change will be determined at our sole discretion.
      </p>
      <br />

      <h2>12. Contact Information</h2>
      <p>
        If you have any questions about these Terms, please contact us at
        contact@andreiv.com.
      </p>
    </Card>
  );
}
