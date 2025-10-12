import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-2">
              We collect the following information to provide and improve our services:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li><strong>Personal Information:</strong> Name, phone number, email address</li>
              <li><strong>Location Data:</strong> Delivery addresses and GPS coordinates for accurate delivery</li>
              <li><strong>Order Information:</strong> Products ordered, payment details, order history</li>
              <li><strong>Device Information:</strong> Device type, browser type, IP address</li>
              <li><strong>Usage Data:</strong> How you interact with our app and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">
              We use your information for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Processing and delivering your orders</li>
              <li>Communicating with you about orders and services</li>
              <li>Providing customer support</li>
              <li>Improving our services and user experience</li>
              <li>Sending promotional offers (with your consent)</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Location Data</h2>
            <p className="text-muted-foreground">
              We collect your location data to provide accurate delivery services. Your location is used only for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
              <li>Determining delivery feasibility and costs</li>
              <li>Providing accurate delivery times</li>
              <li>Helping delivery personnel find your location</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              You can disable location services at any time through your device settings, though this may affect delivery accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Contact Information</h2>
            <p className="text-muted-foreground">
              We collect your phone number and email to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
              <li>Contact you about order updates and delivery</li>
              <li>Send order confirmations and receipts</li>
              <li>Provide customer support</li>
              <li>Send important service announcements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p className="text-muted-foreground mb-2">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li><strong>Delivery Partners:</strong> Name, phone number, and delivery address for order fulfillment</li>
              <li><strong>Payment Processors:</strong> Payment information to process transactions securely</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate our business</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information from unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as necessary to provide our services and comply with legal obligations. 
              You may request deletion of your account and data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p className="text-muted-foreground mb-2">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content. 
              You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not intended for children under 13. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes through 
              our app or via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or how we handle your data, please contact our customer service team.
            </p>
          </section>
        </div>

        {/* Accept card */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl shadow p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="accept-privacy"
                checked={agree}
                onCheckedChange={(c) => setAgree(!!c)}
                className="h-5 w-5 border-2 border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
              />
              <label htmlFor="accept-privacy" className="text-base text-foreground cursor-pointer">
                I accept the Privacy Policy
              </label>
            </div>
            <Button
              onClick={() => { if (agree) { localStorage.setItem('flamia_privacy_accepted', 'true'); navigate(-1); } }}
              disabled={!agree}
              className="h-10"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
