import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Sparkles } from "lucide-react";

interface Topic {
  id: string;
  name: string;
  summary: string;
  timestamp: Date;
}

export function TopicSummarizer() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicName, setTopicName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSummarize = async () => {
    if (!topicName.trim()) return;

    setIsGenerating(true);

    // Simulate AI summary generation
    setTimeout(() => {
      const newTopic: Topic = {
        id: Date.now().toString(),
        name: topicName,
        summary: `AI-generated summary for ${topicName}. Key concepts and important points would appear here.`,
        timestamp: new Date(),
      };

      setTopics([newTopic, ...topics]);
      setTopicName("");
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card className="glass-panel p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-500" />
        Topic Summarizer
      </h3>

      <div className="space-y-3">
        <Input
          placeholder="Enter topic to summarize..."
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSummarize()}
          className="bg-white/5 border-white/10"
        />
        <Button
          onClick={handleSummarize}
          className="w-full gradient-learn"
          disabled={!topicName.trim() || isGenerating}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Summarize with AI"}
        </Button>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <p className="text-sm text-muted-foreground">No topics summarized yet</p>
              <p className="text-xs text-muted-foreground mt-1">Enter a topic above to get AI summary</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 transition-colors"
              >
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  {topic.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {topic.summary}
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {topic.timestamp.toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
