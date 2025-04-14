import React from 'react';
import { Star } from 'lucide-react';

interface MeetingFeedback {
  feedbackID: number;
  meetingID: number;
  userID: number;
  username: string;
  meetingSuccessRating: number;
  platformExperienceRating: number;
  comments?: string;
  createdAt: string;
}

interface MeetingFeedbackDisplayProps {
  feedback: MeetingFeedback[];
}

export function MeetingFeedbackDisplay({ feedback }: MeetingFeedbackDisplayProps) {
  if (!feedback || feedback.length === 0) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Star rating display component
  const StarRatingDisplay = ({ rating }: { rating: number }) => {
    // Ensure rating is a valid number between 1-5
    const validRating = typeof rating === 'number' && !isNaN(rating)
      ? Math.min(Math.max(Math.round(rating), 0), 5)
      : 0;

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= validRating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-medium">Meeting Feedback</h3>

      {feedback.map((item) => {
        // Skip rendering if the item is missing critical data
        if (!item || typeof item !== 'object' || !item.feedbackID) {
          console.error('Invalid feedback item:', item);
          return null;
        }

        return (
          <div key={item.feedbackID} className="border rounded-md p-4 bg-secondary/30">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">{item.username || 'Anonymous User'}</div>
              <div className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Meeting Success</div>
                <StarRatingDisplay rating={item.meetingSuccessRating} />
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Platform Experience</div>
                <StarRatingDisplay rating={item.platformExperienceRating} />
              </div>

              {item.comments && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Comments</div>
                  <p className="text-sm">{item.comments}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
