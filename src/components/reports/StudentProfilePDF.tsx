import React from 'react';
import {
 Document,
 Page,
 Text,
 View,
 StyleSheet,
 Image // <--- Import Image component
} from '@react-pdf/renderer';
import { format as formatDate } from 'date-fns';
// DOMPurify is typically used in a browser/Node environment before passing data.
// For react-pdf itself, you usually pass clean strings/data.
// If you *must* sanitize within this component (less common for PDF generation):
// Ensure 'isomorphic-dompurify' or similar is used if running server-side.
// import DOMPurify from 'isomorphic-dompurify'; // Or 'dompurify' if browser only

// --- Helper function to parse potentially simple HTML-like content ---
// NOTE: This is a simplified parser. Robust HTML-to-PDF requires more advanced libraries.
// It attempts to handle specific bold/italic markers and basic structure.
const parseHtmlContent = (htmlContent: string | null | undefined): { text: string; isBold?: boolean; isItalic?: boolean; isTitle?: boolean }[] => {
 if (!htmlContent) return [];

 // Basic preliminary cleaning (replace common entities and tags that might interfere)
 let cleanedHtml = (htmlContent || '')
  .replace(/ /g, ' ')
  .replace(/<br\s*\/?>/g, '\n')
  .replace(/<\/p>\s*<p>/g, '\n\n') // Treat paragraph tags as double newlines
  .replace(/<p[^>]*>/g, '') // Remove opening p tags
  .replace(/<\/p>/g, '') // Remove closing p tags
  .replace(/<strong>(.*?)<\/strong>/g, '**$1**') // Convert strong/b to markdown bold
  .replace(/<b>(.*?)<\/b>/g, '**$1**')
  .replace(/<em>(.*?)<\/em>/g, '_$1_') // Convert em/i to markdown italic
  .replace(/<i>(.*?)<\/i>/g, '_$1_')
  .replace(/<[^>]*>/g, ''); // Remove any other remaining HTML tags (basic strip)


 // --- Special Handling for potential "Title | Details" structure ---
 // Attempts to identify a specific title format for styling
 const titleMatch = cleanedHtml.match(/^(\*\*?)(.+?Student\s*\|\s*.*?\|.*?)(\*\*?)\n/);
 let lines: { text: string; isBold?: boolean; isItalic?: boolean; isTitle?: boolean }[] = [];
 let remainingContent = cleanedHtml;

 if (titleMatch) {
  const titleText = titleMatch[2].replace(/\*\*/g, '').trim(); // Extract and clean title
  lines.push({ text: titleText, isBold: true, isTitle: true });
  remainingContent = cleanedHtml.replace(titleMatch[0], '').trim(); // Remove title part
 }

 // Process the remaining content (or all content if no title match)
 const paragraphs = remainingContent.split(/\n{2,}/); // Split into paragraphs by double newlines

 paragraphs.forEach(paragraph => {
  if (!paragraph.trim()) return;

  // Split paragraph into lines/segments based on markdown-like markers
  const segments = paragraph.split(/(\*\*.*?\*\*|_.*?_)/g).filter(Boolean);

  segments.forEach(segment => {
   segment = segment.trim(); // Trim each segment
   if (!segment) return;

   let isBold = false;
   let isItalic = false;
   let text = segment;

   if (segment.startsWith('**') && segment.endsWith('**')) {
    isBold = true;
    text = segment.slice(2, -2);
   } else if (segment.startsWith('_') && segment.endsWith('_')) {
    isItalic = true;
    text = segment.slice(1, -1);
   }

   // Check again if the text is empty after removing markers
   if (text.trim()) {
    lines.push({ text: text.trim(), isBold, isItalic });
   }
  });

  // Add a marker or logic here if you want space between paragraphs later
  // For now, RichText component handles marginBottom for Views
 });


 return lines;
};


// --- Rich Text component for rendering parsed content ---
const RichText = ({ content, style }: { content: string; style?: any }) => {
 const textLines = parseHtmlContent(content);
 if (!textLines.length) return null;

 return (
  // Each RichText call creates a block, marginBottom adds space after it
  <View style={{ marginBottom: 8 }}>
   {textLines.map((line, index) => {
    const lineStyle = {
     ...styles.description, // Base style for text within RichText
     ...style, // Override with specific style passed in props
     ...(line.isBold ? { fontWeight: 'bold' } : {}),
     ...(line.isItalic ? { fontStyle: 'italic' } : {}),
     // Add specific title styling if identified by the parser
     ...(line.isTitle ? {
      fontSize: 12, // Example: Make title slightly larger or different
      fontWeight: 'bold',
      marginBottom: 6, // Space after the title line
      color: '#333'
     } : {}),
     // Add a small top margin for lines following a title or for subsequent lines
     marginTop: index > 0 ? (line.isTitle ? 6 : 2) : 0, // Add space before lines, more if it's a title
     // Keep default marginBottom small or zero for lines within the same block
     marginBottom: 2,
    };

    return (
     // Render each line/segment in its own Text component
     <Text key={index} style={lineStyle}>
      {line.text}
     </Text>
    );
   })}
  </View>
 );
};

