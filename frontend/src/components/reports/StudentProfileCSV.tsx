import React, { useRef } from 'react';
import { saveAs } from 'file-saver';
import { format as formatDate } from 'date-fns';

interface StudentProfileCSVProps {
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

const StudentProfileCSV: React.FC<StudentProfileCSVProps> = ({
  data,
  filename = 'Student_Profile_Report'
}) => {
  const { student, applications, meetings, pathways, documents = [], generatedAt, sections } = data;
  const hasGeneratedFile = useRef(false);

  const generateCSV = () => {
    // Skip if file has already been generated
    if (hasGeneratedFile.current) return;
    hasGeneratedFile.current = true;
    // Create CSV data
    const csvData = [];

    // Add header
    csvData.push(['GUIDIA - Student Profile Report']);
    csvData.push([`Generated on: ${formatDate(new Date(generatedAt), 'MMMM d, yyyy \'at\' h:mm a')}`]);
    csvData.push([]);

    // Add student information
    if (sections.includes('profile')) {
      csvData.push(['Student Information']);
      csvData.push(['Name', student.studentName || 'N/A']);
      csvData.push(['Student Number', student.studentNumber || 'N/A']);
      csvData.push(['Category', student.studentCategory || 'N/A']);
      csvData.push(['Level', student.studentLevel || 'N/A']);
      csvData.push(['Email', student.studentEmail || student.email || 'N/A']);
      csvData.push(['Contact', student.studentContactNumber || 'N/A']);

      if (student.studentDescription) {
        // Clean HTML from description
        const cleanDescription = student.studentDescription
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        csvData.push(['Description', cleanDescription]);
      }

      csvData.push([]);
    }

    // Add career pathways
    if (sections.includes('pathways') && pathways.length > 0) {
      csvData.push(['Career Pathways']);
      csvData.push(['Title', 'Description']);

      pathways.forEach((pathway, index) => {
        // Handle different pathway formats
        if (typeof pathway === 'string') {
          // If pathway is just a string
          csvData.push([pathway, '']);
        } else {
          // If pathway is an object
          const title = pathway.title || `Pathway ${index + 1}`;
          let description = '';

          // Handle description which might be HTML
          if (pathway.description) {
            // Simple HTML tag removal for CSV
            description = pathway.description
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
          }

          csvData.push([title, description]);
        }
      });

      csvData.push([]);
    }

    // Add applications
    if (sections.includes('applications') && applications.length > 0) {
      csvData.push(['Job Applications']);
      csvData.push(['Job Title', 'Company', 'Status', 'Submitted Date']);

      applications.forEach(app => {
        csvData.push([
          app.jobTitle || 'Untitled Job',
          app.companyName || 'Unknown Company',
          app.status || 'Unknown',
          formatDate(new Date(app.submittedAt), 'yyyy-MM-dd')
        ]);
      });

      csvData.push([]);
    }

    // Add meetings
    if (sections.includes('meetings') && meetings.length > 0) {
      csvData.push(['Meetings']);
      csvData.push(['Meeting Title', 'With', 'Date', 'Status']);

      meetings.forEach(meeting => {
        csvData.push([
          meeting.meetingTitle || 'Untitled Meeting',
          meeting.otherPartyName || 'Unknown',
          formatDate(new Date(meeting.meetingDate), 'yyyy-MM-dd'),
          meeting.status || 'Unknown'
        ]);
      });

      csvData.push([]);
    }

    // Add documents
    if (sections.includes('documents') && documents.length > 0) {
      csvData.push(['Documents']);
      csvData.push(['Document Name', 'Document Type']);

      documents.forEach(doc => {
        csvData.push([
          doc.stuDocName || doc.title || doc.name || 'Untitled Document',
          doc.stuDocType || doc.type || 'Unknown type'
        ]);
      });
    }

    // Convert array to CSV string
    let csvString = '';
    csvData.forEach(row => {
      csvString += row.map(cell => {
        // Escape quotes and wrap in quotes if needed
        if (cell === null || cell === undefined) {
          return '';
        }
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',') + '\n';
    });

    // Generate CSV file
    const csvFilename = `${filename}.csv`;

    // Create Blob and save file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, csvFilename);
  };

  // Generate CSV file on component mount
  React.useEffect(() => {
    generateCSV();
  }, []);

  return null; // This component doesn't render anything
};

export default StudentProfileCSV;
