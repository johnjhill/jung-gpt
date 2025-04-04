import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const DreamJournalInfo = () => {
  return (
    <Card className="bg-white/90 p-6 shadow-lg">
      <h2 className="text-2xl font-serif mb-4 text-gray-800">About Dream Analysis</h2>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is">
          <AccordionTrigger className="text-lg font-medium">What is Dream Analysis?</AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed">
            Dream analysis is a method of psychological interpretation that helps uncover the hidden meanings and messages in our dreams. This app uses principles from Jungian psychology to analyze your dreams and provide meaningful insights into your subconscious mind.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="jungian">
          <AccordionTrigger className="text-lg font-medium">Jungian Dream Analysis</AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed">
            Carl Jung believed that dreams are a window into the unconscious mind, revealing universal symbols and archetypes that can help us understand ourselves better. Our analysis combines Jungian principles with modern psychological insights to help you explore the deeper meaning of your dreams.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="how-it-works">
          <AccordionTrigger className="text-lg font-medium">How Does It Work?</AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed">
            <ol className="list-decimal list-inside space-y-2">
              <li>Record your dream in detail using the editor below</li>
              <li>Our AI analyzes your dream using Jungian principles</li>
              <li>Answer follow-up questions to deepen the analysis</li>
              <li>Receive a comprehensive interpretation of your dream</li>
              <li>Track patterns and insights in your dream journal</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tiers">
          <AccordionTrigger className="text-lg font-medium">Free vs Premium Features</AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Free Tier Features:</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Limited monthly dream analyses</li>
                  <li>Basic dream journaling</li>
                  <li>Initial AI interpretation</li>
                  <li>Access to dream symbol library</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Premium Features:</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Unlimited dream analyses</li>
                  <li>Advanced pattern recognition</li>
                  <li>Detailed follow-up questions</li>
                  <li>Comprehensive final analysis</li>
                  <li>Personal dream trends insights</li>
                  <li>Priority support</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};