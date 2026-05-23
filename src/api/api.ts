const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
    }

    return data as T;
}

export interface ApiUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    bio: string;
    is_landlord: boolean;
    verified: boolean;
    joinDate: string;
    rating: number;
}

export const authApi = {
    login: (email: string, password: string) =>
        request<{ message: string; user: ApiUser }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (data: { name: string; email: string; password: string; phone?: string }) =>
        request<{ message: string; user: ApiUser }>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    logout: () =>
        request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

    me: () =>
        request<{ user: ApiUser }>('/api/auth/me'),

    updateProfile: (data: { name?: string; bio?: string; phone?: string; avatar_url?: string }) =>
        request<{ message: string; user: ApiUser }>('/api/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

export interface ApiListing {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    city: string;
    district: string;
    address: string;
    image: string;
    gallery: string[];
    rating: number;
    rooms: number;
    roommates: number;
    type: 'apartment' | 'room' | 'studio' | 'house';
    typeRu: string;
    listing_type: string;
    petFriendly: boolean;
    genderPreference: 'any' | 'male' | 'female';
    amenities: string[];
    wifi: boolean;
    parking: boolean;
    floor: number | null;
    total_floors: number | null;
    area_sqm: number | null;
    is_active: boolean;
    review_count: number;
    reviews?: ApiReview[];
    roommates_list?: { id: string; name: string; avatar: string; joined_at: string }[];
    created_at: string;
    ownerId: string;
    owner: {
        id: string;
        name: string;
        avatar: string;
        bio: string;
        phone: string;
        rating: number;
        verified: boolean;
    };
}

export interface ListingsFilters {
    city?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    rooms?: number;
    wifi?: boolean;
    petFriendly?: boolean;
    search?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
    limit?: number;
    offset?: number;
}

export const listingsApi = {
    getAll: (filters: ListingsFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                params.set(k, String(v));
            }
        });
        return request<{ listings: ApiListing[]; pagination: { total: number; limit: number; offset: number } }>(
            `/api/listings?${params}`
        );
    },

    getById: (id: string) =>
        request<ApiListing>(`/api/listings/${id}`),

    create: (data: Partial<ApiListing> & { title: string; price: number }) =>
        request<{ message: string; listing: ApiListing }>('/api/listings', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: Partial<ApiListing>) =>
        request<{ message: string; listing: ApiListing }>(`/api/listings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/api/listings/${id}`, { method: 'DELETE' }),

    join: (id: string) =>
        request<{ message: string }>(`/api/listings/${id}/join`, { method: 'POST' }),

    leave: (id: string) =>
        request<{ message: string }>(`/api/listings/${id}/join`, { method: 'DELETE' }),
};

export interface ApiReview {
    id: string;
    rating: number;
    comment: string;
    date: string;
    user: {
        id: string;
        name: string;
        avatar: string;
        rating: number;
        verified: boolean;
    };
}

export const reviewsApi = {
    getByListing: (listingId: string) =>
        request<{ reviews: ApiReview[] }>(`/api/reviews/listing/${listingId}`),

    create: (data: { listing_id: string | number; rating: number; comment?: string }) =>
        request<{ message: string }>('/api/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<{ message: string }>(`/api/reviews/${id}`, { method: 'DELETE' }),
};

export interface ApiChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: string;
    read: boolean;
    propertyId?: string;
    sender_name?: string;
    sender_avatar?: string;
    listing_title?: string | null;
}

export interface ApiConversation {
    id: string;
    participants: string[];
    propertyId?: string;
    unreadCount: number;
    otherUser: { id: string; name: string; avatar: string };
    listing_title: string | null;
    lastMessage?: ApiChatMessage;
}

export const messagesApi = {
    getConversations: () =>
        request<{ conversations: ApiConversation[] }>('/api/messages/conversations'),

    getWithUser: (userId: string) =>
        request<{ messages: ApiChatMessage[] }>(`/api/messages/${userId}`),

    send: (data: { receiver_id: string | number; content: string; listing_id?: string | number }) =>
        request<{ message: string; data: ApiChatMessage }>('/api/messages', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

export interface ApiNotification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'message' | 'review' | 'favorite' | 'system' | 'price_drop' | 'new_listing';
    targetType?: 'property' | 'chat' | 'profile' | 'review';
    targetId?: string;
    propertyId?: string;
    userId?: string;
    link?: string | null;
}

export const notificationsApi = {
    getAll: () =>
        request<{ notifications: ApiNotification[] }>('/api/notifications'),

    getUnreadCount: () =>
        request<{ count: number }>('/api/notifications/unread-count'),

    markRead: (id: string) =>
        request<{ message: string }>(`/api/notifications/read/${id}`, { method: 'PUT' }),

    markAllRead: () =>
        request<{ message: string }>('/api/notifications/read-all', { method: 'PUT' }),
};

export const favoritesApi = {
    getAll: () =>
        request<{ favorites: ApiListing[] }>('/api/favorites'),

    getIds: () =>
        request<{ ids: string[] }>('/api/favorites/ids'),

    add: (listing_id: string | number) =>
        request<{ message: string }>('/api/favorites', {
            method: 'POST',
            body: JSON.stringify({ listing_id }),
        }),

    remove: (listingId: string | number) =>
        request<{ message: string }>(`/api/favorites/${listingId}`, { method: 'DELETE' }),
};

export interface ApiProfile {
    user: ApiUser;
    listings: ApiListing[];
    reviews_given: {
        id: string;
        rating: number;
        comment: string;
        date: string;
        listing_title: string;
        listing_id: string;
    }[];
    unread_messages: number;
    unread_notifications: number;
}

export const profileApi = {
    getMine: () =>
        request<ApiProfile>('/api/profile'),

    getById: (userId: string) =>
        request<{ user: ApiUser; listings: ApiListing[] }>(`/api/profile/${userId}`),
};