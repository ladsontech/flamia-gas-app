import React from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Shield, 
  Eye, 
  Wrench, 
  Phone,
  Clock,
  MapPin,
  BookOpen,
  Users,
  Zap,
  Flame
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import Footer from "@/components/Footer";

const GasSafety = () => {
  // Safety tips data - simplified
  const safetyTips = [
    {
      id: 1,
      icon: Shield,
      title: "Proper Storage & Handling",
      color: "from-blue-500 to-blue-600",
      tips: [
        "Store the gas cylinder upright in a well-ventilated area",
        "Keep it away from direct sunlight, heat sources, and flames",
        "Ensure the regulator is properly fitted and not leaking",
        "Never store cylinders in basements or enclosed spaces"
      ]
    },
    {
      id: 2,
      icon: Eye,
      title: "Leak Detection",
      color: "from-orange-500 to-orange-600",
      tips: [
        "Perform the 'soapy water test' on connections",
        "Never use matches or lighters to check for leaks",
        "If you smell gas, turn off the valve immediately",
        "Open doors and windows if you detect a leak"
      ]
    },
    {
      id: 3,
      icon: Flame,
      title: "Safe Cooking Practices",
      color: "from-orange-500 to-orange-600",
      tips: [
        "Turn off gas when not in use",
        "Never leave cooking unattended",
        "Use right-sized burners for your pots",
        "Keep flammable items away from the stove"
      ]
    },
    {
      id: 4,
      icon: Wrench,
      title: "Maintenance & Inspection",
      color: "from-purple-500 to-purple-600",
      tips: [
        "Check hoses and regulators regularly for damage",
        "Have qualified technicians inspect your system",
        "Use only certified regulators and hoses",
        "Replace worn-out equipment immediately"
      ]
    }
  ];

  // Emergency procedures
  const emergencySteps = [
    {
      step: 1,
      title: "Turn Off Gas Valve",
      description: "Immediately turn off the gas valve and move cylinder outside"
    },
    {
      step: 2,
      title: "Ventilate Area", 
      description: "Open all doors and windows to let gas escape"
    },
    {
      step: 3,
      title: "No Electrical Switches",
      description: "Do not switch on/off any electrical appliances"
    },
    {
      step: 4,
      title: "No Open Flames",
      description: "Do not light matches, candles, or any open flames"
    },
    {
      step: 5,
      title: "Call for Help",
      description: "Contact professionals if leak persists"
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <Helmet>
        <title>Gas Safety Tips Uganda | LPG Safety Guidelines | Flamia</title>
        <meta name="description" content="Essential gas safety tips for Uganda. Learn proper LPG cylinder storage, leak detection, safe cooking practices. Expert gas safety guidelines from Flamia." />
        <meta name="keywords" content="gas safety tips Uganda, LPG safety guidelines, gas cylinder safety, cooking gas safety, gas leak detection, gas safety rules Uganda" />
        <link rel="canonical" href="https://flamia.store/safety" />
      </Helmet>

      <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Gas Safety <span className="text-accent">Guidelines</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              className="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 text-base font-semibold"
              onClick={() => document.getElementById('safety-tips')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Learn Safety Tips
            </Button>
            <Button 
              variant="outline" 
              className="border-accent text-accent hover:bg-accent/10 px-6 py-2.5 text-base font-semibold"
              onClick={() => window.open("https://wa.me/256787899483", "_blank")}
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Expert
            </Button>
          </div>
        </motion.div>

        {/* Safety Tips Section */}
        <div id="safety-tips" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center`}>
                        <tip.icon className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {tip.tips.map((tipText, tipIndex) => (
                        <div
                          key={tipIndex}
                          className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg"
                        >
                          <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tipText}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Emergency Guide Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Emergency Response Guide</h2>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              {emergencySteps.map((step, index) => (
                <div key={step.step} className="flex items-start gap-3">
                  <span className="font-bold text-red-600 text-lg min-w-[24px]">{step.step}.</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-red-500">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base md:text-lg text-gray-900 mb-2">Emergency Contact</h4>
                    <p className="text-gray-600 mb-3 text-sm">
                      For immediate gas emergency assistance, contact our 24/7 emergency hotline:
                    </p>
                  </div>
                </div>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white w-full text-sm"
                  onClick={() => window.open("tel:+256787899483", "_self")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Emergency: +256 787 899 483
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Maintenance Schedule */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-3">Maintenance Schedule</h2>
            <p className="text-gray-600">Regular maintenance keeps your gas system safe</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="w-5 h-5 text-accent" />
                  Regular Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { frequency: "Daily", task: "Visual inspection of connections", color: "bg-orange-100 text-orange-800" },
                  { frequency: "Weekly", task: "Check for gas odors around cylinder", color: "bg-blue-100 text-blue-800" },
                  { frequency: "Monthly", task: "Soap test on all connections", color: "bg-yellow-100 text-yellow-800" },
                  { frequency: "Quarterly", task: "Professional inspection", color: "bg-purple-100 text-purple-800" },
                  { frequency: "Annually", task: "Replace hoses and regulators", color: "bg-red-100 text-red-800" }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-accent/10 text-accent w-fit">
                      {item.frequency}
                    </span>
                    <span className="text-sm text-gray-700">{item.task}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-accent" />
                  Warning Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Strong gas smell around cylinder",
                  "Hissing sounds from connections",
                  "Visible damage to hoses or regulator",
                  "Rust or corrosion on cylinder",
                  "Difficulty lighting burners",
                  "Yellow or orange flames instead of blue"
                ].map((warning, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border-l-4 border-red-500"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{warning}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expert Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-accent/5 rounded-2xl p-4 text-center border border-accent/20"
        >
          <div className="max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              Need Gas Safety Assistance?
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Our certified gas safety experts are available 24/7 to help with any gas-related concerns or emergencies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.open("https://wa.me/256787899483", "_blank")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 text-sm font-semibold"
              >
                <Phone className="w-4 h-4 mr-2" />
                WhatsApp Expert
              </Button>
              <Button
                onClick={() => window.open("tel:+256787899483", "_self")}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 px-6 py-2.5 text-sm font-semibold"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Kampala & Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>Certified Experts</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default GasSafety;
