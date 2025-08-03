import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Zap, Shield, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DemoAnimation from "@/components/DemoAnimation";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: "AI-Powered Refactoring",
      description: "Transform messy code into clean, production-ready JavaScript, React, and Node.js using advanced LLM models."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Lightning Fast",
      description: "Get refactored code in seconds with our optimized Groq LLaMA 3 integration and intelligent processing."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Best Practices",
      description: "Follows Airbnb style guide, ESLint rules, and modern JavaScript conventions automatically."
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: "Export & Download",
      description: "Download your refactored projects as ZIP files or push directly to GitHub repositories."
    }
  ];

  const stats = [
    { value: "10K+", label: "Lines Refactored" },
    { value: "500+", label: "Happy Developers" },
    { value: "99%", label: "Code Quality Score" },
    { value: "24/7", label: "Available" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Transform Messy Code into
              <span className="text-primary block">Production-Ready Masterpieces</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your JavaScript, React, or Node.js code and watch our AI refactor it using industry best practices, 
              clean naming conventions, and modern patterns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/refactor")}>
                Start Refactoring
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See AI in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch our AI analyze, think, and generate improved code line by line in real-time
            </p>
          </div>
          <DemoAnimation />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose CodeRefactor AI?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional-grade code refactoring powered by cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Clean Up Your Code?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of developers who trust CodeRefactor AI to transform their codebase
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate("/refactor")}>
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
