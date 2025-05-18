import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Path
} from '@react-pdf/renderer';
import { format as formatDate } from 'date-fns';

// --- Interfaces for TypeScript type safety ---
interface StudentData {
  studentName?: string;
  studentNumber?: string;
  studentCategory?: string;
  studentLevel?: string;
  studentEmail?: string;
  email?: string;
  studentContactNumber?: string;
  studentDescription?: string;
}

interface ApplicationData {
  id?: string;
  jobTitle?: string;
  companyName?: string;
  status?: string;
  submittedAt?: string | Date;
  deadline?: string | Date;
  notes?: string;
}

interface MeetingData {
  id?: string;
  meetingTitle?: string;
  status?: string;
  otherPartyName?: string;
  meetingDate?: string | Date;
  meetingTime?: string;
  location?: string;
  notes?: string;
}

interface DocumentData {
  id?: string;
  stuDocName?: string;
  title?: string;
  name?: string;
  stuDocType?: string;
  type?: string;
  uploadDate?: string | Date;
}

interface PathwayData {
  id?: string;
  title?: string;
}

interface StudentProfilePDFProps {
  data: {
    student: StudentData;
    applications?: ApplicationData[];
    meetings?: MeetingData[];
    pathways?: (PathwayData | string)[];
    documents?: DocumentData[];
    generatedAt: string | Date;
    sections: string[];
  };
}

interface RichTextLine {
  text: string;
  isBold?: boolean;
  isItalic?: boolean;
  isTitle?: boolean;
}

// --- Enhanced HTML content parser with more comprehensive handling ---
const parseHtmlContent = (htmlContent: string | null | undefined): RichTextLine[] => {
  if (!htmlContent) return [];

  // Enhanced cleaning with more HTML tag support
  const cleanedHtml = (htmlContent || '')
    .replace(/ /g, ' ')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/p>\s*<p>/g, '\n\n')
    .replace(/<p[^>]*>/g, '')
    .replace(/<\/p>/g, '')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '_$1_')
    .replace(/<i>(.*?)<\/i>/g, '_$1_')
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, '**$1**\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/g, '$1')
    .replace(/<li[^>]*>(.*?)<\/li>/g, '• $1\n')
    .replace(/<[^>]*>/g, '');

  // Check for common title formats in student descriptions
  // This handles formats like "Undergraduate Student | Management | University of X"
  const titleMatch = cleanedHtml.match(/^(\*\*?)(.+?(Student|Undergraduate|Graduate|Postgraduate)\s*\|\s*.*?)(\*\*?)\n/i);
  const lines: RichTextLine[] = [];

  let remainingContent = cleanedHtml;

  if (titleMatch) {
    const titleText = titleMatch[2].replace(/\*\*/g, '').trim();
    lines.push({ text: titleText, isBold: true, isTitle: true });
    remainingContent = cleanedHtml.replace(titleMatch[0], '').trim();
  } else {
    // Alternative title detection for other formats
    const firstLine = cleanedHtml.split('\n')[0];
    if (firstLine && (firstLine.includes('Student') || firstLine.includes('University') || firstLine.includes('College'))) {
      lines.push({ text: firstLine.replace(/\*\*/g, '').trim(), isBold: true, isTitle: true });
      remainingContent = cleanedHtml.replace(firstLine, '').trim();
    }
  }

  // Process remaining content with improved segment handling
  const paragraphs = remainingContent.split(/\n{2,}/);

  paragraphs.forEach(paragraph => {
    if (!paragraph.trim()) return;

    // Check if paragraph starts with a bullet point
    const isBulletPoint = paragraph.trim().startsWith('•');

    const segments = paragraph.split(/(\*\*.*?\*\*|_.*?_)/g).filter(Boolean);

    segments.forEach(segment => {
      segment = segment.trim();
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

      if (text.trim()) {
        // Add indentation to bullet points for better visual hierarchy
        if (isBulletPoint && text.startsWith('•')) {
          text = '  ' + text;
        }
        lines.push({ text: text.trim(), isBold, isItalic });
      }
    });
  });

  return lines;
};

