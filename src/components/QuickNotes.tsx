import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Save, Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
}

export function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      timestamp: new Date(),
    };

    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <Card className="glass-panel p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Plus className="w-5 h-5 text-blue-500" />
        Quick Notes
      </h3>

      <div className="space-y-3">
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white/5 border-white/10"
        />
        <Textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-white/5 border-white/10 min-h-[100px]"
        />
        <Button
          onClick={handleSave}
          className="w-full gradient-learn"
          disabled={!title.trim() || !content.trim()}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Note
        </Button>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <p className="text-sm text-muted-foreground">No notes yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first note above</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{note.title}</h4>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(note.id)}
                    className="h-6 w-6 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {note.content}
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {note.timestamp.toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
