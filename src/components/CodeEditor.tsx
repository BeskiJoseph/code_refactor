import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
}

export const CodeEditor = ({ 
  value, 
  onChange, 
  language, 
  placeholder = "Enter your code here...",
  readOnly = false,
  height = "400px"
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      try {
        // Disable Monaco's language services completely
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        });
        
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: true,
        });

        // Configure Monaco Editor
        monaco.editor.defineTheme('custom-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#0f172a',
          }
        });

        monaco.editor.setTheme('custom-dark');

        const editor = monaco.editor.create(editorRef.current, {
          value: value || '',
          language: getMonacoLanguage(language),
          theme: 'custom-dark',
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          automaticLayout: true,
          wordWrap: 'on',
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          selectionHighlight: false,
          contextmenu: true,
          mouseWheelZoom: true,
          // Completely disable all language service features
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          acceptSuggestionOnEnter: 'off',
          tabCompletion: 'off',
          parameterHints: { enabled: false },
          hover: { enabled: false },
          links: { enabled: false },
          validateOnType: false,
          validateOnPaste: false,
          // Disable additional features that might trigger workers
          codeActionsOnSave: {},
          formatOnPaste: false,
          formatOnType: false,
          formatOnSave: false,
          // Disable semantic highlighting
          semanticHighlighting: { enabled: false },
          // Disable bracket pair colorization
          bracketPairColorization: { enabled: false },
          // Disable guides
          guides: {
            bracketPairs: false,
            indentation: false,
            highlightActiveIndentation: false,
          },
        });

        monacoEditorRef.current = editor;

        // Handle content changes
        const disposable = editor.onDidChangeModelContent(() => {
          const newValue = editor.getValue();
          onChange(newValue);
        });

        return () => {
          disposable.dispose();
          editor.dispose();
        };
      } catch (error) {
        console.warn('Monaco Editor initialization error:', error);
      }
    }
  }, [language, readOnly]);

  // Update editor value when prop changes
  useEffect(() => {
    if (monacoEditorRef.current && value !== monacoEditorRef.current.getValue()) {
      monacoEditorRef.current.setValue(value || '');
    }
  }, [value]);

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

  return (
    <div className="relative">
      <div 
        ref={editorRef} 
        style={{ height }} 
        className="border rounded-md overflow-hidden"
      />
      {!value && !readOnly && (
        <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};
