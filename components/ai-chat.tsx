'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Trash2, Key, AlertCircle, X, ChevronRight, RefreshCw } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { askAssistant } from '@/app/actions/ai'
import { Culture, Depense, Recette } from '@/lib/types'

interface AIChatProps {
  cultures: Culture[]
  depenses: Depense[]
  recettes: Recette[]
}

interface Message {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: Date
}

export function AIChat({ cultures, depenses, recettes }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Bonjour ! Je suis votre assistant IA Farm Mangane. 🌾\n\nVous pouvez me poser des questions sur les finances et les cultures de votre ferme. Par exemple :\n- *« Combien ai-je eu cette semaine ? »*\n- *« Quelle culture a le record de ventes ? »*",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customApiKey, setCustomApiKey] = useState('')
  const [showKeySetup, setShowKeySetup] = useState(false)
  const [keyInput, setKeyInput] = useState('')

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Load custom API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key')
    if (savedKey) {
      setCustomApiKey(savedKey)
      setKeyInput(savedKey)
    }
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Call server action
    try {
      const history = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }))

      const response = await askAssistant(
        textToSend,
        history,
        { cultures, depenses, recettes },
        customApiKey || undefined
      )

      if (response.error === 'API_KEY_MISSING') {
        setShowKeySetup(true)
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            role: 'model',
            text: "⚠️ Clé API Gemini manquante. Veuillez saisir votre clé API ci-dessous pour pouvoir utiliser l'assistant.",
            timestamp: new Date()
          }
        ])
      } else if (response.error) {
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            role: 'model',
            text: `❌ Erreur : ${response.message}`,
            timestamp: new Date()
          }
        ])
      } else if (response.text) {
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            role: 'model',
            text: response.text,
            timestamp: new Date()
          }
        ])
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'model',
          text: "❌ Une erreur inattendue est survenue.",
          timestamp: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const saveApiKey = () => {
    if (keyInput.trim()) {
      localStorage.setItem('gemini_api_key', keyInput.trim())
      setCustomApiKey(keyInput.trim())
      setShowKeySetup(false)
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'model',
          text: "✅ Clé API configurée avec succès en local ! Vous pouvez maintenant me poser vos questions.",
          timestamp: new Date()
        }
      ])
    } else {
      localStorage.removeItem('gemini_api_key')
      setCustomApiKey('')
      setShowKeySetup(false)
    }
  }

  const clearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: "Historique réinitialisé. Comment puis-je vous aider aujourd'hui ? 🧑‍🌾",
        timestamp: new Date()
      }
    ])
  }

  const presets = [
    { label: "Bilan de cette semaine 📅", query: "Combien ai-je eu cette semaine ?" },
    { label: "Record de ventes 🏆", query: "Quelle culture a le record de ventes ?" },
    { label: "Synthèse des finances 📈", query: "Fais-moi un résumé de mes dépenses, recettes et solde actuel." }
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Floating Action Button (FAB) */}
      <SheetTrigger asChild>
        <button
          className="fixed bottom-[88px] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#2d4a2d] to-[#1e331e] text-white shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 backdrop-blur-md group"
          aria-label="Assistant IA"
        >
          <Bot className="h-6 w-6 text-amber-300" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2d4a2d] to-[#1e331e] text-white shadow-md">
              <Bot className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Assistant IA
              </SheetTitle>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Données de la ferme synchronisées
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 pr-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setShowKeySetup(!showKeySetup)}
              title="Configurer la clé API"
            >
              <Key className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
              onClick={clearHistory}
              title="Effacer la conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* API Key configuration Panel overlay */}
        {showKeySetup && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 transition-all">
            <div className="flex items-start gap-2.5 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                  Clé API IA locale (100% gratuite)
                </p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1 leading-relaxed space-y-1">
                  <span className="block">🚀 <strong>Groq</strong> (recommandé, ultra-rapide) :{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noreferrer"
                      className="underline font-bold text-amber-800 dark:text-amber-100">console.groq.com</a>
                    {' '}→ clé commence par <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1 rounded text-[10px]">gsk_...</code>
                  </span>
                  <span className="block">✨ <strong>Gemini</strong> (Google) :{' '}
                    <a href="https://aistudio.google.com" target="_blank" rel="noreferrer"
                      className="underline font-bold text-amber-800 dark:text-amber-100">aistudio.google.com</a>
                    {' '}→ clé commence par <code className="bg-amber-200/60 dark:bg-amber-900/60 px-1 rounded text-[10px]">AIzaSy...</code>
                  </span>
                </p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1.5">Sauvegardée uniquement dans votre navigateur. Aucune carte bancaire requise.</p>
              </div>
              <button
                onClick={() => setShowKeySetup(false)}
                className="text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="gsk_... ou AIzaSy..."
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                className="h-8 text-xs bg-white dark:bg-slate-900"
              />
              <Button size="sm" className="h-8 bg-[#2d4a2d] text-white hover:bg-[#3d5a3d]" onClick={saveApiKey}>
                Sauver
              </Button>
            </div>
          </div>
        )}

        {/* Message area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mt-1 shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#2d4a2d] to-[#1e331e] text-white rounded-tr-none shadow-md'
                    : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800/80 rounded-tl-none shadow-xs'
                }`}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2d4a2d]/10 dark:bg-[#2d4a2d]/20 text-[#2d4a2d] mt-1 shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5 justify-start">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mt-1 shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800/80 px-4 py-3 bg-white dark:bg-slate-950 shadow-xs">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                  <span>Analyse des données en cours...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion list */}
        {messages.length === 1 && !isLoading && (
          <div className="px-4 py-2 space-y-2 border-t border-slate-200/60 dark:border-slate-800/50 bg-slate-100/50 dark:bg-slate-900/50">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Suggestions rapides
            </p>
            <div className="flex flex-col gap-2">
              {presets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(preset.query)}
                  className="flex items-center justify-between text-left text-xs bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-all font-medium group"
                >
                  <span>{preset.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat input box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSendMessage(input)
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Posez une question..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500/30"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-[#2d4a2d] hover:bg-[#3e643e] text-white h-9 w-9 rounded-xl shadow-md shrink-0 transition-transform active:scale-95"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
