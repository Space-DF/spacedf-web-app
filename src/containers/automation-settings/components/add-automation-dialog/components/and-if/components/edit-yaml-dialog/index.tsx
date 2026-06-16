'use client'

import { useState, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Editor, { loader, type OnMount } from '@monaco-editor/react'
import { stringify } from 'yaml'
import { Undo2, Redo2, Copy, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AddAutomationFormValues } from '../../../../schema'
import { parseAndValidateYaml } from './utils'
import { useTheme } from 'next-themes'

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs',
  },
})

type Condition = AddAutomationFormValues['conditions'][number]

interface EditYamlPanelProps {
  condition: Condition
  onSave: (updated: Condition) => void
  onCancel: () => void
}

function stripInternalFields(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripInternalFields)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => key !== 'id')
        .map(([key, val]) => [key, stripInternalFields(val)])
    )
  }
  return obj
}

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  wordWrap: 'on' as const,
  tabSize: 2,
  automaticLayout: true,
  padding: { top: 8 },
  renderLineHighlight: 'none' as const,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: { vertical: 'hidden' as const, horizontal: 'hidden' as const },
}

interface ToolbarProps {
  editorRef: React.RefObject<Parameters<OnMount>[0] | null>
  onExpand?: () => void
}

const Toolbar = ({ editorRef, onExpand }: ToolbarProps) => {
  const handleUndo = () => {
    editorRef.current?.trigger('keyboard', 'undo', null)
  }

  const handleRedo = () => {
    editorRef.current?.trigger('keyboard', 'redo', null)
  }

  const handleCopy = () => {
    const value = editorRef.current?.getValue()
    if (value) navigator.clipboard.writeText(value)
  }

  const buttons = [
    { icon: Undo2, onClick: handleUndo, label: 'Undo' },
    { icon: Redo2, onClick: handleRedo, label: 'Redo' },
    { icon: Copy, onClick: handleCopy, label: 'Copy' },
    ...(onExpand
      ? [{ icon: Maximize2, onClick: onExpand, label: 'Expand' }]
      : []),
  ]

  return (
    <div className="flex items-center gap-1">
      {buttons.map(({ icon: Icon, onClick, label }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          className="rounded p-1 text-brand-icon-gray hover:bg-brand-component-fill-gray-soft hover:text-brand-component-text-dark"
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  )
}

export const EditYamlPanel = ({
  condition,
  onSave,
  onCancel,
}: EditYamlPanelProps) => {
  const t = useTranslations('common')
  const { resolvedTheme } = useTheme()
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const dialogEditorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const initialYaml = stringify(stripInternalFields(condition))

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const handleDialogEditorMount: OnMount = (editor) => {
    dialogEditorRef.current = editor
  }

  const handleExpand = () => {
    setDialogOpen(true)
  }

  const handleDialogSave = () => {
    const value = dialogEditorRef.current?.getValue()
    if (!value) return

    const result = parseAndValidateYaml(value, t('invalid_yaml_structure'))
    if (!result.success) {
      setError(result.error)
      return
    }
    setError(null)
    editorRef.current?.setValue(value)
    setDialogOpen(false)
    onSave(result.data)
  }

  const handleSave = useCallback(() => {
    const value = editorRef.current?.getValue()
    if (!value) return

    const result = parseAndValidateYaml(value, t('invalid_yaml_structure'))
    if (!result.success) {
      setError(result.error)
      return
    }
    setError(null)
    onSave(result.data)
  }, [onSave, t])

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            {t('save')}
          </Button>
        </div>
        <Toolbar editorRef={editorRef} onExpand={handleExpand} />
      </div>
      <Editor
        height="200px"
        language="yaml"
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
        defaultValue={initialYaml}
        onMount={handleEditorMount}
        onChange={() => setError(null)}
        options={editorOptions}
      />
      {error && (
        <div className="px-3 pb-2">
          <pre className="whitespace-pre-wrap rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </pre>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('edit_yaml')}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="button" size="sm" onClick={handleDialogSave}>
                {t('save')}
              </Button>
            </div>
            <Toolbar editorRef={dialogEditorRef} />
          </div>
          <Editor
            height="60vh"
            language="yaml"
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
            defaultValue={editorRef.current?.getValue() ?? initialYaml}
            onMount={handleDialogEditorMount}
            onChange={() => setError(null)}
            options={editorOptions}
          />
          {error && (
            <div className="px-3 pb-2">
              <pre className="whitespace-pre-wrap rounded-md bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
