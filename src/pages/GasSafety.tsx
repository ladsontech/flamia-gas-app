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
  Star,
  BookOpen,
  Users,
  Award,
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
      color: "from-green-500 to-green-600",
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
      description: "Immediately turn off the gas valve and move cylinder outside",
      icon: "🔴"
    },
    {
      step: 2,
      title: "Ventilate Area",
      description: "Open all doors and windows to let gas escape",
      icon: "🌬️"
    },
    {
      step: 3,
      title: "No Electrical Switches",
      description: "Do not switch on/off any electrical appliances",
      icon: "⚡"
    },
    {
      step: 4,
      title: "No Open Flames",
      description: "Do not light matches, candles, or any open flames",
      icon: "🚫"
    },
    {
      step: 5,
      title: "Call for Help",
      description: "Contact professionals if leak persists",
      icon: "📞"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Helmet>
        <title>Gas Safety Tips Uganda | LPG Safety Guidelines | Flamia</title>
        <meta name="description" content="Essential gas safety tips for Uganda. Learn proper LPG cylinder storage, leak detection, safe cooking practices. Expert gas safety guidelines from Flamia." />
        <meta name="keywords" content="gas safety tips Uganda, LPG safety guidelines, gas cylinder safety, cooking gas safety, gas leak detection, gas safety rules Uganda" />
        <link rel="canonical" href="https://flamia.store/safety" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4 md:mb-6">
            <Shield className="w-4 h-4" />
            Safety First
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            Gas Safety <span className="text-accent">Guidelines</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8 px-4">
            Essential safety tips for using cooking gas safely at home. 
            Protect your family with proper LPG handling practices.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Button 
              className="bg-accent hover:bg-accent/90 text-white px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg font-semibold"
              onClick={() => document.getElementById('safety-tips')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BookOpen className="w-4 md:w-5 h-4 md:h-5 mr-2" />
              Learn Safety Tips
            </Button>
            <Button 
              variant="outline" 
              className="border-accent text-accent hover:bg-accent/10 px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg font-semibold"
              onClick={() => window.open("https://wa.me/256789572007", "_blank")}
            >
              <Phone className="w-4 md:w-5 h-4 md:h-5 mr-2" />
              Contact Expert
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-16 px-4"
        >
          {[
            { icon: Users, number: "500+", label: "Families Protected", color: "text-blue-600" },
            { icon: Award, number: "99%", label: "Safety Record", color: "text-green-600" },
            { icon: Clock, number: "24/7", label: "Expert Support", color: "text-orange-600" },
            { icon: Star, number: "4.9", label: "Safety Rating", color: "text-yellow-600" }
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="text-center p-3 md:p-6 hover:shadow-lg transition-shadow">
                <stat.icon className={`w-6 md:w-8 h-6 md:h-8 mx-auto mb-2 md:mb-3 ${stat.color}`} />
                <div className="text-xl md:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Safety Tips Section */}
        <div id="safety-tips" className="mb-8 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Essential Safety Guidelines</h2>
            <p className="text-gray-600 max-w-2xl mx-auto px-4">
              Follow these important safety tips to protect your family and home
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4">
            {safetyTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 md:pb-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-10 md:w-12 h-10 md:h-12 rounded-xl bg-gradient-to-r ${tip.color} flex items-center justify-center`}>
                        <tip.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg md:text-xl">{tip.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 md:space-y-3">
                      {tip.tips.map((tipText, tipIndex) => (
                        <div
                          key={tipIndex}
                          className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg"
                        >
                          <CheckCircle2 className="w-4 md:w-5 h-4 md:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm md:text-base text-gray-700">{tipText}</span>
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
        <div className="mb-8 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Emergency Response Guide</h2>
            <p className="text-lg text-gray-600 px-4">What to do in case of a gas leak</p>
          </div>

          <Card className="p-4 md:p-8 bg-gradient-to-r from-red-50 to-orange-50 border-red-200 mx-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {emergencySteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 md:w-16 h-12 md:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                    <span className="text-xl md:text-2xl">{step.icon}</span>
                  </div>
                  <div className="bg-red-600 text-white w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 font-bold text-sm md:text-base">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-base md:text-lg text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-white rounded-lg border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 md:w-6 h-5 md:h-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">Emergency Contact</h4>
                  <p className="text-gray-600 mb-3 text-sm md:text-base">
                    For immediate gas emergency assistance, contact our 24/7 emergency hotline:
                  </p>
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
                    onClick={() => window.open("tel:+256789572007", "_self")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Emergency: +256 789 572 007
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Maintenance Schedule */}
        <div className="mb-8 md:mb-16">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Maintenance Schedule</h2>
            <p className="text-gray-600 px-4">Regular maintenance keeps your gas system safe</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 px-4">
            <Card className="p-4 md:p-6">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Wrench className="w-5 h-5 text-accent" />
                  Regular Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {[
                  { frequency: "Daily", task: "Visual inspection of connections", color: "bg-green-100 text-green-800" },
                  { frequency: "Weekly", task: "Check for gas odors around cylinder", color: "bg-blue-100 text-blue-800" },
                  { frequency: "Monthly", task: "Soap test on all connections", color: "bg-yellow-100 text-yellow-800" },
                  { frequency: "Quarterly", task: "Professional inspection", color: "bg-purple-100 text-purple-800" },
                  { frequency: "Annually", task: "Replace hoses and regulators", color: "bg-red-100 text-red-800" }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className={`px-2 py-1 rounded text-xs md:text-sm font-semibold ${item.color} w-fit`}>
                      {item.frequency}
                    </span>
                    <span className="text-sm md:text-base text-gray-700">{item.task}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="p-4 md:p-6">
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Zap className="w-5 h-5 text-accent" />
                  Warning Signs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
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
                    className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-red-50 rounded-lg border-l-4 border-red-500"
                  >
                    <AlertTriangle className="w-4 md:w-5 h-4 md:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-700">{warning}</span>
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
          className="bg-gradient-to-r from-accent/10 to-blue-50 rounded-2xl p-6 md:p-8 text-center border border-accent/20 mx-4"
        >
          <div className="max-w-3xl mx-auto">
            <div className="w-12 md:w-16 h-12 md:h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Users className="w-6 md:w-8 h-6 md:h-8 text-accent" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
              Need Gas Safety Assistance?
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6">
              Our certified gas safety experts are available 24/7 to help with any gas-related concerns or emergencies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button
                onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg font-semibold"
              >
                <Phone className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                WhatsApp Expert
              </Button>
              <Button
                onClick={() => window.open("tel:+256789572007", "_self")}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 px-6 md:px-8 py-2.5 md:py-3 text-base md:text-lg font-semibold"
              >
                <Phone className="w-4 md:w-5 h-4 md:h-5 mr-2" />
                Call Now
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mt-4 md:mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Kampala & Surrounding Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
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