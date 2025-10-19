import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Plus } from "lucide-react";

interface HealthLog {
  id: string;
  type: string;
  value: string;
  timestamp: Date;
}

export function QuickLog() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [logType, setLogType] = useState("");
  const [logValue, setLogValue] = useState("");

  const handleLog = () => {
    if (!logType.trim() || !logValue.trim()) return;

    const newLog: HealthLog = {
      id: Date.now().toString(),
      type: logType,
      value: logValue,
      timestamp: new Date(),
    };

    setLogs([newLog, ...logs]);
    setLogType("");
    setLogValue("");
  };

  return (
    <Card className="glass-panel p-6 space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Activity className="w-5 h-5 text-red-500" />
        Quick Health Log
      </h3>

      <div className="space-y-3">
        <Input
          placeholder="Activity type (e.g., Steps, Water, Calories)..."
          value={logType}
          onChange={(e) => setLogType(e.target.value)}
          className="bg-white/5 border-white/10"
        />
        <Input
          placeholder="Value..."
          value={logValue}
          onChange={(e) => setLogValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLog()}
          className="bg-white/5 border-white/10"
        />
        <Button
          onClick={handleLog}
          className="w-full gradient-health"
          disabled={!logType.trim() || !logValue.trim()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <p className="text-sm text-muted-foreground">No health logs yet</p>
              <p className="text-xs text-muted-foreground mt-1">Log your first activity above</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{log.type}</h4>
                  <span className="text-lg font-semibold text-red-400">
                    {log.value}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {log.timestamp.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
