import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format as formatDate } from 'date-fns';

interface StudentProfileExcelProps {
  data: {
    student: any;
    applications: any[];
    meetings: any[];
    pathways: any[];
    documents: any[];
    generatedAt: string;
    sections: string[];
  };
  filename?: string;
}

const StudentProfileExcel: React.FC<StudentProfileExcelProps> = ({
  data,
  filename = 'Student_Profile_Report'
}) => {
  const { student, applications, meetings, pathways, documents = [], generatedAt, sections } = data;
  const hasGeneratedFile = useRef(false);

  const generateExcel = () => {
    // Skip if file has already been generated
    if (hasGeneratedFile.current) return;
    hasGeneratedFile.current = true;
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheets for each section
    if (sections.includes('profile')) {
      const studentInfo = [
        ['GUIDIA - Student Profile Report'],
        [`Generated on: ${formatDate(new Date(generatedAt), 'MMMM d, yyyy \'at\' h:mm a')}`],
        [],
        ['Student Information'],
        ['Name', student.studentName || 'N/A'],
        ['Student Number', student.studentNumber || 'N/A'],
        ['Category', student.studentCategory || 'N/A'],
        ['Level', student.studentLevel || 'N/A'],
        ['Email', student.studentEmail || student.email || 'N/A'],
        ['Contact', student.studentContactNumber || 'N/A']
      ];

      if (student.studentDescription) {
        // Clean HTML from description
        const cleanDescription = student.studentDescription
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        studentInfo.push(['Description', cleanDescription]);
      }

      const studentWs = XLSX.utils.aoa_to_sheet(studentInfo);
      XLSX.utils.book_append_sheet(wb, studentWs, 'Student Information');
    }

    // Career pathways worksheet
    if (sections.includes('pathways') && pathways.length > 0) {
      const pathwaysData = [
        ['Career Pathways'],
        [],
        ['Title', 'Description']
      ];

      pathways.forEach((pathway, index) => {
        // Handle different pathway formats
        if (typeof pathway === 'string') {
          // If pathway is just a string
          pathwaysData.push([pathway, '']);
        } else {
          // If pathway is an object
          const title = pathway.title || `Pathway ${index + 1}`;
          let description = '';

          // Handle description which might be HTML
          if (pathway.description) {
            // Simple HTML tag removal for Excel
            description = pathway.description
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
          }

          pathwaysData.push([title, description]);
        }
      });

      const pathwaysWs = XLSX.utils.aoa_to_sheet(pathwaysData);
      XLSX.utils.book_append_sheet(wb, pathwaysWs, 'Career Pathways');
    }

    // Applications worksheet
    if (sections.includes('applications') && applications.length > 0) {
      const applicationsData = [
        ['Job Applications'],
        [],
        ['Job Title', 'Company', 'Status', 'Submitted Date']
      ];

      applications.forEach(app => {
        applicationsData.push([
          app.jobTitle || 'Untitled Job',
          app.companyName || 'Unknown Company',
          app.status || 'Unknown',
          formatDate(new Date(app.submittedAt), 'yyyy-MM-dd')
        ]);
      });

      const applicationsWs = XLSX.utils.aoa_to_sheet(applicationsData);
      XLSX.utils.book_append_sheet(wb, applicationsWs, 'Job Applications');
    }

    // Meetings worksheet
    if (sections.includes('meetings') && meetings.length > 0) {
      const meetingsData = [
        ['Meetings'],
        [],
        ['Meeting Title', 'With', 'Date', 'Status']
      ];

      meetings.forEach(meeting => {
        meetingsData.push([
          meeting.meetingTitle || 'Untitled Meeting',
          meeting.otherPartyName || 'Unknown',
          formatDate(new Date(meeting.meetingDate), 'yyyy-MM-dd'),
          meeting.status || 'Unknown'
        ]);
      });

      const meetingsWs = XLSX.utils.aoa_to_sheet(meetingsData);
      XLSX.utils.book_append_sheet(wb, meetingsWs, 'Meetings');
    }

    // Documents worksheet
    if (sections.includes('documents') && documents.length > 0) {
      const documentsData = [
        ['Documents'],
        [],
        ['Document Name', 'Document Type']
      ];

      documents.forEach(doc => {
        documentsData.push([
          doc.stuDocName || doc.title || doc.name || 'Untitled Document',
          doc.stuDocType || doc.type || 'Unknown type'
        ]);
      });

      const documentsWs = XLSX.utils.aoa_to_sheet(documentsData);
      XLSX.utils.book_append_sheet(wb, documentsWs, 'Documents');
    }

    // Generate Excel file
    const excelFilename = `${filename}.xlsx`;

    // Convert workbook to binary
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

    // Convert binary to ArrayBuffer
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }

    // Create Blob and save file
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    saveAs(blob, excelFilename);
  };

  // Generate Excel file on component mount
  React.useEffect(() => {
    generateExcel();
  }, []);

  return null; // This component doesn't render anything
};

export default StudentProfileExcel;