// --- Define styles ---
const styles = StyleSheet.create({
 page: {
  flexDirection: 'column',
  backgroundColor: '#ffffff',
  paddingBottom: 50, // Increased padding for footer space
  paddingHorizontal: 35, // Slightly more horizontal padding
 },
 header: {
  marginBottom: 20,
  borderBottomWidth: 1.5, // Slightly thicker border
  borderBottomColor: '#800020', // Accent color
  paddingBottom: 10,
 },
 headerContent: {
  flexDirection: 'row',
  justifyContent: 'space-between', // Space items out
  alignItems: 'center', // Vertically align items in the header
  marginBottom: 5,
 },

 // Container for the main header content (Title Image + Subtitle)
 headerCenterContent: {
  flex: 1, // Take up available space
  alignItems: 'center', // Center the items horizontally
 },

 titleLogo: {
  width: 160,
  marginTop: 16,
  marginBottom: 4,
},

 // New style for subtitle and date row
 subtitleDateRow: {
  flexDirection: 'row',          // Arrange children horizontally
  justifyContent: 'space-between', // Push subtitle left, date right
  alignItems: 'flex-end',        // Align vertically to bottom
  marginTop: 5,                  // Add space below the logo row
  paddingHorizontal: 5,          // Optional: Add slight padding
 },

 subtitle: {
  fontSize: 16,
  color: '#800020', // Accent color
  fontWeight: 'bold',
 },
 date: {
  fontSize: 9, // Small font size for date
  color: '#800020', // Accent color

 },
 section: {
  marginBottom: 18, // Increased space between sections
 },
 sectionTitle: {
  fontSize: 14,
  color: '#444444', // Slightly darker subtitle
  fontWeight: 'bold',
  marginBottom: 12, // More space after title
  paddingBottom: 4, // Space for the border
 },
 row: {
  flexDirection: 'row',
  marginBottom: 7, // Increased space between info rows
 },
 label: {
  fontSize: 11,
  color: '#333333',
  fontWeight: 'bold',
  width: '30%', // Fixed width for labels
  marginRight: 5, // Space between label and value
 },
 value: {
  fontSize: 11,
  color: '#000000',
  width: '70%', // Fixed width for values
  flexShrink: 1, // Allow text wrapping if value is long
 },
 // Base style for text rendered via RichText
 description: {
  fontSize: 11,
  color: '#333333',
  lineHeight: 1.4, // Adjust line spacing for readability
  textAlign: 'justify', // Justify description text
 },
 // Style for items within list sections (Applications, Meetings etc.)
 item: {
  marginBottom: 12,
  paddingLeft: 5, // Slight indent for items
 },
 itemTitle: {
  fontSize: 12,
  color: '#000000',
  fontWeight: 'bold',
  marginBottom: 4,
 },
 itemDetail: {
  fontSize: 11,
  color: '#444444',
  marginBottom: 2,
  marginLeft: 10, // Indent details under item title
 },
 footer: {
  position: 'absolute',
  bottom: 20, // Position from bottom
  left: 35, // Match page padding
  right: 35, // Match page padding
  textAlign: 'center',
  fontSize: 9,
  color: '#888888',
  borderTopWidth: 0.5,
  borderTopColor: '#cccccc',
  paddingTop: 5,
 },

});

// --- Define the component props interface ---
interface StudentProfilePDFProps {
 data: {
  student: any; // Consider defining a stricter type for student
  applications?: any[]; // Mark as optional if they might not exist
  meetings?: any[]; // Mark as optional
  pathways?: any[]; // Mark as optional
  documents?: any[]; // Mark as optional
  generatedAt: string | Date; // Allow Date object or string
  sections: string[];
 };
}

