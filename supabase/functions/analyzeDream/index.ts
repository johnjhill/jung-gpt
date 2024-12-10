import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@4.16.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received request to analyzeDream function');
    const openai = new OpenAIApi(new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    }));

    const { dreamContent, previousAnalysis, userAnswers, skipQuestions } = await req.json();
    console.log('Request payload:', { dreamContent, previousAnalysis, skipQuestions });

    let prompt;
    if (!previousAnalysis) {
      // Initial analysis prompt
      prompt = `Analyze this dream and provide your interpretation. Return your response in JSON format with two fields:
        1. "initialAnalysis": A thoughtful paragraph analyzing the dream's meaning
        2. "questions": An array of 3 follow-up questions that would help deepen the analysis
        
        Dream: "${dreamContent}"`;
    } else if (skipQuestions) {
      // Final analysis without answers
      prompt = `Based on this initial dream analysis, provide a final, comprehensive interpretation that captures the essence of the dream's meaning. Make it personal and insightful.

        Initial Analysis: "${previousAnalysis.initialAnalysis}"
        Dream Content: "${dreamContent}"`;
    } else {
      // Final analysis with answers
      const questionsAndAnswers = previousAnalysis.questions
        .map((q: string, i: number) => `Q: ${q}\nA: ${userAnswers[i]}`)
        .join('\n\n');

      prompt = `Based on the initial dream analysis and the user's responses to follow-up questions, provide a final, comprehensive interpretation that captures the essence of the dream's meaning. Make it personal and insightful.

        Initial Analysis: "${previousAnalysis.initialAnalysis}"
        
        Follow-up Discussion:
        ${questionsAndAnswers}
        
        Dream Content: "${dreamContent}"`;
    }

    console.log('Sending prompt to OpenAI:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an expert dream analyst, skilled at interpreting dreams and their symbolic meanings. If asked to provide JSON, ensure your response is valid JSON." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    console.log('Received response from OpenAI:', result);

    // If this is the initial analysis, parse the response as JSON
    let response;
    if (!previousAnalysis) {
      try {
        response = JSON.parse(result);
      } catch (error) {
        console.error('Error parsing OpenAI response as JSON:', error);
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      // For final analysis, format the text with proper paragraphs
      const formattedText = result
        .split('\n')
        .filter(line => line.trim() !== '')
        .join('\n\n');
      response = { finalAnalysis: formattedText };
    }

    return new Response(JSON.stringify(response), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
    });
  } catch (error) {
    console.error('Error in analyzeDream function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});