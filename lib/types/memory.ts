export type UserMemory = {
  id: string;
  content: string;
  category: "preference" | "project" | "technical" | "profile" | "other";
  createdAt: string;
  updatedAt: string;
};
