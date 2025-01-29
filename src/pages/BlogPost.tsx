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

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <article className="prose prose-invert mx-auto">
        <h1 className="text-4xl font-serif mb-4">{blog.title}</h1>
        <div className="text-white/70 mb-8">{blog.excerpt}</div>
        <div className="whitespace-pre-line">{blog.content}</div>
      </article>
    </div>
  );
};

export default BlogPost;