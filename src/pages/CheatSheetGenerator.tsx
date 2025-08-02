import React, { useState, useRef } from 'react'
import { FileText, Upload, Sparkles, Copy, Check, BookOpen, Brain, Zap, Download, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import API from '../API'

const CheatSheetGenerator: React.FC = () => {
  const [notes, setNotes] = useState('')
  const [topic, setTopic] = useState('')
  const [generatedSheet, setGeneratedSheet] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [cheatSheetData, setCheatSheetData] = useState<any[]>([])
  const contentRef = useRef<HTMLDivElement>(null)

  let aiType = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";
  let prompt = "Task: You are given a block of text. Summarize its content into a JSON object with a maximum of 10 array items, each representing one distinct definition or concept. No explanation or your thought process needed in your response. Just the JSON output. Output Format: {\"definitions\": [{\"term\": \"string\", \"definition\":\"string\"} // .. up to 10 items ] } Input Text to Summarize: Text to summarise:" 
  const [inputValue, setInputValue] = useState('');

  const onCheatSheetCreation = async () => {
    setLoading(true)
    setGeneratedSheet('')
    
    console.log(inputValue);
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

      // Store the data for PDF generation
      setCheatSheetData(resultJSON.definitions || [])

      document.getElementById("cheatsheetSection").style.display = "block";
      document.getElementById("uploadSection").style.display = 'none';

      for(let i = 0; i < 8; i++) {
        const header = document.getElementById("header" + (i + 1));
        const definition = document.getElementById("def" + (i + 1));

        const currentResult = resultJSON['definitions'][i];

        console.log(currentResult);

        if (currentResult && header && definition) {
          const currentResultHeader = currentResult['term'];
          const currentResultDef = currentResult['definition'];

          header.textContent = currentResultHeader;
          definition.textContent = currentResultDef;
        }
      }
    }
    setLoading(false)
  }

  const handleDownloadPdf = async () => {
    if (!cheatSheetData.length) return
    
    setDownloadingPdf(true)
    try {
      // Create a temporary div for PDF content
      const pdfContent = document.createElement('div')
      pdfContent.style.width = '210mm'
      pdfContent.style.padding = '20mm'
      pdfContent.style.backgroundColor = 'white'
      pdfContent.style.fontFamily = 'Arial, sans-serif'
      pdfContent.style.fontSize = '12px'
      pdfContent.style.lineHeight = '1.4'
      pdfContent.style.position = 'absolute'
      pdfContent.style.left = '-9999px'
      pdfContent.style.top = '0'
      
      // Create the PDF content
      let htmlContent = `
        <div style="margin-bottom: 20px;">
          <h1 style="font-size: 24px; color: #1f2937; margin-bottom: 10px; text-align: center;">Cheat Sheet</h1>
          <hr style="border: 1px solid #e5e7eb; margin-bottom: 20px;">
        </div>
      `
      
      // Add definitions in a compact format
      cheatSheetData.forEach((item, index) => {
        htmlContent += `
          <div style="margin-bottom: 15px; page-break-inside: avoid;">
            <h3 style="font-size: 14px; font-weight: bold; color: #374151; margin-bottom: 5px;">${item.term}</h3>
            <p style="font-size: 11px; color: #6b7280; margin: 0; line-height: 1.3;">${item.definition}</p>
          </div>
        `
      })
      
      pdfContent.innerHTML = htmlContent
      document.body.appendChild(pdfContent)
      
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 210 * 2.83465, // A4 width in pixels
        height: 297 * 2.83465 // A4 height in pixels
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Ensure it fits on one page
      const scale = Math.min(1, pdfHeight / imgHeight)
      const finalWidth = imgWidth * scale
      const finalHeight = imgHeight * scale
      const x = (pdfWidth - finalWidth) / 2
      const y = (pdfHeight - finalHeight) / 2
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
      pdf.save('cheat-sheet.pdf')
      
      document.body.removeChild(pdfContent)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const handleCopy = () => {
    const textToCopy = cheatSheetData.map(item => 
      `${item.term}:\n${item.definition}\n`
    ).join('\n')
    
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBack = () => {
    document.getElementById("cheatsheetSection").style.display = "none";
    document.getElementById("uploadSection").style.display = 'block';
    setCheatSheetData([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div id="uploadSection">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Professional Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Cheat Sheet Generator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your study notes into organized, AI-powered cheat sheets that fit perfectly on one page
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Input Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center">
                    <Upload className="h-6 w-6 text-white mr-3" />
                    <h2 className="text-xl font-semibold text-white">Upload Your Notes</h2>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="space-y-6">
                    {/* Notes Text Area */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        Paste Your Study Notes
                      </label>
                      <div className="relative">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full h-80 px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none text-base leading-relaxed transition-all duration-200"
                          placeholder="Copy and paste your entire study notes, lecture notes, or any study material here. The AI will analyze and organize it into a comprehensive cheat sheet."
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded-full">
                          {notes.length} characters
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-3 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                        Tip: Include all your notes, definitions, formulas, and key concepts for best results
                      </p>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={onCheatSheetCreation}
                      disabled={!notes.trim() || loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                          <span className="text-white">{processingStep || 'Generating...'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-6 w-6 mr-3" />
                          Generate Cheat Sheet
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-white mr-2" />
                    <h3 className="text-lg font-semibold text-white">How to Use</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Find Your Topic</h4>
                        <p className="text-sm text-gray-600">Choose a subject you want to study (Chemistry, Biology, etc.)</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Paste Your Notes</h4>
                        <p className="text-sm text-gray-600">Copy and paste all your study materials into the text area</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Generate & Download</h4>
                        <p className="text-sm text-gray-600">Click generate and download as PDF to your study documents</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm font-semibold text-blue-900">Pro Tip</span>
                    </div>
                    <p className="text-xs text-blue-800">
                      The more comprehensive your notes are, the better your cheat sheet will be. Include examples, formulas, and key concepts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="cheatsheetSection" style={{display: "none"}}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Professional Header with Actions */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="h-8 w-8 text-white mr-4" />
                  <div>
                    <h1 className="text-2xl font-bold text-white">Generated Cheat Sheet</h1>
                    <p className="text-blue-100 text-sm mt-1">Your AI-powered study companion is ready</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center px-4 py-2 text-sm bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="flex items-center px-4 py-2 text-sm bg-white text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200 font-semibold"
                    title="Download as PDF"
                  >
                    {downloadingPdf ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {downloadingPdf ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={handleBack}
                    className="flex items-center px-4 py-2 text-sm bg-white bg-opacity-20 text-white hover:bg-opacity-30 rounded-lg transition-all duration-200 backdrop-blur-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm">Your cheat sheet has been generated with AI analysis. You can copy the content or download it as a PDF that fits perfectly on one A4 page.</p>
            </div>
          </div>

          {/* Generated Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Generated cards with professional styling */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="header1"></h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed" id="def1"></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="header2"></h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed" id="def2"></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="header3"></h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed" id="def3"></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="header4"></h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed" id="def4"></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="header5"></h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed" id="def5"></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="header6"></h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed" id="def6"></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="header7"></h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed" id="def7"></p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900" id="header8"></h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 leading-relaxed" id="def8"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheatSheetGenerator
