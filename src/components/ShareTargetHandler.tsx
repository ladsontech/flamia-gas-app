
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface SharedContent {
  title?: string;
  text?: string;
  url?: string;
  source?: string;
}

const ShareTargetHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);

  useEffect(() => {
    // Check if this is a share target navigation
    const source = searchParams.get("source");
    if (source === "share-target") {
      const title = searchParams.get("title") || undefined;
      const text = searchParams.get("text") || undefined;
      const url = searchParams.get("shareUrl") || undefined;

      if (title || text || url) {
        setSharedContent({ title, text, url, source });
        
        // Notify the user that content was shared
        toast({
          title: "Content Shared",
          description: "Content was shared with Flamia Gas",
        });
      }
    }
  }, [searchParams, toast]);

  const handleProcessShare = () => {
    // Process the shared content based on what was shared
    if (sharedContent?.text?.includes("order") || sharedContent?.title?.includes("order")) {
      // If it looks like an order, go to order page
      navigate("/order");
    } else if (sharedContent?.text?.includes("refill") || sharedContent?.title?.includes("refill")) {
      // If it looks like a refill request, go to refill page
      navigate("/refill");
    } else {
      // Default to home page
      navigate("/");
    }
    
    // Clear the shared content
    setSharedContent(null);
  };

  const handleDismiss = () => {
    setSharedContent(null);
  };

  if (!sharedContent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Shared Content
          </CardTitle>
          <CardDescription>
            Content has been shared with Flamia Gas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sharedContent.title && (
            <div>
              <h3 className="text-sm font-medium">Title:</h3>
              <p className="text-sm mt-1">{sharedContent.title}</p>
            </div>
          )}
          {sharedContent.text && (
            <div>
              <h3 className="text-sm font-medium">Text:</h3>
              <p className="text-sm mt-1">{sharedContent.text}</p>
            </div>
          )}
          {sharedContent.url && (
            <div>
              <h3 className="text-sm font-medium">URL:</h3>
              <p className="text-sm mt-1 break-all">{sharedContent.url}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleDismiss}>Dismiss</Button>
          <Button onClick={handleProcessShare}>Process Share</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShareTargetHandler;
