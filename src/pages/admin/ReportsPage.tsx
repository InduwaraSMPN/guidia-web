"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Download,
  FileText,
  Search,
  User,
  GraduationCap,
  Briefcase
} from "lucide-react";
import { PageHeading } from "@/components/PageHeading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import reportsService from "@/services/reportsService";
import StudentProfileReport from "@/components/reports/StudentProfileReport";

// Interfaces for Student Profile Report
interface Student {
  studentID: number;
  studentNumber: string;
  studentName: string;
  studentTitle?: string;
  studentContactNumber?: string;
  studentEmail?: string;
  studentDescription?: string;
  studentProfileImagePath?: string;
  userID?: number;
  studentCategory: 'Undergraduate' | 'Postgraduate';
  studentLevel: string;
  studentCareerPathways?: any;
  studentDocuments?: any;
  createdAt?: string;
  updatedAt?: string;
  username?: string;
  email?: string;
}

interface JobApplication {
  applicationID: number;
  jobID: number;
  status: string;
  submittedAt: string;
  jobTitle?: string;
  companyName?: string;
}

interface Meeting {
  meetingID: number;
  meetingTitle: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingType: string;
  otherPartyName?: string;
}

interface ReportSection {
  id: string;
  label: string;
  checked: boolean;
}

interface ReportFormat {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Constants
const BRAND_COLOR = "#800020";

function ReportsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");

  // Report sections configuration
  const [reportSections, setReportSections] = useState<ReportSection[]>([
    { id: "profile", label: "Profile Information", checked: true },
    { id: "education", label: "Education Details", checked: true },
    { id: "career", label: "Career Pathways", checked: true },
    { id: "documents", label: "Documents", checked: true },
    { id: "applications", label: "Job Applications", checked: true },
    { id: "meetings", label: "Meeting History", checked: true },
  ]);

  // Available export formats
  const reportFormats: ReportFormat[] = [
    { id: "pdf", label: "PDF", icon: <FileText className="h-4 w-4" /> },
    { id: "excel", label: "Excel", icon: <FileText className="h-4 w-4" /> },
    { id: "csv", label: "CSV", icon: <FileText className="h-4 w-4" /> },
  ];

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const data = await reportsService.getStudents();

