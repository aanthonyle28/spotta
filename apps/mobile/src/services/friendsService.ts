// Mock service for friends training data
export interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
}

// Mock data for Phase 1 implementation with circle avatars
const mockFriendsTraining: Friend[] = [
  { id: '1', name: 'Alex', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Sarah', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Mike', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
];

export const friendsService = {
  getCurrentlyTraining: (): Promise<Friend[]> => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockFriendsTraining);
      }, 100);
    });
  },

  // Mock method for future use
  getFriendsCount: (): Promise<number> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockFriendsTraining.length);
      }, 50);
    });
  },
};