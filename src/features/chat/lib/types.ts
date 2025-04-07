export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: string;
  isCurrentUser: boolean;
}

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
}
