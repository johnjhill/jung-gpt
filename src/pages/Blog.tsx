import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Blog = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      console.log('Fetching blogs...');
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        throw error;
      }

      console.log('Fetched blogs:', data);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-serif text-white mb-8">Dream Symbol Guide</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="h-8 bg-white/20 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-white/20 rounded w-full animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-serif text-white mb-8">Dream Symbol Guide</h1>
      <div className="space-y-4">
        {blogs?.map((blog) => (
          <Link key={blog.id} to={`/blog/${blog.slug}`}>
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">{blog.title}</CardTitle>
                <CardDescription className="text-white/70">{blog.excerpt}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;