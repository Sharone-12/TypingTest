import type { UIMessage } from "ai"
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation"
import { Message as MessageComponent } from "@/components/ai-elements/message"
import { cn } from "@/lib/utils"

interface TerminalProps {
  capsLock: boolean
  messages: UIMessage[]
  status: string
  typedText: string
}

export function Terminal({ capsLock, messages, status, typedText }: TerminalProps) {
  return (
    <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-3xl z-10 pointer-events-none">
      <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-4 md:p-6 shadow-2xl text-green-400 font-mono min-h-[200px] md:min-h-[250px] max-h-[35vh] md:max-h-[40vh] overflow-hidden flex flex-col transition-all duration-300 pointer-events-auto">
        <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="flex items-center gap-4">
            {capsLock && <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest">CAPS</span>}
            <span className="text-xs text-white/30 uppercase tracking-widest">Terminal Output</span>
          </div>
        </div>

        <Conversation className="flex-1 terminal-scrollbar overflow-y-auto">
          <ConversationContent className="p-0 gap-2">
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                from={message.role}
                className={cn("max-w-full justify-start", message.role === "user" ? "text-green-400" : "text-blue-400")}
              >
                <div className="flex gap-2">
                  <span className="opacity-50 select-none">{message.role === "user" ? ">" : "#"}</span>
                  <div className="whitespace-pre-wrap break-all">
                    {message.parts &&
                      message.parts.map((part: any, i: number) => {
                        switch (part.type) {
                          case "text":
                            return <span key={`${message.id}-${i}`}>{part.text}</span>
                          default:
                            return null
                        }
                      })}
                  </div>
                </div>
              </MessageComponent>
            ))}

            {/* Current input line */}
            <div className="text-green-400 flex gap-2">
              <span className="opacity-70 select-none">{"> "}</span>
              <span>
                {typedText}
                <span className="inline-block w-2 h-4 bg-green-400 ml-1 align-middle cursor-blink" />
              </span>
            </div>

            {status === "streaming" && <div className="text-blue-400 opacity-50 text-sm">Processing...</div>}
          </ConversationContent>
        </Conversation>
      </div>
    </div>
  )
}
