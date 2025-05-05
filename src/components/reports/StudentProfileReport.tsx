import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import StudentProfilePDF from './StudentProfilePDF';
import StudentProfileExcel from './StudentProfileExcel';
import StudentProfileCSV from './StudentProfileCSV';
import { format as formatDate } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface StudentProfileReportProps {
  data: {
    student: any;
    applications: any[];
    meetings: any[];
    pathways: any[];
    generatedAt: string;
    format: string;
    sections: string[];
  };
}

const StudentProfileReport: React.FC<StudentProfileReportProps> = ({ data }) => {
  const [showExcel, setShowExcel] = useState(false);
  const [showCSV, setShowCSV] = useState(false);

  const { student, format: reportFormat } = data;
  const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmmss');
  const filename = `Student_Profile_${student.studentName?.replace(/\s+/g, '_') || 'Report'}_${timestamp}`;

  // Render the appropriate report component based on format
  if (reportFormat === 'pdf') {
    return (
      <PDFDownloadLink
        document={<StudentProfilePDF data={data} />}
        fileName={`${filename}.pdf`}
        style={{ textDecoration: 'none' }}
      >
        {({ blob, url, loading, error }) => (
          <Button disabled={loading}>
            {loading ? 'Preparing PDF...' : 'Download PDF'}
            <Download className="ml-2 h-4 w-4" />
          </Button>
        )}
      </PDFDownloadLink>
    );
  } else if (reportFormat === 'excel') {
    return (
      <>
        <Button onClick={() => setShowExcel(true)}>
          Download Excel
          <Download className="ml-2 h-4 w-4" />
        </Button>
        {showExcel && <StudentProfileExcel data={data} filename={filename} />}
      </>
    );
  } else if (reportFormat === 'csv') {
    return (
      <>
        <Button onClick={() => setShowCSV(true)}>
          Download CSV
          <Download className="ml-2 h-4 w-4" />
        </Button>
        {showCSV && <StudentProfileCSV data={data} filename={filename} />}
      </>
    );
  }

  return null;
};

export default StudentProfileReport;
