import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/CodeEditor";
import { CodeDiffViewer } from "@/components/CodeDiffViewer";
import CodeGenerationAnimation from "@/components/CodeGenerationAnimation";
import { Upload, Play, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import apiService, { RefactorRequest } from "@/services/api";

const RefactorPage = () => {
  const [originalCode, setOriginalCode] = useState("");
  const [refactoredCode, setRefactoredCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [activeTab, setActiveTab] = useState("input");
  const [metrics, setMetrics] = useState<any>(null);
  const [animationSpeed, setAnimationSpeed] = useState(30);
  const { toast } = useToast();
  const [isZipProcessing, setIsZipProcessing] = useState(false);
  const [zipFiles, setZipFiles] = useState<any[]>([]);
  const [zipDownloadUrl, setZipDownloadUrl] = useState<string | null>(null);
  const [zipSummary, setZipSummary] = useState<string | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const [mode, setMode] = useState<'idle' | 'single-animating' | 'single-done' | 'zip-progress' | 'zip-done' | 'zip-animating'>('idle');
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStepIndex, setZipStepIndex] = useState(0);
  const [zipAnimatedFiles, setZipAnimatedFiles] = useState<{ name: string; refactoredCode: string }[]>([]);
  const [zipCurrentFileIndex, setZipCurrentFileIndex] = useState(0);
  const [zipAnimationDone, setZipAnimationDone] = useState(false);
  const aiSteps = [
    "Analyzing files...",
    "Refactoring code...",
    "Optimizing imports...",
    "Improving naming...",
    "Finalizing..."
  ];

  // Reset all states on new upload
  const resetAll = () => {
    setOriginalCode("");
    setRefactoredCode("");
    setZipFiles([]);
    setZipDownloadUrl(null);
    setZipSummary(null);
    setZipError(null);
    setMetrics(null);
    setMode('idle');
    setZipProgress(0);
    setZipStepIndex(0);
    setZipAnimatedFiles([]);
    setZipCurrentFileIndex(0);
    setZipAnimationDone(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    resetAll();
    const file = event.target.files?.[0];
    if (!file) return;

    setZipFiles([]);
    setZipDownloadUrl(null);
    setZipSummary(null);
    setZipError(null);

    try {
      // Check if it's a zip file
      if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
        setIsZipProcessing(true);
        toast({
          title: "Uploading zip file...",
          description: "Extracting files. This may take a moment.",
        });
        const formData = new FormData();
        formData.append('file', file);
        const data = await apiService.uploadZipFile(formData);
        setIsZipProcessing(false);
        if (!data.success) {
          setZipError(data.error?.message || 'Failed to extract zip');
          toast({
            title: "Zip upload failed",
            description: data.error?.message || 'Failed to extract zip',
            variant: "destructive",
          });
          return;
        }
        setZipFiles(data.files);
        setZipSummary(`Found ${data.files.length} code files in the zip. Review and click Start Refactoring.`);
        toast({
          title: "Zip extracted!",
          description: `Found ${data.files.length} code files.`,
        });
        return;
      } else {
        // Handle individual file upload (existing logic)
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setOriginalCode(content);
          // Auto-detect language based on file extension
          const extension = file.name.split('.').pop()?.toLowerCase();
          if (extension === 'jsx' || extension === 'tsx') {
            setLanguage('react');
          } else if (extension === 'js' || extension === 'ts') {
            setLanguage('javascript');
          } else if (extension === 'json') {
            setLanguage('json');
          }
          toast({
            title: "File uploaded successfully",
            description: `Loaded ${file.name} (${content.length} characters)`,
          });
        };
        reader.readAsText(file);
      }
    } catch (error: any) {
      setIsZipProcessing(false);
      setZipError(error.response?.data?.error?.message || 'There was an error reading the file.');
      toast({
        title: "Upload failed",
        description: error.response?.data?.error?.message || "There was an error reading the file.",
        variant: "destructive",
      });
    }
  };

  const handleStartZipRefactor = async () => {
    setActiveTab("animation");
    setMode('zip-progress');
    setZipDownloadUrl(null);
    setZipSummary(null);
    setZipError(null);
    setZipAnimatedFiles([]);
    setZipCurrentFileIndex(0);
    setZipAnimationDone(false);
    try {
      // Call the new animated endpoint
      const data = await apiService.refactorZipAnimated(zipFiles.map(f => ({ name: f.name, content: f.content })));
      if (!data.success) {
        setMode('idle');
        setZipError(data.error?.message || 'Refactoring failed');
        toast({
          title: "Refactoring failed",
          description: data.error?.message || 'Refactoring failed',
          variant: "destructive",
        });
        return;
      }
      setZipAnimatedFiles(data.files);
      setMode('zip-animating');
    } catch (error: any) {
      setMode('idle');
      setZipError('Refactoring failed.');
      toast({
        title: "Refactoring failed",
        description: error?.message || 'There was an error refactoring the zip.',
        variant: "destructive",
      });
    }
  };

  const handleRefactor = async () => {
    if (!originalCode.trim() && zipFiles.length === 0) {
      toast({
        title: "No code to refactor",
        description: "Please enter or upload some code first.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab("animation");
    if (zipFiles.length > 0) {
      setMode('zip-progress');
      await handleStartZipRefactor();
      // After animation, fetch the zip for download
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/refactor/refactor-zip`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: zipFiles.map(f => ({ name: f.name, content: f.content })) }),
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setZipDownloadUrl(url);
        }
      } catch (error) {
        console.error('Zip download error:', error);
      }
      return;
    }
    setMode('single-animating');
    try {
      const request: RefactorRequest = {
        code: originalCode,
        language,
        settings: {
          useAirbnbStyle: true,
          convertCallbacks: true,
          addComments: true,
          removeDeadCode: true,
          improveNaming: true,
        }
      };
      const response = await apiService.refactorCode(request);
      if (response.success) {
        setRefactoredCode(response.data.refactoredCode);
        setMetrics(response.data.metrics);
        setMode('single-done');
      } else {
        setMode('idle');
      }
    } catch (error: any) {
      setMode('idle');
      toast({
        title: "Refactoring failed",
        description: error.response?.data?.error?.message || "There was an error processing your code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnimationComplete = () => {
    setMode('single-done');
    toast({
      title: "Code refactored successfully!",
      description: "Your code has been cleaned up and optimized.",
    });
  };

  const handleDownload = () => {
    if (!refactoredCode) {
      toast({
        title: "Nothing to download",
        description: "Please refactor some code first.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a simple text file download
    const blob = new Blob([refactoredCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refactored_code.${language === 'javascript' ? 'js' : language === 'react' ? 'jsx' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your refactored code is being downloaded.",
    });
  };

  // Animate progress bar and steps for zip refactor
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;
    let stepInterval: NodeJS.Timeout | null = null;
    if (mode === 'zip-progress') {
      setZipProgress(0);
      setZipStepIndex(0);
      progressInterval = setInterval(() => {
        setZipProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval!);
            return 100;
          }
          return prev + Math.random() * 7 + 2;
        });
      }, 400);
      stepInterval = setInterval(() => {
        setZipStepIndex((prev) => (prev + 1) % aiSteps.length);
      }, 1200);
    } else {
      setZipProgress(100);
      setZipStepIndex(0);
      if (progressInterval) clearInterval(progressInterval);
      if (stepInterval) clearInterval(stepInterval);
    }
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (stepInterval) clearInterval(stepInterval);
    };
  }, [mode]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Code Refactoring Studio</h1>
        <p className="text-muted-foreground">
          Upload your code and let AI transform it into production-ready quality
        </p>
      </div>

      {/* Configuration Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Set up your refactoring preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="language">Language/Framework</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="react">React/JSX</SelectItem>
                  <SelectItem value="nodejs">Node.js</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="speed">Animation Speed</Label>
              <Select value={animationSpeed.toString()} onValueChange={(value) => setAnimationSpeed(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Fast (10ms)</SelectItem>
                  <SelectItem value="30">Normal (30ms)</SelectItem>
                  <SelectItem value="50">Slow (50ms)</SelectItem>
                  <SelectItem value="100">Very Slow (100ms)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleRefactor} 
                disabled={mode !== 'idle'}
                className="w-full"
              >
                {mode === 'zip-progress' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Refactoring...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Refactoring
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="input">Input Code</TabsTrigger>
          <TabsTrigger value="animation" disabled={mode !== 'single-animating' && mode !== 'zip-progress' && mode !== 'zip-animating'}>
            AI Generation {mode === 'single-animating' && <Badge variant="secondary" className="ml-2">Live</Badge>}
          </TabsTrigger>
          <TabsTrigger value="diff" disabled={mode !== 'single-done'}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Code File</CardTitle>
              <CardDescription>
                Upload a JavaScript, TypeScript, React file, or ZIP archive to refactor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Drag and drop your code file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".js,.jsx,.ts,.tsx,.json,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
                {isZipProcessing && (
                  <div className="mt-4 text-blue-600">Processing, please wait...</div>
                )}
                {zipError && (
                  <div className="mt-4 text-red-600 font-semibold text-center">{zipError}</div>
                )}
                {zipSummary && (
                  <div className="mt-4 text-green-600">{zipSummary}</div>
                )}
                {zipFiles.length > 0 && (
                  <div className="mt-4 text-left">
                    <div className="font-semibold mb-2">Files found in zip:</div>
                    <ul className="text-sm max-h-40 overflow-y-auto border rounded bg-gray-50 p-2">
                      {zipFiles.map((f, i) => (
                        <li key={i} className="mb-1">
                          <span className="text-gray-700">{f.path}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {zipDownloadUrl && (
                  <a
                    href={zipDownloadUrl}
                    download="refactored-project.zip"
                    className="mt-4 inline-block"
                  >
                    <Button className="mt-2">Download Refactored Zip</Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Or Paste Your Code</CardTitle>
              <CardDescription>
                Paste your code directly into the editor below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={originalCode}
                onChange={setOriginalCode}
                language={language}
                placeholder="Paste your code here..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animation" className="space-y-6">
          {/* Zip per-file code animation */}
          {mode === 'zip-animating' && zipAnimatedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Refactored Files</CardTitle>
                <CardDescription>
                  AI is refactoring your project files. Step through each file below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-4">
                  <Button size="sm" variant="outline" onClick={() => setZipCurrentFileIndex(i => Math.max(0, i - 1))} disabled={zipCurrentFileIndex === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 font-mono text-sm">
                    {zipAnimatedFiles[zipCurrentFileIndex].name} ({zipCurrentFileIndex + 1} / {zipAnimatedFiles.length})
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setZipCurrentFileIndex(i => Math.min(zipAnimatedFiles.length - 1, i + 1))} disabled={zipCurrentFileIndex === zipAnimatedFiles.length - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <CodeGenerationAnimation
                  refactoredCode={zipAnimatedFiles[zipCurrentFileIndex].refactoredCode}
                  language={language}
                  isLoading={false}
                  onComplete={() => {
                    if (zipCurrentFileIndex === zipAnimatedFiles.length - 1) setZipAnimationDone(true);
                  }}
                  speed={20}
                />
                {zipAnimationDone && zipDownloadUrl && (
                  <div className="mt-6">
                    <a
                      href={zipDownloadUrl}
                      download="refactored-project.zip"
                      className="inline-block"
                    >
                      <Button className="mt-2">Download All as Zip</Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {mode === 'single-animating' && (
            <CodeGenerationAnimation
              refactoredCode={refactoredCode}
              language={language}
              isLoading={mode === 'single-animating'}
              onComplete={handleAnimationComplete}
              speed={20}
            />
          )}
          {mode === 'single-done' && refactoredCode && (
            <>
              <CodeGenerationAnimation
                refactoredCode={refactoredCode}
                language={language}
                isLoading={false}
                onComplete={handleAnimationComplete}
                speed={20}
              />
              {/* Show download/results UI here if needed */}
            </>
          )}
        </TabsContent>

        <TabsContent value="diff" className="space-y-6">
          {refactoredCode && (
            <>
              {/* Code Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Code Comparison</CardTitle>
                  <CardDescription>
                    See the differences between your original and refactored code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeDiffViewer
                    originalCode={originalCode}
                    refactoredCode={refactoredCode}
                    language={language}
                  />
                </CardContent>
              </Card>

              {/* Metrics */}
              {metrics && (
                <Card>
                  <CardHeader>
                    <CardTitle>Refactoring Metrics</CardTitle>
                    <CardDescription>
                      Statistics about the refactoring process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.originalLines}
                        </div>
                        <div className="text-sm text-muted-foreground">Original Lines</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.refactoredLines}
                        </div>
                        <div className="text-sm text-muted-foreground">Refactored Lines</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.linesReduced}
                        </div>
                        <div className="text-sm text-muted-foreground">Lines Reduced</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {metrics.qualityScore}/5
                        </div>
                        <div className="text-sm text-muted-foreground">Quality Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={handleDownload} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RefactorPage;