// --- Create the PDF document component ---
const StudentProfilePDF: React.FC<StudentProfilePDFProps> = ({ data }) => {
 // Destructure data, providing defaults for potentially missing arrays
 const {
  student,
  applications = [],
  meetings = [],
  pathways = [],
  documents = [],
  generatedAt,
  sections = [] // Default to empty array if sections not provided
 } = data || {}; // Add check for data itself being null/undefined

 // --- Image Paths ---
 // Assumes images are in the 'public/images' folder and served from the root URL '/'
 // Adjust these paths based on your project structure and how static assets are served.

 // *** THIS IS THE PATH FOR YOUR TITLE LOGO ***
 // Ensure 'logo-dark.png' is in 'public/images/' folder of your project
 const titleLogoUrl = "/images/logo-dark.png";

 // Handle potential invalid student data
 if (!student) {
     // Optionally render a message or return null if student data is essential
     return (
         <Document>
             <Page size="A4" style={styles.page}>
                 <Text>Error: Student data is missing.</Text>
             </Page>
         </Document>
     );
 }

 // Format the generation date safely
 const formattedDate = generatedAt
  ? formatDate(new Date(generatedAt), "MMMM d, yyyy 'at' h:mm a")
  : 'N/A';

 return (
  <Document>
   <Page size="A4" style={styles.page}>

    {/* --- Header Section --- */}
    <View style={styles.header}>
     <View style={styles.headerContent}>
      {/* Center Content: Title Logo */}
      <View style={styles.headerCenterContent}>
       {/* *** USE IMAGE INSTEAD OF TEXT *** */}
       <Image
        src={titleLogoUrl}
        style={styles.titleLogo} // Apply the specific logo style
       />
      </View>
     </View>
     {/* Subtitle and Date Row */}
     <View style={styles.subtitleDateRow}>
       <Text style={styles.subtitle}>Student Profile Report</Text>
       <Text style={styles.date}>Generated on: {formattedDate}</Text>
     </View>
    </View>

    {/* --- Student Information Section --- */}
    {sections.includes('profile') && (
     <View style={styles.section}>
      <Text style={styles.sectionTitle}>Student Information</Text>
      <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{student.studentName || 'N/A'}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Student Number:</Text><Text style={styles.value}>{student.studentNumber || 'N/A'}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Category:</Text><Text style={styles.value}>{student.studentCategory || 'N/A'}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Level:</Text><Text style={styles.value}>{student.studentLevel || 'N/A'}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Email:</Text><Text style={styles.value}>{student.studentEmail || student.email || 'N/A'}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Contact:</Text><Text style={styles.value}>{student.studentContactNumber || 'N/A'}</Text></View>
      {student.studentDescription && (
       <>
        <View style={styles.row}><Text style={styles.label}>Description:</Text>
         {/* Wrap RichText in a View to allow label/value layout if needed, */}
         {/* but here it takes full width below the label row */}
        </View>
        {/* Render description using RichText component */}
        <RichText content={student.studentDescription} />
       </>
      )}
     </View>
    )}

    {/* --- Career Pathways Section --- */}
    {sections.includes('pathways') && pathways.length > 0 && (
     <View style={styles.section}>
      <Text style={styles.sectionTitle}>Career Pathways</Text>
      {pathways.map((pathway: any, index: number) => (
       <View key={pathway?.id || `pathway-${index}`} style={styles.item}>
        <Text style={styles.itemTitle}>
         {/* Handle pathway being a string or object */}
         {typeof pathway === 'string' ? pathway : (pathway?.title || `Pathway ${index + 1}`)}
        </Text>
        {/* Render description if pathway is object and has description */}
        {typeof pathway === 'object' && pathway?.description && (
         <RichText content={pathway.description} />
        )}
       </View>
      ))}
     </View>
    )}

    {/* --- Job Applications Section --- */}
    {sections.includes('applications') && applications.length > 0 && (
     <View style={styles.section}>
      <Text style={styles.sectionTitle}>Job Applications</Text>
      {applications.map((app, index) => (
       <View key={app?.id || `app-${index}`} style={styles.item}>
        <Text style={styles.itemTitle}>
         {`${index + 1}. ${app.jobTitle || 'Untitled Job'} - ${app.companyName || 'Unknown Company'}`}
        </Text>
        <Text style={styles.itemDetail}>
         Status: {app.status || 'Unknown'}
        </Text>
        <Text style={styles.itemDetail}>
         Submitted: {app.submittedAt ? formatDate(new Date(app.submittedAt), 'MMMM d, yyyy') : 'N/A'}
        </Text>
       </View>
      ))}
     </View>
    )}

    {/* --- Meetings Section --- */}
    {sections.includes('meetings') && meetings.length > 0 && (
     <View style={styles.section}>
      <Text style={styles.sectionTitle}>Meetings</Text>
      {meetings.map((meeting, index) => (
       <View key={meeting?.id || `meeting-${index}`} style={styles.item}>
        <Text style={styles.itemTitle}>
         {`${index + 1}. ${meeting.meetingTitle || 'Untitled Meeting'}`}
        </Text>
        <Text style={styles.itemDetail}>
         With: {meeting.otherPartyName || 'Unknown'}
        </Text>
        <Text style={styles.itemDetail}>
         Date: {meeting.meetingDate ? formatDate(new Date(meeting.meetingDate), 'MMMM d, yyyy') : 'N/A'}
        </Text>
        <Text style={styles.itemDetail}>
         Status: {meeting.status || 'Unknown'}
        </Text>
       </View>
      ))}
     </View>
    )}

    {/* --- Documents Section --- */}
    {sections.includes('documents') && documents.length > 0 && (
     <View style={styles.section}>
      <Text style={styles.sectionTitle}>Documents</Text>
      {documents.map((doc: any, index: number) => (
       <View key={doc?.id || `doc-${index}`} style={styles.item}>
        <Text style={styles.itemTitle}>
         {doc.stuDocName || doc.title || doc.name || `Document ${index + 1}`}
        </Text>
        <Text style={styles.itemDetail}>
         Type: {doc.stuDocType || doc.type || 'Unknown type'}
        </Text>
       </View>
      ))}
     </View>
    )}

    {/* --- Footer --- */}
    <Text style={styles.footer}>
    © 2025 Guidia. All rights reserved.
    </Text>

   </Page>
  </Document>
 );
};

export default StudentProfilePDF;