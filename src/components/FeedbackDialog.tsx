import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackDialogProps {
  open: boolean;
  recipeName: string;
  onSubmit: (comment: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function FeedbackDialog({
  open,
  recipeName,
  onSubmit,
  onCancel,
  isLoading = false,
}: FeedbackDialogProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(comment);
    setComment("");
  };

  const handleCancel = () => {
    setComment("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Why did you skip this?</DialogTitle>
          <DialogDescription>
            Help us learn your taste by sharing why you weren't interested in "{recipeName}"
          </DialogDescription>
        </DialogHeader>

        <Textarea
          placeholder="e.g., 'Not a fan of this ingredient', 'Too expensive', 'Looks complicated'..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-24 resize-none"
        />

        <p className="text-xs text-muted-foreground">Optional but helpful!</p>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Skip feedback
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !comment.trim()}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
