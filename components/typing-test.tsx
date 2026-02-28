"use client"

import { useState, useEffect, useRef } from "react"

interface TypingTestProps {
  typedText: string
  onReset: () => void
  onRestartTest: () => void
}

// Common English words for typing test
const WORD_LIST = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
]

const WORDS_COUNT = 30

export function TypingTest({ typedText, onReset, onRestartTest }: TypingTestProps) {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [words, setWords] = useState<string[]>([])
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const isFirstMountRef = useRef(true)

  // Initialize test with random words
  useEffect(() => {
    generateNewTest()
  }, [])

  // Handle restart - generate new words and reset state
  useEffect(() => {
    if (typedText === "") {
      // Skip on first mount
      if (isFirstMountRef.current) {
        isFirstMountRef.current = false
        return
      }

      // This is a restart, generate new words
      generateNewTest()
      setStartTime(null)
      setTestStarted(false)
      setTestCompleted(false)
      setElapsedSeconds(0)
    }
  }, [typedText])

  const generateNewTest = () => {
    const selectedWords: string[] = []
    for (let i = 0; i < WORDS_COUNT; i++) {
      selectedWords.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)])
    }
    setWords(selectedWords)
  }

  // Start timer on first keystroke
  useEffect(() => {
    if (typedText.length > 0 && !startTime && !testStarted) {
      setStartTime(Date.now())
      setTestStarted(true)
    }
  }, [typedText, startTime, testStarted])

  // Check if test is completed (all 30 words typed)
  useEffect(() => {
    if (!testStarted || testCompleted || words.length === 0) return

    const typedWords = typedText.trim().split(/\s+/).filter(w => w.length > 0)
    if (typedWords.length >= WORDS_COUNT) {
      setTestCompleted(true)
    }
  }, [typedText, testStarted, testCompleted, words])

  // Update timer
  useEffect(() => {
    if (!testStarted || !startTime || testCompleted) return

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedSeconds(elapsed)
    }, 100)

    return () => clearInterval(timer)
  }, [testStarted, startTime, testCompleted])

  // Auto-focus input
  useEffect(() => {
    if (!testCompleted && inputRef.current) {
      inputRef.current.focus()
    }
  }, [testCompleted])

  const handleRestart = () => {
    setStartTime(null)
    setTestStarted(false)
    setTestCompleted(false)
    setElapsedSeconds(0)
    generateNewTest()
    onReset()
    onRestartTest()
  }

  // Calculate stats for results
  const calculateStats = () => {
    if (words.length === 0) return { wpm: 0, accuracy: 0, correctChars: 0, incorrectChars: 0, correctWords: 0, wrongWords: 0 }

    const targetText = words.join(" ")
    let correctChars = 0
    let incorrectChars = 0

    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === targetText[i]) {
        correctChars++
      } else {
        incorrectChars++
      }
    }

    // Count correct and wrong words
    const typedWords = typedText.trim().split(/\s+/).filter(w => w.length > 0)
    const targetWords = words
    let correctWords = 0
    let wrongWords = 0

    for (let i = 0; i < typedWords.length; i++) {
      if (typedWords[i] === targetWords[i]) {
        correctWords++
      } else {
        wrongWords++
      }
    }

    // Calculate WPM: (correct characters / 5) / minutes elapsed
    const minutes = elapsedSeconds / 60
    const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0

    // Calculate accuracy
    const totalChars = correctChars + incorrectChars
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0

    return {
      wpm: Math.max(0, wpm),
      accuracy: Math.max(0, accuracy),
      correctChars,
      incorrectChars,
      correctWords,
      wrongWords,
    }
  }

  const stats = testCompleted ? calculateStats() : null
  const targetText = words.join(" ")

  return (
    <div className="absolute top-0 left-0 right-0 w-full flex flex-col items-center pointer-events-none z-50">
      {/* Test Container at Top */}
      <div className="w-[95%] md:w-[90%] max-w-2xl mt-8 pointer-events-auto">
        {!testCompleted && (
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-6 md:p-8 shadow-2xl">
            {/* Word Display */}
            <div className="font-mono text-base md:text-lg leading-relaxed text-white/40 min-h-24 mb-6">
              <div className="flex flex-wrap gap-1">
                {targetText.split("").map((char, idx) => {
                  const isCorrect = typedText[idx] === char
                  const isIncorrect = idx < typedText.length && typedText[idx] !== char
                  const isCurrent = idx === typedText.length

                  return (
                    <span
                      key={idx}
                      className={`transition-colors duration-100 ${
                        isCorrect
                          ? "text-green-400"
                          : isIncorrect
                            ? "text-red-400 bg-red-500/20"
                            : isCurrent
                              ? "text-white bg-white/20 animate-pulse"
                              : "text-white/40"
                      }`}
                    >
                      {char === " " ? "·" : char}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={typedText}
              onChange={() => {}} // Controlled by keyboard-scene
              disabled={testCompleted}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-mono placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-colors"
              placeholder="Type here..."
              autoFocus
            />

            {/* Instructions */}
            <div className="mt-4 text-center text-white/40 text-sm font-mono space-y-1">
              <p>{!testStarted ? "Start typing to begin the test" : `${WORDS_COUNT - Math.max(0, typedText.trim().split(/\s+/).filter(w => w.length > 0).length)} words remaining`}</p>
              <p className="text-xs text-white/20">Press Tab to restart • Enter to submit</p>
            </div>
          </div>
        )}

        {/* Results Panel */}
        {testCompleted && stats && (
          <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-8 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Test Complete!</h2>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <div className="text-white/60 text-xs md:text-sm font-mono uppercase tracking-widest mb-2">WPM</div>
                <div className="text-3xl md:text-4xl font-bold text-cyan-400">{stats.wpm}</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <div className="text-white/60 text-xs md:text-sm font-mono uppercase tracking-widest mb-2">Accuracy</div>
                <div
                  className={`text-3xl md:text-4xl font-bold ${
                    stats.accuracy >= 95 ? "text-green-400" : stats.accuracy >= 80 ? "text-yellow-400" : "text-red-400"
                  }`}
                >
                  {stats.accuracy}%
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <div className="text-white/60 text-xs md:text-sm font-mono uppercase tracking-widest mb-2">Time</div>
                <div className="text-3xl md:text-4xl font-bold text-white">{elapsedSeconds}s</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <div className="text-white/60 text-xs md:text-sm font-mono uppercase tracking-widest mb-2">Correct</div>
                <div className="text-2xl md:text-3xl font-bold text-green-400">{stats.correctChars}</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <div className="text-white/60 text-xs md:text-sm font-mono uppercase tracking-widest mb-2">Errors</div>
                <div className="text-2xl md:text-3xl font-bold text-red-400">{stats.incorrectChars}</div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 md:p-6 border border-white/10 text-center">
                <div className="text-white/60 text-xs md:text-sm font-mono uppercase tracking-widest mb-2">Words</div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stats.correctWords}/{stats.correctWords + stats.wrongWords}
                </div>
              </div>
            </div>

            {/* Restart Button */}
            <div className="text-center">
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm md:text-base font-mono transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