// --- Optimized Rich Text component with better spacing and formatting ---
const RichText = ({ content, style }: { content: string; style?: any }) => {
  const textLines = parseHtmlContent(content);
  if (!textLines.length) return null;

  // Process the text lines for better formatting

  return (
    <View style={{ marginBottom: 6 }}>
      {textLines.map((line, index) => {
        const lineStyle = {
          ...styles.description,
          ...style,
          ...(line.isBold ? { fontWeight: 'bold' } : {}),
          ...(line.isItalic ? { fontStyle: 'italic' } : {}),
          ...(line.isTitle ? {
            fontSize: 11,
            fontWeight: 'bold',
            marginBottom: 4,
            color: '#333',
            paddingBottom: 2,
            borderBottomWidth: 0.5,
            borderBottomColor: '#e0e0e0',
          } : {}),
          marginTop: index > 0 ? (line.isTitle ? 6 : 3) : 0,
          marginBottom: 3,
        };

        return (
          <Text key={index} style={lineStyle}>
            {line.text}
          </Text>
        );
      })}
    </View>
  );
};

// --- Helper function to get status color with expanded states ---
const getStatusColor = (status: string): string => {
  status = (status || '').toLowerCase();
  if (status.includes('complete') || status.includes('approved') || status.includes('accepted') || status.includes('success')) {
    return '#2e7d32'; // Green
  } else if (status.includes('pending') || status.includes('in progress') || status.includes('review') || status.includes('wait')) {
    return '#f57c00'; // Orange
  } else if (status.includes('reject') || status.includes('denied') || status.includes('cancel') || status.includes('fail')) {
    return '#c62828'; // Red
  }
  return '#455a64'; // Default slate blue - less harsh than burgundy for unknown statuses
};

// --- Modern design system with improved visual hierarchy ---
const styles = StyleSheet.create({
  // Core Layout
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 35, // Increased padding for better whitespace
  },
  header: {
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#800020',
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLogo: {
    width: 130,
    height: 35,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16, // Increased size for better visibility
    color: '#800020',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 8,
    color: '#555555',
    marginTop: 3,
  },

  // Layout Section Containers
  fullWidthSection: {
    width: '100%',
    marginBottom: 18, // Increased spacing between major sections
  },
  columnsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  primaryColumn: {
    width: '66%', // Slightly wider for better balance
    paddingRight: 15,
  },
  secondaryColumn: {
    width: '34%',
    borderLeftWidth: 1, // Thicker separator for clarity
    borderLeftColor: '#e0e0e0',
    paddingLeft: 15,
  },

  // Section Components
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#800020',
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    textTransform: 'uppercase',
    letterSpacing: 1, // Subtle letter spacing for headings
  },

  // Student Info Components
  studentInfoContainer: {
    marginBottom: 15,
  },
  studentInfoHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f7f0f2', // Lighter burgundy tint for branding consistency
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 4, // Thicker accent for emphasis
    borderLeftColor: '#800020',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  studentInfoHeaderColumn: {
    width: '50%',
  },
  studentInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 4, // Match the header accent
    borderLeftColor: '#800020',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    width: '100%',
  },
  infoHalfRow: {
    flexDirection: 'row',
    marginBottom: 8, // Increased for better readability
    width: '50%', // Changed to half-width for better layout
    paddingRight: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: '#444',
    fontWeight: 'bold',
    width: '35%',
  },
  infoValue: {
    fontSize: 9,
    color: '#000',
    width: '65%',
  },

  // Description Components
  descriptionBox: {
    padding: 10,
    borderRadius: 4,
    borderLeftWidth: 4, // Match the header accent
    borderLeftColor: '#800020',
    marginTop: 12,
    marginBottom: 10,
  },
  description: {
    fontSize: 9,
    color: '#333',
    lineHeight: 1.5, // Improved line height for readability
    marginBottom: 3,
  },

  // Pathway Components
  pathwayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  pathwayTag: {
    backgroundColor: '#f9f0f2',
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginRight: 5,
    marginBottom: 5,
    borderLeftWidth: 2,
    borderLeftColor: '#800020',
  },
  pathwayText: {
    fontSize: 7,
    color: '#333',
    fontWeight: 'bold',
  },

  // List Item Components
  itemContainer: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333',
  },
  itemDetail: {
    fontSize: 10,
    color: '#444',
    marginBottom: 2,
    lineHeight: 1.3,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  itemHalfColumn: {
    width: '50%',
    marginBottom: 2,
  },

  // Status Indicator Components
  statusBadge: {
    fontSize: 7,
    color: '#fff',
    backgroundColor: '#800020',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  // Document Components
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  documentIcon: {
    width: 14,
    fontSize: 12,
    marginRight: 5,
    color: '#800020',
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
  },
  documentType: {
    fontSize: 7,
    color: '#666',
    marginTop: 1,
  },

  // Empty State Components
  emptyState: {
    fontSize: 8,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 6,
    paddingLeft: 2,
  },

  // Footer Components
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 35,
    right: 35,
    textAlign: 'center',
    fontSize: 7,
    color: '#777',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 6,
  },

  // Additional Utility Classes
  highlightText: {
    color: '#800020',
    fontWeight: 'bold',
  },
  clickableLink: {
    color: '#1976d2',
    textDecoration: 'underline',
  },
  infoContainer: {
    marginBottom: 5,
    padding: 5,
    backgroundColor: '#f7f7f7',
    borderRadius: 3,
  }
});

