import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const BlogPost = () => {
  const { slug } = useParams();

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      console.log('Fetching blog post:', slug);
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching blog post:', error);
        throw error;
      }

      console.log('Fetched blog post:', data);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-4">
          <div className="h-12 bg-white/20 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse" />
          <div className="space-y-2 mt-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-white/20 rounded w-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="font-serif text-4xl text-white mb-4">Blog post not found</h1>
      </div>
    );
  }

  // Format the content by splitting it into paragraphs and identifying headers
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Check if the paragraph is a header (ends with a colon)
      if (paragraph.endsWith(':')) {
        return (
          <h2 key={index} className="font-serif text-2xl text-white mt-12 mb-6">
            {paragraph.slice(0, -1)} {/* Remove the colon */}
          </h2>
        );
      }
      
      // Check if it's a subheading (starts with a dash)
      if (paragraph.startsWith('- ')) {
        return (
          <h3 key={index} className="font-serif text-xl text-white/90 mt-8 mb-4">
            {paragraph.slice(2)} {/* Remove the dash and space */}
          </h3>
        );
      }

      // Check if it's a bulleted list (multiple lines starting with -)
      if (paragraph.split('\n').every(line => line.trim().startsWith('-'))) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-3 font-serif text-lg text-white/80 mb-8 pl-6">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="leading-relaxed">
                {item.slice(1).trim()} {/* Remove the dash */}
              </li>
            ))}
          </ul>
        );
      }

      // Check if it's a numbered list (starts with a number followed by a period)
      if (/^\d+\./.test(paragraph)) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <ol key={index} className="list-decimal list-inside space-y-3 font-serif text-lg text-white/80 mb-8 pl-6">
            {items.map((item, itemIndex) => {
              const content = item.replace(/^\d+\.\s*/, ''); // Remove the number and period
              return (
                <li key={itemIndex} className="leading-relaxed">
                  {content}
                </li>
              );
            })}
          </ol>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="font-serif text-lg text-white/80 mb-8 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <article className="prose prose-invert mx-auto">
        <h1 className="font-serif text-4xl mb-8 text-white">{blog.title}</h1>
        <div className="font-serif text-xl mb-16 text-white/70">{blog.excerpt}</div>
        <div className="space-y-4">
          {formatContent(blog.content)}
        </div>
      </article>
    </div>
  );
};

export default BlogPost;