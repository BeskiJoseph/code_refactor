import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Removed slider import - using simple speed controls instead
import { 
  Brain, 
  Code, 
  CheckCircle, 
  Loader2, 
  Sparkles,
  Zap,
  Cpu,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";

interface CodeGenerationAnimationProps {
  originalCode: string;
  refactoredCode: string;
  language: string;
  isLoading: boolean; // true while waiting for backend
  onComplete?: () => void;
  speed?: number; // milliseconds per character
}

interface GenerationStep {
  type: 'thinking' | 'analyzing' | 'generating' | 'optimizing' | 'complete';
  message: string;
  duration: number;
}

const CodeGenerationAnimation = ({ 
  originalCode, 
  refactoredCode, 
  language, 
  isLoading,
  onComplete,
  speed = 20 
}: CodeGenerationAnimationProps) => {
  const [currentStep, setCurrentStep] = useState<GenerationStep | null>(null);
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(speed);
  const [hasCompleted, setHasCompleted] = useState(false);
  const cursorRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<NodeJS.Timeout>();
  const pauseTimeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const refactoredLines = refactoredCode.split('\n');
  const totalLines = refactoredLines.length;

  const generationSteps: GenerationStep[] = [
    {
      type: 'thinking',
      message: 'Analyzing code structure and patterns...',
      duration: 2000
    },
    {
      type: 'analyzing',
      message: 'Identifying refactoring opportunities...',
      duration: 1500
    },
    {
      type: 'generating',
      message: 'Generating improved code...',
      duration: 1000
    },
    {
      type: 'optimizing',
      message: 'Applying best practices and optimizations...',
      duration: 1000
    },
    {
      type: 'complete',
      message: 'Refactoring complete!',
      duration: 500
    }
  ];

  // Cursor blinking effect
  useEffect(() => {
    cursorRef.current = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 400);

    return () => {
      if (cursorRef.current) {
        clearInterval(cursorRef.current);
      }
    };
  }, []);

  // Typing effect (ChatGPT-like)
  useEffect(() => {
    if (isLoading) {
      setDisplayedCode("");
      setProgress(0);
      setHasCompleted(false);
      return;
    }
    if (!refactoredCode) return;

    let i = 0;
    setDisplayedCode("");
    setProgress(0);
    setHasCompleted(false);

    function typeNext() {
      if (i <= refactoredCode.length) {
        setDisplayedCode(refactoredCode.slice(0, i));
        setProgress(Math.round((i / refactoredCode.length) * 100));
        i++;
        // Add a little randomness for realism
        const delay = speed + Math.floor(Math.random() * 30);
        typingTimeoutRef.current = setTimeout(typeNext, delay);
      } else {
        setHasCompleted(true);
        setShowCursor(true);
        if (onComplete) onComplete();
      }
    }
    typeNext();
    return () => typingTimeoutRef.current && clearTimeout(typingTimeoutRef.current);
    // eslint-disable-next-line
  }, [isLoading, refactoredCode]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    setDisplayedCode("");
    setCurrentLineIndex(0);
    setProgress(0);
    setCurrentStep(null);
    setIsPaused(false);
    setHasCompleted(false);
    startGeneration();
  };

  const handleSpeedChange = (value: number[]) => {
    setCurrentSpeed(value[0]);
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'thinking':
        return <Brain className="h-4 w-4 animate-pulse" />;
      case 'analyzing':
        return <Code className="h-4 w-4 animate-pulse" />;
      case 'generating':
        return <Sparkles className="h-4 w-4 animate-pulse" />;
      case 'optimizing':
        return <Zap className="h-4 w-4 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };

  const getStepColor = (stepType: string) => {
    switch (stepType) {
      case 'thinking':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'analyzing':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'generating':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'optimizing':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'complete':
        return 'bg-green-500/10 text-green-600 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return 'text-yellow-600';
      case 'typescript':
        return 'text-blue-600';
      case 'react':
        return 'text-cyan-600';
      case 'nodejs':
        return 'text-green-600';
      case 'json':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              AI Code Refactoring
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getLanguageColor(language)}>
                {language}
              </Badge>
              {isGenerating && (
                <Badge variant="secondary" className="animate-pulse">
                  Live
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-4">
            {isGenerating && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                className="flex items-center gap-2"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            )}
            
            {hasCompleted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestart}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSpeedChange([Math.max(10, currentSpeed - 10)])}
                  disabled={!isGenerating}
                >
                  -
                </Button>
                <span className="text-sm text-muted-foreground w-12 flex items-center justify-center">
                  {currentSpeed}ms
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSpeedChange([Math.min(100, currentSpeed + 10)])}
                  disabled={!isGenerating}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          {/* Current Step */}
          {currentStep && (
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStepColor(currentStep.type)}`}>
              {getStepIcon(currentStep.type)}
              <span className="font-medium">{currentStep.message}</span>
              {isGenerating && currentStep.type === 'optimizing' && !isPaused && (
                <Loader2 className="h-4 w-4 animate-spin ml-auto" />
              )}
              {isPaused && (
                <Badge variant="secondary" className="ml-auto">
                  Paused
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Generation Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Original Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{originalCode}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Generated Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Refactored Code
              {isGenerating && (
                <Badge variant="secondary" className="ml-2">
                  Generating...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 font-mono p-4 rounded-lg relative min-h-[200px]">
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {displayedCode}
                {showCursor && !hasCompleted ? <span className="animate-pulse">|</span> : null}
                {hasCompleted && <span className="animate-blink">|</span>}
              </pre>
              <div className="absolute top-2 right-4 text-xs text-gray-400">
                {progress}% {isLoading ? "AI is thinking..." : "AI is typing..."}
              </div>
            </div>
            
            {/* Line Counter */}
            {isGenerating && (
              <div className="mt-2 text-sm text-muted-foreground">
                Generating line {currentLineIndex + 1} of {totalLines}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generation Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {refactoredLines.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Lines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(progress)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {currentLineIndex + 1}
              </div>
              <div className="text-sm text-muted-foreground">Current Line</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {currentSpeed}ms
              </div>
              <div className="text-sm text-muted-foreground">Speed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeGenerationAnimation; 