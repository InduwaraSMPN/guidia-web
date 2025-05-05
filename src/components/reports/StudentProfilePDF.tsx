import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer';
import { format as formatDate } from 'date-fns';

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
    fontSize: 12,
    color: '#000000',
    marginTop: 5,
    marginBottom: 10,
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
    generatedAt: string;
    sections: string[];
  };
}

// Create the PDF document component
const StudentProfilePDF: React.FC<StudentProfilePDFProps> = ({ data }) => {
  const { student, applications, meetings, pathways, generatedAt, sections } = data;

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
                <Text style={styles.description}>{student.studentDescription}</Text>
              </>
            )}
          </View>
        )}

        {/* Career Pathways Section */}
        {sections.includes('pathways') && pathways.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Career Pathways</Text>

            {pathways.map((pathway, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemTitle}>
                  {pathway.title || `Pathway ${index + 1}`}
                </Text>
                {pathway.description && (
                  <Text style={styles.description}>{pathway.description}</Text>
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

        {/* Footer */}
        <Text style={styles.footer}>
          GUIDIA - Career Guidance Platform
        </Text>
      </Page>
    </Document>
  );
};

export default StudentProfilePDF;
