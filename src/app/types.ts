export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image: string;
  rating: number;
  rooms?: number;
  roommates?: number;
  type?: 'apartment' | 'room' | 'studio' | 'house';
  typeRu?: string;
  amenities?: string[];
  petFriendly?: boolean;
  genderPreference?: 'any' | 'male' | 'female';
  reviews?: Review[];
  gallery?: string[];
  owner: User;
  ownerId?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  verified: boolean;
  bio?: string;
  joinDate?: string;
}

export interface Review {
  id: string;
  user: User;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
  propertyId?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  propertyId?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'message' | 'review' | 'favorite' | 'system' | 'price_drop' | 'new_listing';
  targetId?: string;
  targetType?: 'property' | 'chat' | 'profile' | 'review';
  propertyId?: string;
  userId?: string;
}

export interface Filters {
  priceRange: [number, number];
  rooms?: number;
  rating?: number;
  location?: string;
  type?: string;
  petFriendly?: boolean;
  genderPreference?: string;
}
