import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Flame, 
  Shield, 
  Eye, 
  Wrench, 
  Phone,
  Clock,
  MapPin,
  Star,
  ChevronDown,
  ChevronRight,
  Play,
  BookOpen,
  Users,
  Award,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from "react-helmet";
import Footer from "@/components/Footer";

const GasSafety = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedTip, setSelectedTip] = useState(0);

  // Safety tips data
  const safetyTips = [
    {
      id: 1,
      icon: Shield,
      title: "Proper Storage & Handling",
      description: "Store cylinders upright in well-ventilated areas",
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
      description: "Regular checks prevent dangerous gas leaks",
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
      description: "Essential guidelines for daily gas usage",
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
      description: "Regular maintenance ensures safety",
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

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Safety First
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Gas Safety <span className="text-accent">Guidelines</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Essential safety tips for using cooking gas safely at home. 
            Protect your family with proper LPG handling practices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-accent hover:bg-accent/90 text-white px-8 py-3 text-lg font-semibold"
              onClick={() => document.getElementById('safety-tips')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Learn Safety Tips
            </Button>
            <Button 
              variant="outline" 
              className="border-accent text-accent hover:bg-accent/10 px-8 py-3 text-lg font-semibold"
              onClick={() => window.open("https://wa.me/256789572007", "_blank")}
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Expert
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { icon: Users, number: "500+", label: "Families Protected", color: "text-blue-600" },
            { icon: Award, number: "99%", label: "Safety Record", color: "text-green-600" },
            { icon: Clock, number: "24/7", label: "Expert Support", color: "text-orange-600" },
            { icon: Star, number: "4.9", label: "Safety Rating", color: "text-yellow-600" }
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tips" className="mb-16">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Safety Tips
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Guide
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance
            </TabsTrigger>
          </TabsList>

          {/* Safety Tips Tab */}
          <TabsContent value="tips" id="safety-tips">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tips Navigation */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Essential Safety Guidelines</h2>
                {safetyTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedTip === index ? 'ring-2 ring-accent shadow-lg' : ''
                      }`}
                      onClick={() => setSelectedTip(index)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tip.color} flex items-center justify-center`}>
                            <tip.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">{tip.title}</h3>
                            <p className="text-gray-600 text-sm">{tip.description}</p>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedTip === index ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Selected Tip Details */}
              <div className="lg:sticky lg:top-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTip}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden">
                      <div className={`h-2 bg-gradient-to-r ${safetyTips[selectedTip].color}`} />
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${safetyTips[selectedTip].color} flex items-center justify-center`}>
                            <safetyTips[selectedTip].icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{safetyTips[selectedTip].title}</CardTitle>
                            <p className="text-gray-600">{safetyTips[selectedTip].description}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {safetyTips[selectedTip].tips.map((tip, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{tip}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </TabsContent>

          {/* Emergency Guide Tab */}
          <TabsContent value="emergency">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Emergency Response Guide</h2>
                <p className="text-lg text-gray-600">What to do in case of a gas leak</p>
              </div>

              <Card className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {emergencySteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">{step.icon}</span>
                      </div>
                      <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-white rounded-lg border-l-4 border-red-500">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">Emergency Contact</h4>
                      <p className="text-gray-600 mb-3">
                        For immediate gas emergency assistance, contact our 24/7 emergency hotline:
                      </p>
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white"
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
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-accent" />
                    Regular Maintenance Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { frequency: "Daily", task: "Visual inspection of connections", color: "bg-green-100 text-green-800" },
                    { frequency: "Weekly", task: "Check for gas odors around cylinder", color: "bg-blue-100 text-blue-800" },
                    { frequency: "Monthly", task: "Soap test on all connections", color: "bg-yellow-100 text-yellow-800" },
                    { frequency: "Quarterly", task: "Professional inspection", color: "bg-purple-100 text-purple-800" },
                    { frequency: "Annually", task: "Replace hoses and regulators", color: "bg-red-100 text-red-800" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <Badge className={`${item.color} font-semibold`}>{item.frequency}</Badge>
                      <span className="text-gray-700">{item.task}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Warning Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Strong gas smell around cylinder",
                    "Hissing sounds from connections",
                    "Visible damage to hoses or regulator",
                    "Rust or corrosion on cylinder",
                    "Difficulty lighting burners",
                    "Yellow or orange flames instead of blue"
                  ].map((warning, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500"
                    >
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{warning}</span>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Expert Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-accent/10 to-blue-50 rounded-2xl p-8 text-center border border-accent/20"
        >
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Need Gas Safety Assistance?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Our certified gas safety experts are available 24/7 to help with any gas-related concerns or emergencies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.open("https://wa.me/256789572007", "_blank")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
              >
                <Phone className="w-5 h-5 mr-2" />
                WhatsApp Expert
              </Button>
              <Button
                onClick={() => window.open("tel:+256789572007", "_self")}
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 px-8 py-3 text-lg font-semibold"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
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