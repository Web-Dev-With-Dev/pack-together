export interface User {
  name: string;
  email: string;
  profilePicture: string;
  stats: {
    tripsCreated: number;
    itemsPacked: number;
    peopleCollaborated: number;
  };
} 