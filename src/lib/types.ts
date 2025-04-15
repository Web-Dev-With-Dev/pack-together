export type Item = {
  id: string;
  name: string;
  category: string;
  assignedTo: string;
  isPacked: boolean;
  quantity: number;
  notes?: string;
};

export type Person = {
  id: string;
  name: string;
  itemCount: number;
  packedCount: number;
};

export type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  people: Person[];
  items: Item[];
  categories: string[];
  transportation: string;
};
