import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CodeGenerationAnimation from "./CodeGenerationAnimation";

const DemoAnimation = () => {
  const [showDemo, setShowDemo] = useState(false);

  const sampleOriginalCode = `function calculateTotal(items) {
  var total = 0;
  for(var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

function processUserData(user) {
  if(user.age > 18) {
    if(user.hasPermission) {
      return "Access granted";
    } else {
      return "No permission";
    }
  } else {
    return "Too young";
  }
}`;

  const sampleRefactoredCode = `/**
 * Calculates the total price of all items
 * @param {Array} items - Array of items with price property
 * @returns {number} Total price
 */
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price, 0);
};

/**
 * Processes user data and determines access level
 * @param {Object} user - User object with age and hasPermission properties
 * @returns {string} Access status message
 */
const processUserData = (user) => {
  const { age, hasPermission } = user;
  
  if (age <= 18) {
    return "Too young";
  }
  
  return hasPermission ? "Access granted" : "No permission";
};`;

  const handleStartDemo = () => {
    setShowDemo(true);
  };

  const handleDemoComplete = () => {
    setTimeout(() => {
      setShowDemo(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎬 AI Code Generation Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Experience the AI refactoring process with a sample code transformation. 
            Watch as the AI analyzes, thinks, and generates improved code line by line.
          </p>
          
          {!showDemo ? (
            <Button onClick={handleStartDemo} className="flex items-center gap-2">
              🚀 Start Demo Animation
            </Button>
          ) : (
            <CodeGenerationAnimation
              originalCode={sampleOriginalCode}
              refactoredCode={sampleRefactoredCode}
              language="javascript"
              onComplete={handleDemoComplete}
              speed={40}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoAnimation; 