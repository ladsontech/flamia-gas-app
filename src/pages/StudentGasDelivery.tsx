import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Flame, Clock, DollarSign, Truck, ShoppingCart, MapPin, Users } from "lucide-react";
import { BackButton } from "@/components/BackButton";

const StudentGasDelivery = () => {
  const canonicalUrl = "https://flamia.store/student-gas-delivery";

  const studentAreas = [
    { name: "Wandegeya", university: "Makerere University", popular: true },
    { name: "Kasubi", university: "Makerere University", popular: false },
    { name: "Kawaala", university: "Makerere University", popular: false },
    { name: "Naakulabye", university: "Makerere University", popular: false },
    { name: "Banda", university: "Kyambogo University", popular: true },
    { name: "Kireka", university: "Kyambogo University", popular: false },
    { name: "Nakawa", university: "MUBS & Kyambogo", popular: true },
    { name: "Kansanga", university: "KIU", popular: true },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Student-Friendly Prices",
      description: "Affordable 3kg, 6kg gas cylinders perfect for hostel cooking. Special student discounts available!",
      color: "text-green-600"
    },
    {
      icon: Clock,
      title: "Fast 30-Min Delivery",
      description: "Quick delivery to your hostel or rental. No more missing classes to buy gas!",
      color: "text-orange-600"
    },
    {
      icon: Truck,
      title: "Free Delivery",
      description: "Free delivery to all university areas. No hidden charges, no delivery fees.",
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Group Orders Welcome",
      description: "Ordering with roommates? We handle bulk orders for student groups!",
      color: "text-purple-600"
    }
  ];

  const popularSizes = [
    {
      size: "3KG",
      price: "From UGX 25,000",
      duration: "Lasts 2-3 weeks",
      ideal: "Perfect for 1-2 students",
      popular: true
    },
    {
      size: "6KG",
      price: "From UGX 45,000",
      duration: "Lasts 1-2 months",
      ideal: "Great for shared hostels",
      popular: true
    },
    {
      size: "12.5KG",
      price: "From UGX 85,000",
      duration: "Lasts 2-3 months",
      ideal: "Best for group rentals",
      popular: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>Student Gas Delivery Kampala | Affordable Gas for University Students | Hostel Gas Refill</title>
        <meta name="description" content="🎓 Student gas delivery to Makerere, Kyambogo, MUBS, KIU! Affordable 3kg gas cylinders, free delivery to hostels. Fast 30-min delivery. Special student discounts. Order gas online!" />
        <meta name="keywords" content="student gas delivery Kampala, gas delivery Wandegeya, gas delivery Makerere University, gas delivery Kyambogo, gas delivery MUBS, gas delivery KIU, hostel gas refill, cheap gas for students, 3kg gas cylinder, student discount gas, gas delivery Banda, gas delivery Nakawa, gas delivery Kansanga, university area gas refill, affordable gas students Uganda, fast gas delivery hostel, cooking gas students Kampala" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Student Gas Delivery Kampala | Affordable Gas for University Students" />
        <meta property="og:description" content="🎓 Student gas delivery to Makerere, Kyambogo, MUBS, KIU! Affordable 3kg gas, free delivery to hostels. Special student discounts!" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Local Business Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Flamia Student Gas Delivery",
            "description": "Affordable gas delivery service for university students in Kampala",
            "url": canonicalUrl,
            "priceRange": "UGX 25,000 - UGX 85,000",
            "areaServed": [
              "Wandegeya", "Kasubi", "Kawaala", "Naakulabye", "Makerere University",
              "Banda", "Kireka", "Nakawa", "Kyambogo University", "MUBS",
              "Kansanga", "KIU"
            ],
            "serviceType": ["Student Gas Delivery", "Hostel Gas Refill", "University Area LPG Delivery"],
            "offers": {
              "@type": "Offer",
              "description": "Special student discounts on gas cylinders",
              "priceSpecification": {
                "@type": "PriceSpecification",
                "minPrice": "25000",
                "maxPrice": "85000",
                "priceCurrency": "UGX"
              }
            }
          })}
        </script>
        
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 pt-16">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <BackButton />

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 mt-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
              <GraduationCap className="w-4 h-4" />
              <span>Special Student Offers</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text">
              Student Gas Delivery
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Affordable gas delivery to your hostel or rental. Fast, reliable, and student-friendly prices!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/refill">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Order Gas Now
                </Button>
              </Link>
              <a href="#areas">
                <Button size="lg" variant="outline">
                  <MapPin className="w-5 h-5 mr-2" />
                  View Delivery Areas
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <benefit.icon className={`w-10 h-10 ${benefit.color} mb-4`} />
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Popular Sizes */}
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              Popular Sizes for Students
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularSizes.map((item, index) => (
                <motion.div
                  key={item.size}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-6 relative ${item.popular ? 'border-2 border-orange-500' : ''}`}>
                    {item.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="text-center">
                      <Flame className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                      <h3 className="text-3xl font-bold mb-2">{item.size}</h3>
                      <p className="text-2xl font-bold text-orange-600 mb-2">{item.price}</p>
                      <p className="text-sm text-gray-600 mb-1">{item.duration}</p>
                      <p className="text-sm font-medium text-gray-700">{item.ideal}</p>
                      <Link to="/refill">
                        <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                          Order {item.size}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Delivery Areas */}
          <div id="areas" className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
              We Deliver to All University Areas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {studentAreas.map((area, index) => (
                <motion.div
                  key={area.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-4 text-center hover:shadow-lg transition-shadow ${area.popular ? 'border-orange-300' : ''}`}>
                    <MapPin className={`w-6 h-6 mx-auto mb-2 ${area.popular ? 'text-orange-600' : 'text-gray-600'}`} />
                    <h3 className="font-bold text-lg mb-1">{area.name}</h3>
                    <p className="text-xs text-gray-600">{area.university}</p>
                    {area.popular && (
                      <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                        High Demand
                      </span>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 sm:p-12 text-center text-white"
          >
            <GraduationCap className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Cook Like Home?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Order gas now and get free delivery to your hostel or rental in 30 minutes!
            </p>
            <Link to="/refill">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Gas Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StudentGasDelivery;

