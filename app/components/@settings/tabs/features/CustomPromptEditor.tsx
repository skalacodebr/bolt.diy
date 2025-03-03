import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';
import { saveCustomPrompt, resetCustomPrompt } from '~/lib/common/prompts/custom';
import { useSettings } from '~/lib/hooks/useSettings';

export const CustomPromptEditor: React.FC = () => {
  const { promptId, setPromptId } = useSettings();
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Load current custom prompt from localStorage
  useEffect(() => {
    const savedPrompt = localStorage.getItem('bolt_custom_prompt');
    if (savedPrompt) {
      setCustomPrompt(savedPrompt);
    }
  }, []);

  // Handle save action
  const handleSave = () => {
    setIsSaving(true);
    try {
      saveCustomPrompt(customPrompt);
      setIsEditing(false);
      
      // If user is using the custom prompt, make sure it's updated
      if (promptId === 'custom') {
        setPromptId('custom');
      }
      
      toast.success('Custom prompt saved successfully');
    } catch (error) {
      console.error('Error saving custom prompt:', error);
      toast.error('Failed to save custom prompt');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset to default
  const handleReset = () => {
    const defaultPrompt = resetCustomPrompt();
    setCustomPrompt(defaultPrompt);
    toast.success('Custom prompt reset to default');
  };

  // Focus the textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  if (!isEditing) {
    return (
      <div className="mt-6 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="i-ph:code text-purple-500 w-5 h-5" />
            <h3 className="text-base font-medium text-bolt-elements-textPrimary">Custom Prompt Editor</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
            >
              Edit Prompt
            </button>
          </div>
        </div>
        <p className="text-sm text-bolt-elements-textSecondary mb-3">
          Customize the system prompt to tailor Bolt's behavior to your specific needs.
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-bolt-elements-borderColor overflow-auto max-h-[300px]">
          <pre className="text-xs text-bolt-elements-textSecondary whitespace-pre-wrap font-mono">{customPrompt}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="i-ph:code text-purple-500 w-5 h-5" />
          <h3 className="text-base font-medium text-bolt-elements-textPrimary">Editing Custom Prompt</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-bolt-elements-textSecondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-bolt-elements-textSecondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={classNames(
              "px-3 py-1.5 text-sm rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        className={classNames(
          "w-full h-[500px] p-4 rounded-lg",
          "bg-white dark:bg-gray-900",
          "border border-bolt-elements-borderColor",
          "text-sm text-bolt-elements-textPrimary font-mono",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/30",
          "transition-all duration-200"
        )}
      />
      <div className="mt-3 text-xs text-bolt-elements-textSecondary">
        <p>Use HTML-like tags to structure your prompt with instructions and constraints. Preserve the general structure of system prompts.</p>
      </div>
    </div>
  );
};