        if (data && Array.isArray(data)) {
          setStudents(data);
          setFilteredStudents(data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to fetch students data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.studentName.toLowerCase().includes(query) ||
          student.studentNumber.toLowerCase().includes(query) ||
          (student.studentEmail && student.studentEmail.toLowerCase().includes(query))
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  // Toggle report section
  const toggleSection = (sectionId: string) => {
    setReportSections(
      reportSections.map((section) =>
        section.id === sectionId
          ? { ...section, checked: !section.checked }
          : section
      )
    );
  };

  // State for report data and dialog
  const [reportData, setReportData] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Generate report
  const generateReport = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    const enabledSections = reportSections
      .filter((section) => section.checked)
      .map((section) => section.id);

    if (enabledSections.length === 0) {
      toast.error("Please select at least one report section");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await reportsService.generateStudentProfileReport({
        studentID: selectedStudent.studentID,
        format: selectedFormat as 'pdf' | 'excel' | 'csv',
        sections: enabledSections
      });

      if (result && typeof result === 'object' && 'success' in result && result.success && 'data' in result) {
        setReportData(result.data);
        setShowReportDialog(true);
        toast.success(`${selectedFormat.toUpperCase()} report generated successfully`);
      } else {
        toast.error("Failed to generate report data");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1216px] mx-auto">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-8 w-96 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1216px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <PageHeading title="Reports" />
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-semibold mb-4">Your Report is Ready</h2>
            {reportData && (
              <StudentProfileReport data={reportData} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand" />
            Student Profile Report
          </CardTitle>
          <CardDescription>
            Generate comprehensive student profile reports with customizable sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Selection */}
            <div>
              <h3 className="text-lg font-medium mb-4">Select Student</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search students by name or ID..."
                    className="w-full pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="border rounded-md">
                  <ScrollArea className="h-[300px] w-full">
                    {filteredStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-8">
                        <User className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                        <p className="text-muted-foreground">No students found</p>
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredStudents.map((student) => (
                          <button
                            key={student.studentID}
                            className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                              selectedStudent?.studentID === student.studentID
                                ? "bg-rose-800/10 text-rose-800 font-medium"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {student.studentProfileImagePath ? (
                                  <img
                                    src={student.studentProfileImagePath}
                                    alt={student.studentName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{student.studentName}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {student.studentNumber} • {student.studentCategory}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Report Configuration */}
            <div>
              <h3 className="text-lg font-medium mb-4">Report Configuration</h3>
              <div className="space-y-6">
                {/* Report Sections */}
                <div className="space-y-3">
                  <Label className="text-base">Report Sections</Label>
                  <div className="space-y-2">
                    {reportSections.map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`section-${section.id}`}
                          checked={section.checked}
                          onCheckedChange={() => toggleSection(section.id)}
                        />
                        <Label
                          htmlFor={`section-${section.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {section.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Format */}
                <div className="space-y-3">
                  <Label className="text-base">Export Format</Label>
                  <div className="relative">
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                    >
                      {reportFormats.map((format) => (
                        <option key={format.id} value={format.id}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  className="w-full"
                  onClick={generateReport}
                  disabled={isGenerating || !selectedStudent}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Preview */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-brand" />
              Student Preview
            </CardTitle>
            <CardDescription>
              Preview of selected student information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-brand" />
                  Profile Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedStudent.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Student Number</p>
                    <p className="font-medium">{selectedStudent.studentNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedStudent.studentCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="font-medium">{selectedStudent.studentLevel}</p>
                  </div>
                  {selectedStudent.studentEmail && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedStudent.studentEmail}</p>
                    </div>
                  )}
                  {selectedStudent.studentContactNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">{selectedStudent.studentContactNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Career Pathways */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-brand" />
                  Career Pathways
                </h3>
                {selectedStudent.studentCareerPathways ? (
                  <div className="space-y-2">
                    {typeof selectedStudent.studentCareerPathways === 'string'
                      ? JSON.parse(selectedStudent.studentCareerPathways).map((pathway: any, index: number) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-md">
                            <p className="font-medium">{pathway.title || 'Unnamed Pathway'}</p>
                            {pathway.description && (
                              <p className="text-sm text-muted-foreground mt-1">{pathway.description}</p>
                            )}
                          </div>
                        ))
                      : Array.isArray(selectedStudent.studentCareerPathways)
                        ? selectedStudent.studentCareerPathways.map((pathway: any, index: number) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-md">
                              <p className="font-medium">{pathway.title || 'Unnamed Pathway'}</p>
                              {pathway.description && (
                                <p className="text-sm text-muted-foreground mt-1">{pathway.description}</p>
                              )}
                            </div>
                          ))
                        : (
                            <p className="text-muted-foreground">No career pathways defined</p>
                          )
                    }
                  </div>
                ) : (
                  <p className="text-muted-foreground">No career pathways defined</p>
                )}
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand" />
                  Documents
                </h3>
                {selectedStudent.studentDocuments ? (
                  <div className="space-y-2">
                    {typeof selectedStudent.studentDocuments === 'string'
                      ? JSON.parse(selectedStudent.studentDocuments).map((doc: any, index: number) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-md flex items-center justify-between">
                            <div>
                              <p className="font-medium">{doc.title || doc.name || 'Unnamed Document'}</p>
                              <p className="text-xs text-muted-foreground">{doc.type || 'Unknown type'}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      : Array.isArray(selectedStudent.studentDocuments)
                        ? selectedStudent.studentDocuments.map((doc: any, index: number) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-md flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.title || doc.name || 'Unnamed Document'}</p>
                                <p className="text-xs text-muted-foreground">{doc.type || 'Unknown type'}</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        : (
                            <p className="text-muted-foreground">No documents uploaded</p>
                          )
                    }
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents uploaded</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ReportsPage;
