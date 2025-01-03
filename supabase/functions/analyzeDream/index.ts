import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.28.0"
import { corsHeaders } from '../_shared/cors.ts'

const openai = new OpenAI()

console.log("Edge Function 'analyzeDream' initialized")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Received request:", req.method)
    const { dreamContent, previousAnalysis, userAnswers, skipQuestions } = await req.json()
    console.log("Request payload:", { dreamContent, previousAnalysis, userAnswers, skipQuestions })

    if (!dreamContent && !previousAnalysis) {
      throw new Error('No content provided')
    }

    let prompt
    if (previousAnalysis) {
      if (skipQuestions) {
        prompt = `Based on the initial dream analysis: "${previousAnalysis.initialAnalysis}"
        
        Please provide a comprehensive final analysis of the dream, focusing on the key themes 
        and symbols identified in the initial analysis. Since the user chose to skip the follow-up 
        questions, provide your best interpretation based on the available information.`
      } else {
        prompt = `Based on the initial dream analysis: "${previousAnalysis.initialAnalysis}" 
        and the user's answers to the following questions:
        ${previousAnalysis.questions.map((q: string, i: number) => 
          `Q: ${q}\nA: ${userAnswers[i] || 'No answer provided'}`
        ).join('\n')}
        
        Please provide a comprehensive final analysis of the dream, incorporating psychological insights 
        and potential symbolic meanings. Focus on how the dreamer's responses add depth to the interpretation.`
      }
    } else {
      prompt = `As a dream analyst, please analyze this dream: "${dreamContent}"
      
      Provide an initial interpretation and generate 3 thoughtful follow-up questions that will help 
      understand the dream's deeper meaning. Format the response as a JSON object with two fields:
      1. "initialAnalysis": your initial interpretation
      2. "questions": an array of 3 follow-up questions`
    }

    console.log("Sending prompt to OpenAI:", prompt)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    })

    const result = completion.choices[0].message.content
    console.log("Received response from OpenAI:", result)

    return new Response(
      JSON.stringify(previousAnalysis ? { finalAnalysis: result } : JSON.parse(result)),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error("Error in analyzeDream function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})