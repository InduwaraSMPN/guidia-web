import axios from 'axios';

const API_URL = '/api/reports';

export interface StudentProfileReportParams {
  studentID: number;
  format: 'pdf' | 'excel' | 'csv';
  sections: string[];
}

export const reportsService = {
  /**
   * Generate a student profile report
   * @param params Report parameters
   * @returns Report data
   */
  generateStudentProfileReport: async (params: StudentProfileReportParams) => {
    try {
      const token = localStorage.getItem('token');

      // Get the report data from the API
      const response = await axios.post(`${API_URL}/student-profile`, params, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Return the data for client-side report generation
      return response.data;
    } catch (error) {
      console.error('Error generating student profile report:', error);
      throw error;
    }
  },

  /**
   * Get all students for report generation
   * @returns List of students
   */
  getStudents: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching students for reports:', error);
      throw error;
    }
  },
};

export default reportsService;