// --- Create the optimized PDF document component ---
const StudentProfilePDF: React.FC<StudentProfilePDFProps> = ({ data }) => {
  const {
    student,
    applications = [],
    meetings = [],
    pathways = [],
    documents = [],
    generatedAt,
    sections = []
  } = data || {};

  // Title logo path
  const titleLogoUrl = "/images/logo-dark.png";

  // Handle potential invalid student data with friendly error
  if (!student) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
            <Text style={{
              fontSize: 16,
              color: '#c62828',
              textAlign: 'center',
              marginBottom: 10,
              fontWeight: 'bold'
            }}>
              Error: Student Profile Unavailable
            </Text>
            <Text style={{
              fontSize: 12,
              color: '#555',
              textAlign: 'center'
            }}>
              The requested student data could not be loaded.
            </Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Format the generation date safely with fallback
  const formattedDate = generatedAt
    ? formatDate(new Date(generatedAt), "MMMM d, yyyy 'at' h:mm a")
    : 'Date unavailable';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- Enhanced Header with Improved Visibility --- */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image src={titleLogoUrl || "/placeholder.svg"} style={styles.titleLogo} />
            <View style={styles.headerRight}>
              <Text style={styles.title}>Student Profile Report</Text>
              <Text style={styles.date}>Generated on: {formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* --- Student Information with Improved Visual Hierarchy --- */}
        {sections.includes('profile') && (
          <View style={styles.fullWidthSection}>
            <Text style={styles.sectionTitle}>Student Information</Text>

            <View style={styles.studentInfoContainer}>
              {/* Name and ID - Prominent display */}
              <View style={styles.studentInfoHeader}>
                <View style={styles.studentInfoHeaderColumn}>
                  <Text style={[styles.infoLabel, { fontSize: 10, color: '#555' }]}>Name:</Text>
                  <Text style={[styles.infoValue, { fontSize: 14, fontWeight: 'bold', color: '#333' }]}>
                    {student.studentName || 'N/A'}
                  </Text>
                </View>
                <View style={styles.studentInfoHeaderColumn}>
                  <Text style={[styles.infoLabel, { fontSize: 10, color: '#555' }]}>Student Number:</Text>
                  <Text style={[styles.infoValue, { fontSize: 14, fontWeight: 'bold', color: '#333' }]}>
                    {student.studentNumber || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Other details - Organized grid with improved spacing */}
              <View style={styles.studentInfoGrid}>
                <View style={styles.infoHalfRow}>
                  <Text style={styles.infoLabel}>Category:</Text>
                  <Text style={styles.infoValue}>{student.studentCategory || 'N/A'}</Text>
                </View>
                <View style={styles.infoHalfRow}>
                  <Text style={styles.infoLabel}>Level:</Text>
                  <Text style={styles.infoValue}>{student.studentLevel || 'N/A'}</Text>
                </View>
                <View style={styles.infoHalfRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{student.studentEmail || student.email || 'N/A'}</Text>
                </View>
                <View style={styles.infoHalfRow}>
                  <Text style={styles.infoLabel}>Contact:</Text>
                  <Text style={styles.infoValue}>{student.studentContactNumber || 'N/A'}</Text>
                </View>
              </View>

              {/* Description - Enhanced formatting if available */}
              {student.studentDescription && (
                <View style={styles.descriptionBox}>
                  <RichText
                    content={student.studentDescription}
                    style={{
                      fontSize: 9,
                      lineHeight: 1.5,
                      color: '#333'
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* --- Two-column Layout with Improved Balance --- */}
        <View style={styles.columnsContainer}>
          {/* --- Primary Column (2/3 width) --- */}
          <View style={styles.primaryColumn}>
            {/* --- Applications Section with Enhanced Readability --- */}
            {sections.includes('applications') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Job Applications</Text>

                {applications.length > 0 ? (
                  applications.map((app, index) => (
                    <View key={app?.id || `app-${index}`} style={styles.itemContainer}>
                      <Text style={styles.itemTitle}>
                        {`${app.jobTitle || 'Untitled Position'} - ${app.companyName || 'Unknown Organization'}`}
                      </Text>

                      <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status || '') }]}>
                        {app.status || 'Status Unknown'}
                      </Text>

                      <View style={styles.itemGrid}>
                        <View style={styles.itemHalfColumn}>
                          <Text style={styles.itemDetail}>
                            <Text style={{ fontWeight: 'bold' }}>Submitted: </Text>
                            {app.submittedAt ? formatDate(new Date(app.submittedAt), 'MMM d, yyyy') : 'Not submitted'}
                          </Text>
                        </View>

                        {app.deadline && (
                          <View style={styles.itemHalfColumn}>
                            <Text style={styles.itemDetail}>
                              <Text style={{ fontWeight: 'bold' }}>Deadline: </Text>
                              {formatDate(new Date(app.deadline), 'MMM d, yyyy')}
                            </Text>
                          </View>
                        )}
                      </View>

                      {app.notes && (
                        <View style={styles.infoContainer}>
                          <Text style={styles.itemDetail}>
                            <Text style={{ fontWeight: 'bold' }}>Notes: </Text>
                            {app.notes}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyState}>No job applications have been recorded.</Text>
                )}
              </View>
            )}

            {/* --- Meetings Section with Enhanced Organization --- */}
            {sections.includes('meetings') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Meetings & Appointments</Text>

                {meetings.length > 0 ? (
                  meetings.map((meeting, index) => (
                    <View key={meeting?.id || `meeting-${index}`} style={styles.itemContainer}>
                      <Text style={styles.itemTitle}>
                        {meeting.meetingTitle || 'Untitled Meeting'}
                      </Text>

                      <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(meeting.status || '') }]}>
                        {meeting.status || 'Status Unknown'}
                      </Text>

                      <View style={styles.itemGrid}>
                        <View style={styles.itemHalfColumn}>
                          <Text style={styles.itemDetail}>
                            <Text style={{ fontWeight: 'bold' }}>With: </Text>
                            {meeting.otherPartyName || 'Not specified'}
                          </Text>
                        </View>

                        <View style={styles.itemHalfColumn}>
                          <Text style={styles.itemDetail}>
                            <Text style={{ fontWeight: 'bold' }}>Date: </Text>
                            {meeting.meetingDate ? formatDate(new Date(meeting.meetingDate), 'MMM d, yyyy') : 'Not scheduled'}
                          </Text>
                        </View>

                        {meeting.meetingTime && (
                          <View style={styles.itemHalfColumn}>
                            <Text style={styles.itemDetail}>
                              <Text style={{ fontWeight: 'bold' }}>Time: </Text>
                              {meeting.meetingTime}
                            </Text>
                          </View>
                        )}

                        {meeting.location && (
                          <View style={styles.itemHalfColumn}>
                            <Text style={styles.itemDetail}>
                              <Text style={{ fontWeight: 'bold' }}>Location: </Text>
                              {meeting.location}
                            </Text>
                          </View>
                        )}
                      </View>

                      {meeting.notes && (
                        <View style={styles.infoContainer}>
                          <Text style={styles.itemDetail}>
                            <Text style={{ fontWeight: 'bold' }}>Notes: </Text>
                            {meeting.notes}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyState}>No meetings have been scheduled.</Text>
                )}
              </View>
            )}
          </View>

          {/* --- Secondary Column (1/3 width) --- */}
          <View style={styles.secondaryColumn}>
            {/* --- Career Pathways Section with Improved Tag Design --- */}
            {sections.includes('pathways') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Career Pathways</Text>

                {pathways.length > 0 ? (
                  <View style={styles.pathwayContainer}>
                    {pathways.map((pathway, index) => (
                      <View key={typeof pathway === 'object' && pathway?.id ? pathway.id : `pathway-${index}`} style={styles.pathwayTag}>
                        <Text style={styles.pathwayText}>
                          {typeof pathway === 'string'
                            ? pathway
                            : (pathway?.title || `Pathway ${index + 1}`)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyState}>No career pathways have been defined.</Text>
                )}
              </View>
            )}

            {/* --- Documents Section with Enhanced Iconography --- */}
            {sections.includes('documents') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Documents</Text>

                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <View key={doc?.id || `doc-${index}`} style={styles.documentItem}>
                      {/* Document type icon selection - SVG paths instead of emoji */}
                      {(() => {
                        const docType = (doc.stuDocType || doc.type || '').toLowerCase();
                        let iconPath = '';

                        // SVG path data for different document types
                        if (docType.includes('resume') || docType.includes('cv')) {
                          // Clipboard/Resume icon
                          iconPath = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-2 17H8v-2h4v2zm6-4H6v-2h12v2zm0-4H6v-2h12v2z';
                        } else if (docType.includes('letter')) {
                          // Envelope/Letter icon
                          iconPath = 'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.7l-8 5.334L4 8.7V6.297l8 5.333 8-5.333V8.7z';
                        } else if (docType.includes('certificate')) {
                          // Certificate/Graduation icon
                          iconPath = 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z';
                        } else if (docType.includes('report')) {
                          // Chart/Report icon
                          iconPath = 'M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z';
                        } else if (docType.includes('form')) {
                          // Form/Checklist icon
                          iconPath = 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
                        } else {
                          // Default document icon
                          iconPath = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z';
                        }

                        return (
                          <View style={{ width: 14, height: 14, marginRight: 5 }}>
                            <Svg viewBox="0 0 24 24" width={14} height={14}>
                              <Path d={iconPath} fill="#800020" />
                            </Svg>
                          </View>
                        );
                      })()}

                      <View style={styles.documentInfo}>
                        <Text style={styles.documentTitle}>
                          {doc.stuDocName || doc.title || doc.name || `Document ${index + 1}`}
                        </Text>
                        <Text style={styles.documentType}>
                          {doc.stuDocType || doc.type || 'Unknown type'}
                        </Text>

                        {doc.uploadDate && (
                          <Text style={{ fontSize: 6, color: '#777', marginTop: 1 }}>
                            Uploaded: {formatDate(new Date(doc.uploadDate), 'MMM d, yyyy')}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyState}>No documents have been uploaded.</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* --- Enhanced Footer --- */}
        <Text style={styles.footer}>
          © 2025 Guidia Career Services. This report is confidential and intended for authorized use only.
        </Text>
      </Page>
    </Document>
  );
};

export default StudentProfilePDF;