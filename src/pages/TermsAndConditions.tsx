import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const TermsAndConditions = () => {
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

        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Flamia's services, you accept and agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Services Provided</h2>
            <p className="text-muted-foreground">
              Flamia provides LPG gas delivery services, gas accessories, electronics, and marketplace services in Uganda. 
              We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Account</h2>
            <p className="text-muted-foreground mb-2">
              When you create an account with us, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Orders and Delivery</h2>
            <p className="text-muted-foreground mb-2">
              By placing an order, you agree that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>All orders are subject to availability and confirmation</li>
              <li>Delivery times are estimates and may vary</li>
              <li>You will provide accurate delivery location and contact information</li>
              <li>Payment must be completed as per the agreed method</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Pricing and Payments</h2>
            <p className="text-muted-foreground">
              All prices are listed in Ugandan Shillings (UGX) and may be subject to change. 
              We accept various payment methods, and you agree to pay all charges incurred through your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cancellations and Refunds</h2>
            <p className="text-muted-foreground">
              Orders may be cancelled before delivery. Refund eligibility depends on the order status and will be processed 
              according to our refund policy. Contact our customer service for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. User Conduct</h2>
            <p className="text-muted-foreground mb-2">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>Use our services for any illegal purposes</li>
              <li>Provide false or misleading information</li>
              <li>Interfere with or disrupt our services</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Flamia shall not be liable for any indirect, incidental, special, or consequential damages arising from 
              the use of our services. Our liability is limited to the amount paid for the service in question.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of our services after changes 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms and Conditions, please contact us through our customer service channels.
            </p>
          </section>
        </div>

        {/* Accept card */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-xl shadow p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="accept-terms"
                checked={agree}
                onCheckedChange={(c) => setAgree(!!c)}
                className="h-5 w-5 border-2 border-foreground data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
              />
              <label htmlFor="accept-terms" className="text-base text-foreground cursor-pointer">
                I accept the Terms and Conditions
              </label>
            </div>
            <Button
              onClick={() => { 
                if (agree) { 
                  localStorage.setItem('flamia_terms_accepted', 'true'); 
                  navigate('/privacy-policy'); 
                } 
              }}
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

export default TermsAndConditions;