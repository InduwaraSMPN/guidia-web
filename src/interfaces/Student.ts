export interface Student {
  studentID: number;
  studentNumber: string;
  studentName: string;
  studentTitle: string;
  studentContactNumber: string;
  studentEmail: string;
  studentDescription: string;
  studentProfileImagePath: string;
  userID: number;
  studentCategory: string;
  studentLevel: string;
  studentCareerPathways: string[];
  studentDocuments: {
    stuDocURL: string;
    stuDocName: string;
    stuDocType: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
