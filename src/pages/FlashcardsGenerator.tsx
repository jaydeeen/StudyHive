import React, { useState, useEffect } from 'react'
import { CreditCard, Upload, Sparkles, ChevronLeft, ChevronRight, RotateCw, Play, Pause, Eye, EyeOff, Shuffle, Download, Copy, Check } from 'lucide-react'
import API from '../API'

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const FlashcardsGenerator: React.FC = () => {
  const [lectureContent, setLectureContent] = useState('')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [notes, setNotes] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)

  let aiType = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";
  let prompt = "Task: You are given a block of text. Summarize its content into a JSON object with a maximum of 10 array items, each representing one distinct definition or concept. No explanation or your thought process needed in your response. Just the JSON output. Output Format: {\"definitions\": [{\"term\": \"string\", \"definition\":\"string\"} // .. up to 10 items ] } Input Text to Summarize: Text to summarise:" 
 
  const onFlashCardGeneration = async () => {
    setLoading(true)
    
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: 'POST',
      body: JSON.stringify({model: aiType, messages: [{role: "user", content: prompt + notes}]}),
      headers: {'Content-Type': 'application/json', 'Authorization': "Bearer " + API} 
    });

    if (!response.ok) { 
      console.error("Error12332131");
    } else {
      const result = await response.json();
      const resultJSON = JSON.parse(result['choices'][0]['message']['content']);
      console.log(resultJSON)

      const generatedFlashcards: Flashcard[] = [];
      
      for(let i = 0; i < 8; i++) {
        const currentResult = resultJSON['definitions'][i];
        if (currentResult) {
          const currentResultHeader = currentResult['term'];
          const currentResultDef = currentResult['definition'];
          
          generatedFlashcards.push({
            id: (i + 1).toString(),
            front: currentResultHeader,
            back: currentResultDef,
            difficulty: 'easy'
          });
        }
      }

      setFlashcards(generatedFlashcards)
      setCurrentIndex(0)
      setIsFlipped(false)
      setShowAnswer(false)
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setFlashcards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowAnswer(false)
    setIsShuffled(true)
  }

  const handleCopyFlashcards = () => {
    const flashcardText = flashcards.map((card, index) => 
      `Card ${index + 1}:\nQuestion: ${card.front}\nAnswer: ${card.back}\n`
    ).join('\n')
    
    navigator.clipboard.writeText(flashcardText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentCard = flashcards[currentIndex]

  useEffect(() => {
    if (autoPlay && flashcards.length > 0) {
      const interval = setInterval(() => {
        if (isFlipped) {
          handleNext()
        } else {
          setIsFlipped(true)
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [autoPlay, isFlipped, currentIndex, flashcards.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Flashcard Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform your study notes into interactive flashcards with AI-powered content analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center">
                  <Upload className="h-6 w-6 text-white mr-3" />
                  <h2 className="text-xl font-semibold text-white">Upload Your Notes</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                      Paste Your Study Material
                    </label>
                    <div className="relative">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-80 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none text-base leading-relaxed transition-all duration-200"
                        placeholder="Copy and paste your lecture notes, study materials, or any content you want to convert into flashcards. The AI will analyze and create interactive flashcards for you."
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded-full">
                        {notes.length} characters
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                      Tip: Include definitions, concepts, and key terms for best results
                    </p>
                  </div>

                  <button
                    onClick={onFlashCardGeneration}
                    disabled={!notes.trim() || loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                        <span className="text-white">Generating Flashcards...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6 mr-3" />
                        Generate Flashcards
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            {flashcards.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Flashcard Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{flashcards.length}</div>
                    <div className="text-sm text-gray-600">Total Cards</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{currentIndex + 1}</div>
                    <div className="text-sm text-gray-600">Current Card</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Flashcard Display */}
          <div className="space-y-6">
            {flashcards.length > 0 ? (
              <>
                {/* Controls */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Card {currentIndex + 1} of {flashcards.length}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleShuffle}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Shuffle cards"
                      >
                        <Shuffle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setAutoPlay(!autoPlay)}
                        className={`p-2 rounded-lg transition-colors ${
                          autoPlay ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        title={autoPlay ? 'Pause autoplay' : 'Start autoplay'}
                      >
                        {autoPlay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={handleCopyFlashcards}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Copy all flashcards"
                      >
                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div className="flex space-x-2">
                      {flashcards.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentIndex(index)
                            setIsFlipped(false)
                            setShowAnswer(false)
                          }}
                          className={`h-2 w-3 rounded-full transition-all duration-300 ${
                            index === currentIndex ? 'bg-blue-600 w-6' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNext}
                      disabled={currentIndex === flashcards.length - 1}
                      className="p-3 rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Flashcard */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <div
                    className="relative h-96 cursor-pointer perspective-1000"
                    onClick={() => {
                      setIsFlipped(!isFlipped)
                      setShowAnswer(!showAnswer)
                    }}
                  >
                    {/* Front */}
                    <div 
                      className={`absolute inset-0 backface-hidden transition-transform duration-700 ease-in-out ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      <div className="h-full rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200">
                        <div className="mb-4">
                          <CreditCard className="h-8 w-8 text-blue-600 mx-auto" />
                        </div>
                        <p className="text-2xl font-semibold text-gray-900 leading-relaxed">
                          {currentCard.front}
                        </p>
                        <div className="mt-6 flex items-center text-blue-600">
                          <Eye className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">Click to reveal answer</span>
                        </div>
                      </div>
                    </div>

                    {/* Back */}
                    <div 
                      className={`absolute inset-0 backface-hidden rotate-y-180 transition-transform duration-700 ease-in-out ${
                        isFlipped ? 'rotate-y-0' : ''
                      }`}
                    >
                      <div className="h-full rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg bg-gradient-to-br from-purple-500 to-blue-600">
                        <div className="mb-4">
                          <EyeOff className="h-8 w-8 text-white mx-auto" />
                        </div>
                        <p className="text-xl text-white leading-relaxed whitespace-pre-line">
                          {currentCard.back}
                        </p>
                        <div className="mt-6 flex items-center text-purple-200">
                          <RotateCw className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">Click to see question</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate Flashcards</h3>
                <p className="text-gray-600 mb-6">Paste your study material and click generate to create interactive flashcards</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-powered content analysis</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlashcardsGenerator
