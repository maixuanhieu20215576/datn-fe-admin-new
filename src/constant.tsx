export const constants: {
    userRole: { admin: string; student: string; teacher: string };
    language: { vietnamese: string; english: string };
    commitment: { fulltime: string; parttime: string };
    applicationStatus: { all: string; pending: string; approved: string; rejected: string };
  } = {
    userRole: {
      admin: "admin",
      student: "student",
      teacher: "teacher",
    },
    language: {
      vietnamese: "vi",
      english: "en",
    },
    commitment: {
      fulltime: "Full-time",
      parttime: "Part-time",
    },
    applicationStatus: {
      all: "All",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    },
  };
  