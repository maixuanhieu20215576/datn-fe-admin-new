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
  price: number;
  priceType: "byDay" | "byCourse";
  status: "closed" | "open";
  schedule: ISchedule[];
  classUrl: string;
  thumbnail?: string;
  stringForSearching?: string;
  createdAt?: Date;
  updatedAt?: Date;
  classType: "singleClass" | "classByWeeks";
}
