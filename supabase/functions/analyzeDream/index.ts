import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.28.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const openai = new OpenAI()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { dreamContent, previousAnalysis, userAnswers } = await req.json()

    if (!dreamContent && !previousAnalysis) {
      throw new Error('No content provided')
    }

    let prompt
    if (previousAnalysis && userAnswers) {
      // Generate final analysis based on previous analysis and user answers
      prompt = `Based on the initial dream analysis: "${previousAnalysis.initialAnalysis}" 
      and the user's answers to the following questions:
      ${previousAnalysis.questions.map((q: string, i: number) => 
        `Q: ${q}\nA: ${userAnswers[i] || 'No answer provided'}`
      ).join('\n')}
      
      Please provide a comprehensive final analysis of the dream, incorporating psychological insights 
      and potential symbolic meanings. Focus on how the dreamer's responses add depth to the interpretation.`
    } else {
      // Initial dream analysis
      prompt = `As a dream analyst, please analyze this dream: "${dreamContent}"
      
      Provide an initial interpretation and generate 3 thoughtful follow-up questions that will help 
      understand the dream's deeper meaning. Format the response as a JSON object with two fields:
      1. "initialAnalysis": your initial interpretation
      2. "questions": an array of 3 follow-up questions`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    })

    const result = completion.choices[0].message.content

    return new Response(
      JSON.stringify(previousAnalysis && userAnswers ? { finalAnalysis: result } : JSON.parse(result)),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})