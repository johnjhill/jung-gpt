import { format } from 'date-fns';

interface DreamContentSectionProps {
  summary: string;
  createdAt: string;
  content: string;
}

export const DreamContentSection = ({ summary, createdAt, content }: DreamContentSectionProps) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <h1 className="text-4xl md:text-5xl font-serif text-white">
          {summary}
        </h1>
        <p className="text-sm text-gray-300">
          {format(new Date(createdAt), 'MMMM d, yyyy')}
        </p>
      </div>
      
      <div className="bg-white/90 rounded-lg p-8 shadow-lg">
        <div className="prose prose-lg max-w-none">
          <section>
            <h2 className="text-2xl font-serif mb-4 text-dream-purple">Dream Content</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
          </section>
        </div>
      </div>
    </div>
  );
};