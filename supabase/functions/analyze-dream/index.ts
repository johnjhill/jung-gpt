import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { dream } = await req.json()
    console.log('Analyzing dream:', dream)
    
    const systemPrompt = `You are a dream analysis expert specializing in Jungian psychology. 
      Analyze dreams by identifying archetypal elements, symbolism, and their potential psychological significance. 
      First provide an initial analysis, then ask 3 thoughtful follow-up questions to help the dreamer explore deeper meanings.
      Format your response as a JSON object with two fields:
      1. initialAnalysis: your initial interpretation
      2. questions: an array of 3 follow-up questions`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dream }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`)
    }

    const data = await response.json()
    console.log('OpenAI response:', data)

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response format:', data)
      throw new Error('Invalid response format from OpenAI')
    }

    const content = data.choices[0].message.content
    console.log('Raw content from OpenAI:', content)

    try {
      const parsedContent = JSON.parse(content)
      console.log('Successfully parsed content:', parsedContent)

      if (!parsedContent.initialAnalysis || !Array.isArray(parsedContent.questions)) {
        throw new Error('Response missing required fields')
      }

      return new Response(JSON.stringify(parsedContent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      throw new Error('Failed to parse OpenAI response as JSON')
    }
  } catch (error) {
    console.error('Error in analyze-dream function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during dream analysis'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})