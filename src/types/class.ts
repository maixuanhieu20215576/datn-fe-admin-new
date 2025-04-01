import { constants } from "../constant";

export interface ISchedule {
  date?: string;
  timeFrom: string;
  timeTo: string;
}

export interface IClass {
  _id?: string;
  className: string;
  teacherId: string;
  teacherName: string;
  maxStudent?: number;
  currentStudent: number;
  language: string;
  level?: typeof constants.courseLevel[number];
  price: number;
  priceType: typeof constants.priceType[number];
  status: "closed" | "open";
  schedule: ISchedule[];
  classUrl: string;
  classType: typeof constants.classType[number];
  thumbnail?: string;
  stringForSearching?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 