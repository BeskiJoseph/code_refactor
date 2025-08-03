
import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeDiffViewerProps {
  original: string;
  modified: string;
  language: string;
  height?: string;
}

export const CodeDiffViewer = ({ 
  original, 
  modified, 
  language, 
  height = "500px" 
}: CodeDiffViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

  useEffect(() => {
    if (containerRef.current && original && modified) {
      // Configure Monaco Editor theme
      monaco.editor.defineTheme('custom-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#0f172a',
        }
      });

      monaco.editor.setTheme('custom-dark');

      const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
        theme: 'custom-dark',
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: 'on',
        renderSideBySide: true,
        automaticLayout: true,
        wordWrap: 'on',
        folding: true,
        renderLineHighlight: 'line',
        contextmenu: true,
        mouseWheelZoom: true,
      });

      const originalModel = monaco.editor.createModel(
        original, 
        getMonacoLanguage(language)
      );
      const modifiedModel = monaco.editor.createModel(
        modified, 
        getMonacoLanguage(language)
      );

      diffEditor.setModel({
        original: originalModel,
        modified: modifiedModel,
      });

      diffEditorRef.current = diffEditor;

      return () => {
        originalModel.dispose();
        modifiedModel.dispose();
        diffEditor.dispose();
      };
    }
  }, [original, modified, language]);

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'react':
      case 'jsx':
        return 'javascript';
      case 'typescript':
      case 'tsx':
        return 'typescript';
      case 'nodejs':
        return 'javascript';
      case 'json':
        return 'json';
      default:
        return 'javascript';
    }
  };

  if (!original || !modified) {
    return (
      <div 
        className="flex items-center justify-center border rounded-md bg-muted/20" 
        style={{ height }}
      >
        <p className="text-muted-foreground">
          Run the refactor process to see the diff comparison
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={containerRef} 
        style={{ height }} 
        className="border rounded-md overflow-hidden"
      />
      <div className="absolute top-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Left: Original | Right: Refactored
      </div>
    </div>
  );
};
