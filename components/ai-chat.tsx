"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, Loader2, MessageCircle, History, Plus, Trash2, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
  analysisType?: string
  chatSessionId?: string
  attachments?: Array<{
    name: string
    type: string
    size: number
    url?: string
  }>
}

interface ChatSession {
  id: string
  title: string
  createdAt: Date
  lastMessage: string
  messageCount: number
}

interface AIChatProps {
  userId: number
}

export function AIChat({ userId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysisType, setAnalysisType] = useState("general")
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchChatSessions()
    initializeNewSession()
  }, [userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const initializeNewSession = () => {
    const newSessionId = `session_${Date.now()}_${userId}`
    setCurrentSessionId(newSessionId)
    setMessages([])
  }

  const fetchChatSessions = async () => {
    try {
      const response = await fetch(`/api/chat/sessions?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setChatSessions(data)
      }
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error)
    }
  }

  const loadChatSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history?userId=${userId}&sessionId=${sessionId}`)
      const data = await response.json()
      const formattedMessages = data.map((msg: any, idx: number) => ({
        id: `${msg.id}`,
        text: msg.message,
        sender: msg.sender as "user" | "assistant",
        timestamp: new Date(msg.created_at),
        analysisType: msg.analysis_type,
        chatSessionId: msg.chat_session_id,
      }))
      setMessages(formattedMessages)
      setCurrentSessionId(sessionId)
      setHistoryOpen(false)
    } catch (error) {
      console.error("Failed to load chat session:", error)
    }
  }

  const createNewChat = () => {
    initializeNewSession()
    setHistoryOpen(false)
    setSelectedFiles([])
  }

  const deleteChatSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: "DELETE",
      })
      setChatSessions(chatSessions.filter((s) => s.id !== sessionId))
      if (currentSessionId === sessionId) {
        createNewChat()
      }
    } catch (error) {
      console.error("Failed to delete chat session:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      // Limit to 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      return true
    })
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)) // Max 5 files
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/history?userId=${userId}`)
      const data = await response.json()
      const formattedMessages = data.map((msg: any, idx: number) => ({
        id: `${msg.id}`,
        text: msg.message,
        sender: msg.sender as "user" | "assistant",
        timestamp: new Date(msg.created_at),
        analysisType: msg.analysis_type,
      }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error("Failed to fetch chat history:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && selectedFiles.length === 0) || loading) return

    // Prepare attachments info
    const attachments = selectedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
    }))

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input || (selectedFiles.length > 0 ? `[Uploaded ${selectedFiles.length} file(s)]` : ""),
      sender: "user",
      timestamp: new Date(),
      analysisType,
      chatSessionId: currentSessionId,
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = input
    const currentFiles = [...selectedFiles]
    setInput("")
    setSelectedFiles([])
    setLoading(true)

    try {
      // Prepare form data for file upload
      const formData = new FormData()
      formData.append('userId', userId.toString())
      formData.append('message', messageText)
      formData.append('analysisType', analysisType)
      formData.append('chatSessionId', currentSessionId)
      
      // Add files to form data
      currentFiles.forEach((file, index) => {
        formData.append(`file${index}`, file)
      })
      formData.append('fileCount', currentFiles.length.toString())

      const response = await fetch("/api/chat/send", {
        method: "POST",
        body: formData, // Send as FormData instead of JSON
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API Response:", data)

      if (data.success && data.aiResponse) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.aiResponse,
          sender: "assistant",
          timestamp: new Date(),
          analysisType,
          chatSessionId: currentSessionId,
        }
        setMessages((prev) => [...prev, assistantMessage])
        
        // Refresh chat sessions to show the updated chat
        fetchChatSessions()
      } else {
        console.error("No AI response in data:", data)
        // Add error message to chat
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn't process your message. Please try again.",
          sender: "assistant",
          timestamp: new Date(),
          analysisType,
          chatSessionId: currentSessionId,
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error connecting to the AI. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
        analysisType,
        chatSessionId: currentSessionId,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Uparjon AI Assistant</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={createNewChat}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
            <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Chat History
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                  <SheetDescription>View and manage your previous conversations</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {chatSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No chat history yet</p>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => loadChatSession(session.id)}
                        className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                          currentSessionId === session.id ? "bg-accent border-primary" : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{session.title}</p>
                            <p className="text-xs text-muted-foreground truncate mt-1">{session.lastMessage}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(session.createdAt).toLocaleDateString()} • {session.messageCount} messages
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteChatSession(session.id, e)}
                            className="shrink-0 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <p className="text-sm text-foreground/60">
          Get instant analysis and recommendations for your workplace challenges
        </p>
      </div>

      {/* Analysis Type Selector */}
      <div className="px-6 py-3 border-b border-border bg-card/50 flex gap-2 flex-wrap">
        {["general", "performance", "team", "strategy", "conflict"].map((type) => (
          <Button
            key={type}
            variant={analysisType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setAnalysisType(type)}
            className={`capitalize ${
              analysisType === type
                ? "bg-primary text-background hover:bg-primary-dark"
                : "border-border text-foreground hover:bg-card"
            }`}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-primary/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Start a Conversation</h3>
            <p className="text-foreground/60 max-w-md">
              Ask me about workplace challenges, team dynamics, performance strategies, or any career-related questions.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <Card
                  className={`max-w-md px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-primary text-background border-primary"
                      : "bg-card border-border text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  
                  {/* Show attachments if any */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 text-xs p-2 rounded ${
                            message.sender === "user"
                              ? "bg-background/10 text-background"
                              : "bg-accent text-foreground"
                          }`}
                        >
                          {getFileIcon(file.type)}
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="shrink-0">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p
                    className={`text-xs mt-2 ${message.sender === "user" ? "text-background/70" : "text-foreground/50"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </Card>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="bg-card border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <p className="text-sm text-foreground">Analyzing...</p>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-6 border-t border-border bg-card">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-accent border border-border rounded-lg text-sm"
              >
                {getFileIcon(file.type)}
                <span className="truncate max-w-[150px]">{file.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-1 text-destructive hover:text-destructive/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
          />
          
          {/* File upload button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || selectedFiles.length >= 5}
            className="shrink-0"
            title="Upload files (max 5, 10MB each)"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedFiles.length > 0 ? "Add a message with your files..." : "Ask me about your workplace..."}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || (!input.trim() && selectedFiles.length === 0)}
            className="bg-primary text-background hover:bg-primary-dark disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  )
}
