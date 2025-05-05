import React, { useState, useEffect } from 'react';
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
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  autoDownload?: boolean;
}

const StudentProfileReport: React.FC<StudentProfileReportProps> = ({
  data,
  onDownloadStart,
  onDownloadComplete,
  autoDownload = false
}) => {
  const [showExcel, setShowExcel] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const pdfButtonRef = React.useRef<HTMLButtonElement>(null);

  const { student, format: reportFormat } = data;
  const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmmss');
  const filename = `Student_Profile_${student.studentName?.replace(/\s+/g, '_') || 'Report'}_${timestamp}`;

  // Handle auto-download for Excel and CSV
  useEffect(() => {
    if (autoDownload) {
      if (reportFormat === 'excel') {
        if (onDownloadStart) onDownloadStart();
        setShowExcel(true);
      } else if (reportFormat === 'csv') {
        if (onDownloadStart) onDownloadStart();
        setShowCSV(true);
      }
    }
  }, [autoDownload, reportFormat, onDownloadStart]);

  // Notify when Excel or CSV download completes
  useEffect(() => {
    if (showExcel || showCSV) {
      // Small delay to ensure the file generation has started
      const timer = setTimeout(() => {
        if (onDownloadComplete) onDownloadComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showExcel, showCSV, onDownloadComplete]);

  // Auto-click the PDF download button when it's ready and autoDownload is true
  useEffect(() => {
    if (autoDownload && reportFormat === 'pdf' && pdfReady && pdfButtonRef.current) {
      // Simulate a click on the PDF download button
      // Use a small delay to ensure the PDF is fully prepared
      const timer = setTimeout(() => {
        if (pdfButtonRef.current) {
          pdfButtonRef.current.click();
          console.log('Auto-clicking PDF download button');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoDownload, reportFormat, pdfReady]);

  // Render the appropriate report component based on format
  if (reportFormat === 'pdf') {
    return (
      <PDFDownloadLink
        document={<StudentProfilePDF data={data} />}
        fileName={`${filename}.pdf`}
        style={{ textDecoration: 'none' }}
      >
        {({ loading }) => {
          // When PDF is ready and autoDownload is true, notify and set pdfReady
          if (autoDownload && !loading && !pdfReady) {
            if (onDownloadStart) onDownloadStart();
            // Set pdfReady to true which will trigger the useEffect to click the button
            setTimeout(() => {
              setPdfReady(true);
            }, 50);
          }

          return (
            <Button
              ref={pdfButtonRef}
              disabled={loading}
              onClick={() => {
                if (!loading) {
                  if (onDownloadStart) onDownloadStart();
                  // Notify download complete after a small delay
                  setTimeout(() => {
                    if (onDownloadComplete) onDownloadComplete();
                  }, 500);
                }
              }}
            >
              {loading ? 'Preparing PDF...' : 'Download PDF'}
              <Download className="ml-2 h-4 w-4" />
            </Button>
          );
        }}
      </PDFDownloadLink>
    );
  } else if (reportFormat === 'excel') {
    return (
      <>
        <Button
          onClick={() => {
            if (onDownloadStart) onDownloadStart();
            setShowExcel(true);
          }}
        >
          Download Excel
          <Download className="ml-2 h-4 w-4" />
        </Button>
        {showExcel && <StudentProfileExcel data={data} filename={filename} />}
      </>
    );
  } else if (reportFormat === 'csv') {
    return (
      <>
        <Button
          onClick={() => {
            if (onDownloadStart) onDownloadStart();
            setShowCSV(true);
          }}
        >
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
