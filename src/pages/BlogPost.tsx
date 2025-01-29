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
        <h1 className="text-4xl font-serif text-white mb-4">Blog post not found</h1>
      </div>
    );
  }

  // Format the content by splitting it into paragraphs and identifying headers
  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      // Check if the paragraph is a header (ends with a colon)
      if (paragraph.endsWith(':')) {
        return (
          <h2 key={index} className="text-2xl font-serif text-white mt-8 mb-4">
            {paragraph.slice(0, -1)} {/* Remove the colon */}
          </h2>
        );
      }
      
      // Check if it's a subheading (starts with a dash)
      if (paragraph.startsWith('- ')) {
        return (
          <h3 key={index} className="text-xl font-serif text-white/90 mt-6 mb-3">
            {paragraph.slice(2)} {/* Remove the dash and space */}
          </h3>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="text-white/80 mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <article className="prose prose-invert prose-lg mx-auto">
        <h1 className="text-4xl font-serif mb-6 text-white">{blog.title}</h1>
        <div className="text-white/70 text-xl mb-12 font-serif">{blog.excerpt}</div>
        <div className="space-y-2">
          {formatContent(blog.content)}
        </div>
      </article>
    </div>
  );
};

export default BlogPost;