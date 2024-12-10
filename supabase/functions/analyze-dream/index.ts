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
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a dream analysis expert specializing in Jungian psychology. 
            Analyze dreams by identifying archetypal elements, symbolism, and their potential psychological significance. 
            First provide an initial analysis, then ask 3 thoughtful follow-up questions to help the dreamer explore deeper meanings.
            Format your response as a JSON object with two fields:
            1. initialAnalysis: your initial interpretation
            2. questions: an array of 3 follow-up questions`
          },
          { role: 'user', content: dream }
        ],
      }),
    })

    const data = await response.json()
    console.log('OpenAI response:', data)

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI')
    }

    const result = data.choices[0].message.content
    console.log('Parsed result:', result)
    
    // Parse the JSON string from the AI response
    const analysis = JSON.parse(result)

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})