export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    prenom: string;
    nom: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  prenom: string;
  nom: string;
  telephone?: string;
}
