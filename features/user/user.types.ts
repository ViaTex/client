export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  name?: string; // Alias for fullName
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
