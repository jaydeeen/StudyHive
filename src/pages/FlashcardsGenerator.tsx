import React, { useState } from 'react'
import { CreditCard, Upload, Sparkles, ChevronLeft, ChevronRight, RotateCw, Play, Pause } from 'lucide-react'
import API from '../API'

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: 'easy' | 'medium' | 'hard'
}

let firstTime = true;



const FlashcardsGenerator: React.FC = () => {
  const [lectureContent, setLectureContent] = useState('')
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [notes, setNotes] = useState('')

  let aiType = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";
  let prompt = "Task: You are given a block of text. Summarize its content into a JSON object with a maximum of 10 array items, each representing one distinct definition or concept. No explanation or your thought process needed in your response. Just the JSON output. Output Format: {\"definitions\": [{\"term\": \"string\", \"definition\":\"string\"} // .. up to 10 items ] } Input Text to Summarize: Text to summarise:" 
 
  
  let flashCards = [];

  const onFlashCardGeneration = async () => {

    setLoading(true)
 
    

      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: 'POST',
      body: JSON.stringify({model: aiType, messages: [{role: "user", content: prompt + notes}]}),
      headers: {'Content-Type': 'application/json', 'Authorization': "Bearer " + API} 
    });

   

    if (!response.ok) 
    { 
        console.error("Error12332131");
    }
    else {

      const result = await response.json();
      const resultJSON = JSON.parse(result['choices'][0]['message']['content']);
      console.log(resultJSON)

      handleGenerate();


        for(let i = 0; i < 8; i++) {

          const currentResult = resultJSON['definitions'][i];


          const currentResultHeader = currentResult['term'];
          const currentResultDef = currentResult['definition'];

      
          
          flashCards.push({
            id: i + 1,
            front: currentResultDef,
            back: currentResultHeader,
            difficulty: 'easy'
          });



        }


    }
  }

  const handleGenerate = async () => {
    setLoading(true)

    setIsFlipped(true);
    // Simulate AI processing
    setTimeout(() => {
      const mockFlashcards: Flashcard[] = [
        {
          id: '1',
          front: 'What is the Pythagorean theorem?',
          back: 'dsada',
          difficulty: 'easy'
        },
        {
          id: '2',
          front: 'Define photosynthesis',
          back: 'The process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.',
          difficulty: 'medium'
        },
        {
          id: '3',
          front: 'What are the three laws of thermodynamics?',
          back: '1. Energy cannot be created or destroyed\n2. Entropy always increases\n3. Absolute zero cannot be reached',
          difficulty: 'hard'
        },
        {
          id: '4',
          front: 'What is machine learning?',
          back: 'A type of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
          difficulty: 'medium'
        },
        {
          id: '5',
          front: 'Define GDP',
          back: 'Gross Domestic Product - the total monetary value of all finished goods and services produced within a country during a specific period.',
          difficulty: 'easy'
        }
      ]
      setFlashcards(flashCards)
      setCurrentIndex(0)
      setIsFlipped(false)
      setLoading(false)
    }, 2000)
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const currentCard = flashcards[currentIndex]

  React.useEffect(() => {
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <CreditCard className="h-6 w-6 mr-2 text-primary-600" />
          Flashcards Generator
        </h1>
        <p className="text-gray-600">Convert your lecture recordings and notes into interactive flashcards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Lecture Material</h2>
          
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Paste Your Notes Here
                  </label>
                  <div className="relative">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-base"
                      placeholder="Copy and paste your entire study notes, lecture notes, or any study material here. The AI will analyze and organize it into a comprehensive cheat sheet."
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {notes.length} characters
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Tip: Include all your notes, definitions, formulas, and key concepts
                  </p>
                </div>
                <br></br>
                <button
              onClick={onFlashCardGeneration}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Flashcards
                </>
              )}
            </button>
        </div>

        {/* Flashcard Display */}
        <div className="bg-white rounded-xl shadow-sm p-6" onClick={(e) => {
   

          if(firstTime) {
            firstTime = false;
              document.getElementById("front-text").textContent = currentCard.front;

              console.log(currentCard)
          }
   console.log(isFlipped)
          if(isFlipped) {
            document.getElementById("back-text").textContent = currentCard.front;

            console.log(currentCard.front)
          }
          else {
            document.getElementById("back-text").textContent = currentCard.back;
            console.log(currentCard.back)
          }
           }} >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {flashcards.length > 0 ? `Card ${currentIndex + 1} of ${flashcards.length}` : 'Flashcards'}
            </h2>
            {flashcards.length > 0 && (
              <button
                onClick={() => setAutoPlay(!autoPlay)}
                className={`p-2 rounded-lg transition-colors ${
                  autoPlay ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {autoPlay ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            )}
          </div>

          {flashcards.length > 0 ? (
            <div className="space-y-4">
              {/* Flashcard */}
              <div
                className="relative h-64 cursor-pointer preserve-3d transition-transform duration-500"
                // style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden">
                  <div className={`h-full rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg ${
                    currentCard.difficulty === 'easy' ? 'bg-green-50 border-2 border-green-200' :
                    currentCard.difficulty === 'medium' ? 'bg-yellow-50 border-2 border-yellow-200' :
                    'bg-red-50 border-2 border-red-200'
                  }`}>
                    <p className="text-xl font-medium text-gray-900" id="front-text">{currentCard.front}</p>
                    <RotateCw className="h-5 w-5 text-gray-400 mt-4" />
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden">
                  <div className="h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-8 flex items-center justify-center text-center shadow-lg">
                    <p className="text-lg text-white whitespace-pre-line" id="back-text">{currentCard.back}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      }}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.length - 1}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              {/* Difficulty Legend */}
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-green-200 rounded-full mr-2" />
                  <span className="text-gray-600">Easy</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-yellow-200 rounded-full mr-2" />
                  <span className="text-gray-600">Medium</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-red-200 rounded-full mr-2" />
                  <span className="text-gray-600">Hard</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your flashcards will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlashcardsGenerator
