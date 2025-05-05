import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import { format as formatDate } from 'date-fns';
import DOMPurify from 'dompurify';

// Helper function to sanitize and parse HTML content
const parseHtmlContent = (htmlContent: string) => {
  if (!htmlContent) return [];

  // First, let's directly handle the HTML tags that are still showing as text
  let cleanedHtml = htmlContent
    // Handle <strong> tags
    .replace(/<strong>(.*?)<\/strong>/g, (_, content) => {
      return `**${content}**`;
    })
    // Handle <p> tags
    .replace(/<p>(.*?)<\/p>/g, (_, content) => {
      return `${content}\n`;
    })
    // Handle <p> tags with attributes
    .replace(/<p[^>]*>(.*?)<\/p>/g, (_, content) => {
      return `${content}\n`;
    })
    // Handle HTML entities
    .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/g, (_, content) => {
      return `**${content}**`;
    })
    .replace(/&lt;p&gt;(.*?)&lt;\/p&gt;/g, (_, content) => {
      return `${content}\n`;
    });

  // Sanitize the HTML content
  const sanitizedHtml = DOMPurify.sanitize(cleanedHtml);

  // Simple parsing of HTML tags for PDF rendering
  const lines: { text: string; isBold?: boolean; isItalic?: boolean; isHeading?: boolean; isListItem?: boolean; isTitle?: boolean }[] = [];

  // Special handling for student description format
  // Check if the content matches the pattern of a student description
  if (sanitizedHtml.includes('University') &&
      (sanitizedHtml.includes('Student') || sanitizedHtml.includes('pursuing'))) {

    // First, clean up any HTML tags that might be showing in the text
    let cleanedContent = sanitizedHtml
      .replace(/<p>\*\*\s*\|\s*University of Kelaniya\*\*<\/p><p>/g, '')
      .replace(/<p>\*\*/g, '**')
      .replace(/\*\*<\/p>/g, '**')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**');

    // Try to identify the title line (usually contains "Student | Management" or similar)
    const titleMatch = cleanedContent.match(/(Undergraduate|Graduate|Postgraduate)\s+Student\s+\|\s+[^|]+(\s+\|[^|]+)?/);

    if (titleMatch) {
      const titleText = titleMatch[0].trim();

      // Add the title as a separate line with bold formatting
      lines.push({
        text: titleText,
        isBold: true,
        isTitle: true
      });

      // Get the rest of the content after the title
      let remainingContent = cleanedContent.replace(titleText, '').trim();

      // Remove any "| University of Kelaniya" that might be duplicated
      remainingContent = remainingContent.replace(/\*\*\s*\|\s*University of Kelaniya\*\*/g, '');

      // Process the remaining content
      if (remainingContent) {
        // Check for "Currently pursuing" pattern
        const pursuingMatch = remainingContent.match(/Currently pursuing[^\.]+\./);

        if (pursuingMatch) {
          // Clean up any asterisks in the "Currently pursuing" sentence
          let cleanedPursuing = pursuingMatch[0].trim()
            .replace(/\*\*(.*?)\*\*/g, '$1'); // Remove ** around text

          // Add the "Currently pursuing" sentence as a separate line
          lines.push({
            text: cleanedPursuing,
            isBold: false
          });

          // Get the rest of the content after the "Currently pursuing" sentence
          remainingContent = remainingContent.replace(pursuingMatch[0], '').trim();

          // Clean up any remaining HTML tags
          remainingContent = remainingContent
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '')
            .replace(/\*\*/g, '')
            .trim();

          // Add the remaining content as a separate paragraph if it exists
          if (remainingContent) {
            // Split by periods for better formatting
            const sentences = remainingContent.split(/(?<=\.)\s+/).filter(s => s.trim());

            if (sentences.length > 0) {
              sentences.forEach(sentence => {
                lines.push({
                  text: sentence.trim(),
                  isBold: false
                });
              });
            } else {
              lines.push({
                text: remainingContent.trim(),
                isBold: false
              });
            }
          }
        } else {
          // Split by periods or line breaks for better formatting
          const sentences = remainingContent.split(/(?<=\.)\s+|\n+/).filter(s => s.trim());

          sentences.forEach(sentence => {
            // Clean up any remaining HTML tags
            const cleanedSentence = sentence
              .replace(/<p>/g, '')
              .replace(/<\/p>/g, '')
              .replace(/\*\*/g, '')
              .trim();

            if (cleanedSentence) {
              lines.push({
                text: cleanedSentence,
                isBold: false
              });
            }
          });
        }
      }

      return lines;
    }
  }

  // If not a special student description format, use the regular parsing
  // Split the content by newlines first to preserve paragraph structure
  const paragraphs = sanitizedHtml.split(/\n+/).filter(p => p.trim());

  // Process each paragraph
  paragraphs.forEach(paragraph => {
    // Process the paragraph content
    let processedParagraph = paragraph
      // Handle HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Handle specific patterns that are showing up in the text
      .replace(/<p>\*\*\s*\|\s*University of Kelaniya\*\*<\/p><p>/g, '')
      .replace(/<\/p>/g, '\n')
      // Handle HTML tags
      .replace(/<p[^>]*>(.*?)<\/p>/gs, '$1')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b>(.*?)<\/b>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '_$1_')
      .replace(/<i>(.*?)<\/i>/g, '_$1_')
      .replace(/<u>(.*?)<\/u>/g, '$1')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div[^>]*>(.*?)<\/div>/gs, '$1')
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/g, '**$1**')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '• $1')
      // Handle any literal tags that might still be in the text
      .replace(/<p>\*\*/g, '**')
      .replace(/\*\*<\/p>/g, '**')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '')
      .replace(/<strong>/g, '')
      .replace(/<\/strong>/g, '')
      // Final cleanup - remove any remaining tags
      .replace(/<[^>]*>/g, '');

    if (processedParagraph.trim()) {
      // Check for line breaks in the paragraph and split if necessary
      const paragraphLines = processedParagraph.split(/\n/).filter(line => line.trim());

      if (paragraphLines.length > 1) {
        // If there are multiple lines, add each as a separate line
        paragraphLines.forEach(line => {
          if (line.trim()) {
            // Process bold and italic markers
            let isBold = line.includes('**');
            let isItalic = line.includes('_');

            // Remove the markers
            let processedLine = line;
            if (isBold) {
              processedLine = processedLine.replace(/\*\*/g, '');
            }

            if (isItalic) {
              processedLine = processedLine.replace(/_/g, '');
            }

            lines.push({
              text: processedLine.trim(),
              isBold,
              isItalic
            });
          }
        });
      } else {
        // Process bold and italic markers
        let isBold = processedParagraph.includes('**');
        let isItalic = processedParagraph.includes('_');

        // Remove the markers
        if (isBold) {
          processedParagraph = processedParagraph.replace(/\*\*/g, '');
        }

        if (isItalic) {
          processedParagraph = processedParagraph.replace(/_/g, '');
        }

        lines.push({
          text: processedParagraph.trim(),
          isBold,
          isItalic
        });
      }
    }
  });

  return lines;
};

