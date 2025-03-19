export interface Semester {
  id: number;
  schoolYear: number;
  termNumber: number;
  name: string;
  startDate: string;
  examStartDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface CreateSemesterInput {
  schoolYear: number;
  termNumber: number;
  name: string;
  startDate: string;
  examStartDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface UpdateSemesterInput {
  schoolYear?: number;
  termNumber?: number;
  name?: string;
  startDate?: string;
  examStartDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}
