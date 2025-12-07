import { Card } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy and GDPR compliance information for git.show",
};

export default function Page() {
  return (
    <Card className="flex min-w-[300px] max-w-2xl flex-col justify-evenly p-8 m-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="text-muted-foreground mb-4">
        This Privacy Policy explains how git.show ("we", "our", "us") collects, uses, and discloses
        information about you. By using our app, you agree to the collection and use of information
        in accordance with this policy.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>

      <ul className="list-disc list-inside space-y-3 text-muted-foreground mb-4">
        <li>
          <strong>Personal Information</strong>: We collect personal information that you provide to
          us, such as your email address, name, GitHub ID, GitHub username, X ID, and X username.
        </li>
        <li>
          <strong>Authentication Tokens</strong>: We collect authentication tokens from GitHub and X
          to enable the integration with these services.
        </li>
        <li>
          <strong>Usage Data</strong>: We collect information on how you access and use our app,
          including your interactions with our app.
        </li>
        <li>
          <strong>Cookies and Tracking Technologies</strong>: We use cookies and similar tracking
          technologies to track activity on our app and store certain information. You can manage
          your cookie preferences through your browser settings.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>

      <ul className="list-disc list-inside space-y-3 text-muted-foreground mb-4">
        <li>
          <strong>To Provide and Maintain the Service</strong>: We use your information to operate,
          maintain, and provide you with the features of our app.
        </li>
        <li>
          <strong>To Communicate with You</strong>: We may use your email to send you updates,
          notifications, and other information about the app.
        </li>
        <li>
          <strong>To Improve Our Service</strong>: We use the data collected to improve and
          personalize our service.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Share Your Information</h2>

      <p className="text-muted-foreground mb-3">
        We do not sell, trade, or otherwise transfer your personally identifiable information to
        outside parties, except as described below:
      </p>

      <ul className="list-disc list-inside space-y-3 text-muted-foreground mb-4">
        <li>
          <strong>Third-Party Service Providers</strong>: We may share your information with
          third-party service providers (Github and X) to perform functions and provide services to
          us.
        </li>
        <li>
          <strong>Legal Requirements</strong>: We may disclose your information if required to do so
          by law or in response to valid requests by public authorities.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>

      <p className="text-muted-foreground mb-4">
        We use technical measures to protect your personal information. These measures include
        encryption, access controls, and periodic security updates. However, no method of
        transmission over the Internet, or method of electronic storage, is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Retention</h2>

      <p className="text-muted-foreground mb-4">
        We will retain your personal data only for as long as is necessary for the purposes set out
        in this Privacy Policy. We will retain and use your personal data to the extent necessary to
        comply with our legal obligations, resolve disputes, and enforce our policies.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">6. Children's Privacy</h2>

      <p className="text-muted-foreground mb-4">
        Our app is not intended for use by children under the age of 16. We do not knowingly collect
        personally identifiable information from children under 16. If you become aware that a child
        has provided us with personal data, please contact us at contact@andreiv.com. If we become
        aware that we have collected personal data from a child under age 16 without verification of
        parental consent, we take steps to remove that information from our servers.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">7. Changes to This Privacy Policy</h2>

      <p className="text-muted-foreground mb-8">
        We may update our Privacy Policy from time to time. We will notify you of any changes by
        posting the new Privacy Policy on this page.
      </p>

      <h1 className="text-3xl font-bold mt-8 mb-6">GDPR Compliance</h1>

      <h2 className="text-xl font-semibold mt-6 mb-3">1. Data Controller</h2>

      <p className="text-muted-foreground mb-4">
        For the purposes of the General Data Protection Regulation (GDPR), the Data Controller is
        git.show and can be contacted at contact@andreiv.com.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">2. Lawful Basis for Processing</h2>

      <p className="text-muted-foreground mb-4">
        We process your personal data on the lawful basis of your consent and for the performance of
        a contract to which you are a party.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">3. Your Rights</h2>

      <p className="text-muted-foreground mb-3">Under the GDPR, you have the following rights:</p>

      <ul className="list-disc list-inside space-y-3 text-muted-foreground mb-4">
        <li>
          <strong>Right to Access</strong>: You have the right to request copies of your personal
          data.
        </li>
        <li>
          <strong>Right to Rectification</strong>: You have the right to request that we correct any
          information you believe is inaccurate or complete information you believe is incomplete.
        </li>
        <li>
          <strong>Right to Erasure</strong>: You have the right to request that we erase your
          personal data, under certain conditions.
        </li>
        <li>
          <strong>Right to Restrict Processing</strong>: You have the right to request that we
          restrict the processing of your personal data, under certain conditions.
        </li>
        <li>
          <strong>Right to Object to Processing</strong>: You have the right to object to our
          processing of your personal data, under certain conditions.
        </li>
        <li>
          <strong>Right to Data Portability</strong>: You have the right to request that we transfer
          the data that we have collected to another organization, or directly to you, under certain
          conditions.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-3">4. Exercising Your Rights</h2>

      <p className="text-muted-foreground mb-4">
        If you make a request, we have one month to respond to you. If you would like to exercise
        any of these rights, please contact us at contact@andreiv.com.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Deletion</h2>

      <p className="text-muted-foreground mb-4">
        Users have the ability to delete their data entirely through the settings in our app. If you
        need assistance, please contact us at contact@andreiv.com.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">6. International Data Transfers</h2>

      <p className="text-muted-foreground mb-3">
        If we transfer your personal data outside the European Economic Area, we will ensure that it
        is protected in a manner that is consistent with how your personal data will be protected by
        us in the EEA. This can be done in a number of ways, for instance:
      </p>

      <ul className="list-disc list-inside space-y-3 text-muted-foreground">
        <li>
          the country to which we send the personal data might be approved by the European
          Commission as offering a sufficient level of protection;
        </li>
        <li>
          the recipient might have signed up to a contract based on "model contractual clauses"
          approved by the European Commission, obliging them to protect your personal data;
        </li>
        <li>
          where the recipient is located in the US, it might be a certified member of the EU-US
          Privacy Shield scheme; or
        </li>
        <li>
          in other circumstances where the law permits us to otherwise transfer your personal data
          outside the EEA.
        </li>
      </ul>
    </Card>
  );
}