// Rich Text component for PDF
const RichText = ({ content, style }: { content: string; style?: any }) => {
  const textLines = parseHtmlContent(content);

  // Check if this is a student description with title
  const hasTitle = textLines.some(line => line.isTitle);

  return (
    <View style={{ marginBottom: 8 }}>
      {textLines.map((line, index) => {
        // Create a style object for this specific line
        const lineStyle = {
          ...style,
          ...(line.isBold ? { fontWeight: 'bold' } : {}),
          ...(line.isItalic ? { fontStyle: 'italic' } : {}),
          ...(line.isHeading ? { fontSize: 14, marginTop: 8, marginBottom: 4 } : {}),
          ...(line.isListItem ? { marginLeft: 10, marginBottom: 2 } : {}),
          ...(line.isTitle ? {
            fontSize: 12,
            color: '#444444',
            marginBottom: 6,
            marginTop: 2
          } : {}),
          // Add spacing between paragraphs in student description
          ...(hasTitle && !line.isTitle && index > 0 ? { marginTop: 4 } : {}),
          // Add spacing between lines
          ...(index < textLines.length - 1 ? { marginBottom: 4 } : {})
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

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#800020',
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 24,
    color: '#800020',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  date: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right',
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#800020',
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#800020',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 12,
    color: '#333333',
    fontWeight: 'bold',
    width: '30%',
  },
  value: {
    fontSize: 12,
    color: '#000000',
    width: '70%',
  },
  description: {
    fontSize: 11,
    color: '#333333',
    marginTop: 5,
    lineHeight: 1.5,
  },
  itemTitle: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 2,
  },
  item: {
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
});

// Define the component props
interface StudentProfilePDFProps {
  data: {
    student: any;
    applications: any[];
    meetings: any[];
    pathways: any[];
    documents: any[];
    generatedAt: string;
    sections: string[];
  };
}

// Create the PDF document component
const StudentProfilePDF: React.FC<StudentProfilePDFProps> = ({ data }) => {
  const { student, applications, meetings, pathways, documents, generatedAt, sections } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              src="/images/logo.png"
              style={styles.logo}
            />
            <View>
              <Text style={styles.title}>GUIDIA</Text>
              <Text style={styles.subtitle}>Student Profile Report</Text>
            </View>
          </View>
          <Text style={styles.date}>
            Generated on: {formatDate(new Date(generatedAt), 'MMMM d, yyyy \'at\' h:mm a')}
          </Text>
        </View>

        {/* Student Information Section */}
        {sections.includes('profile') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Information</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{student.studentName || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Student Number:</Text>
              <Text style={styles.value}>{student.studentNumber || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>{student.studentCategory || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Level:</Text>
              <Text style={styles.value}>{student.studentLevel || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{student.studentEmail || student.email || 'N/A'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{student.studentContactNumber || 'N/A'}</Text>
            </View>

            {student.studentDescription && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Description:</Text>
                </View>
                <RichText content={student.studentDescription} style={styles.description} />
              </>
            )}
          </View>
        )}

        {/* Career Pathways Section */}
        {sections.includes('pathways') && pathways && pathways.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Career Pathways</Text>

            {pathways.map((pathway: any, index: number) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {typeof pathway === 'string'
                    ? pathway
                    : pathway.title || `Pathway ${index + 1}`}
                </Text>
                {typeof pathway === 'object' && pathway.description && (
                  <RichText content={pathway.description} style={styles.description} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Job Applications Section */}
        {sections.includes('applications') && applications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Applications</Text>

            {applications.map((app, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {`${index + 1}. ${app.jobTitle || 'Untitled Job'} - ${app.companyName || 'Unknown Company'}`}
                </Text>
                <Text style={styles.itemDetail}>
                  Status: {app.status || 'Unknown'}
                </Text>
                <Text style={styles.itemDetail}>
                  Submitted: {formatDate(new Date(app.submittedAt), 'MMMM d, yyyy')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Meetings Section */}
        {sections.includes('meetings') && meetings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meetings</Text>

            {meetings.map((meeting, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {`${index + 1}. ${meeting.meetingTitle || 'Untitled Meeting'}`}
                </Text>
                <Text style={styles.itemDetail}>
                  With: {meeting.otherPartyName || 'Unknown'}
                </Text>
                <Text style={styles.itemDetail}>
                  Date: {formatDate(new Date(meeting.meetingDate), 'MMMM d, yyyy')}
                </Text>
                <Text style={styles.itemDetail}>
                  Status: {meeting.status || 'Unknown'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Documents Section */}
        {sections.includes('documents') && documents && documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>

            {documents.map((doc: any, index: number) => (
              <View key={index} style={styles.item}>
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

        {/* Footer */}
        <Text style={styles.footer}>
          GUIDIA - Career Guidance Platform
        </Text>
      </Page>
    </Document>
  );
};

export default StudentProfilePDF;
