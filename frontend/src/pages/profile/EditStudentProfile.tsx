import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ViewDocumentModal } from "@/components/ViewDocumentModal";
import { FileUploader } from "@/components/FileUploader";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentImage } from "@/lib/imageUtils";
import {
  validateEmail,
  validatePhoneNumber,
  validateText,
  validateStudentNumber,
  sanitizePhoneNumber
} from "@/utils/validationUtils";

interface FormData {
  studentNumber: string;
  studentName: string;
  title: string;
  contactNumber: string;
  studentMail: string;
  description: string;
  image: File | null;
  studyLevel: string;
  courseLevel: string;
}

interface FormErrors {
  studentNumber?: string;
  studentName?: string;
  title?: string;
  contactNumber?: string;
  studentMail?: string;
  description?: string;
  image?: string;
  studyLevel?: string;
  courseLevel?: string;
}

export function EditStudentProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    studentNumber: "",
    studentName: "",
    title: "",
    contactNumber: "",
    studentMail: "",
    description: "",
    image: null,
    studyLevel: "",
    courseLevel: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});



  const courseLevelOptions = {
    Undergraduate: ["Level - 1", "Level - 2", "Level - 3", "Level - 4"],
    Postgraduate: [
      "PGCert (Postgraduate Certificate)",
      "PGDip (Postgraduate Diploma)",
      "MA (Master of Arts)",
      "MSc (Master of Science)",
      "MBA (Master of Business Administration)",
      "LLM (Master of Laws)",
      "MEd (Master of Education)",
      "MArch (Master of Architecture)",
      "MFA (Master of Fine Arts)",
      "MASt (Master of Advanced Study)",
      "PGCE (Postgraduate Certificate in Education)",
      "MPhil (Master of Philosophy)",
      "MRes (Master of Research)",
      "MLitt (Master of Letters)",
      "PhD (Doctor of Philosophy)",
      "DPhil (Doctor of Philosophy)",
      "EdD (Doctor of Education)",
      "DBA (Doctor of Business Administration)",
      "DM (Doctor of Medicine)",
      "GradCert (Graduate Certificate)",
      "GradDip (Graduate Diploma)",
      "Conversion Courses",
      "Pre-Master's Courses",
    ],
  };

  // Validate all form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Student Number validation
    if (!validateStudentNumber(formData.studentNumber)) {
      newErrors.studentNumber = "Student number is required and must not exceed 20 characters";
    }

    // Student Name validation
    if (!validateText(formData.studentName, 2)) {
      newErrors.studentName = "Student name must be at least 2 characters";
    }

    // Title validation
    if (!validateText(formData.title, 2)) {
      newErrors.title = "Title must be at least 2 characters";
    }

    // Contact Number validation
    if (!validatePhoneNumber(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid contact number";
    }

    // Email validation
    if (!validateEmail(formData.studentMail)) {
      newErrors.studentMail = "Please enter a valid email address";
    }

    // Description validation - no character limit as per memory
    if (!validateText(formData.description, 10)) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Study Level validation
    if (!formData.studyLevel) {
      newErrors.studyLevel = "Please select a study level";
    }

    // Course Level validation
    if (!formData.courseLevel) {
      newErrors.courseLevel = "Please select a course level";
    }

    // Image validation
    if (!formData.image && !previewUrl) {
      newErrors.image = "Please upload a profile image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate a specific field
  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'studentNumber':
        return !validateStudentNumber(value)
          ? "Student number is required and must not exceed 20 characters"
          : undefined;

      case 'studentName':
        return !validateText(value, 2)
          ? "Student name must be at least 2 characters"
          : undefined;

      case 'title':
        return !validateText(value, 2)
          ? "Title must be at least 2 characters"
          : undefined;

      case 'contactNumber':
        return !validatePhoneNumber(value)
          ? "Please enter a valid contact number"
          : undefined;

      case 'studentMail':
        return !validateEmail(value)
          ? "Please enter a valid email address"
          : undefined;

      case 'description':
        return !validateText(value, 10)
          ? "Description must be at least 10 characters"
          : undefined;

      case 'studyLevel':
        return !value ? "Please select a study level" : undefined;

      case 'courseLevel':
        return !value ? "Please select a course level" : undefined;

      default:
        return undefined;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Sanitize input for specific fields
    let sanitizedValue = value;
    if (name === 'contactNumber') {
      sanitizedValue = sanitizePhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Validate the field
    const error = validateField(name, sanitizedValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleEditorChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));

    // Validate the description
    const error = validateField('description', value);
    setErrors(prev => ({
      ...prev,
      description: error
    }));
  };

  const handleRemoveImage = () => {
    // Clean up preview URL only if it's a local blob URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");

    // Reset form data
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));

    // Show file uploader again
    setShowFileUploader(true);

    console.log("Image removed");
  };

  // Load existing profile data
  useEffect(() => {
    // Simulate loading delay
    const loadingTimer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    if (!token || !user) {
      setIsLoading(false);
      setPageLoading(false);
      return;
    }

    const loadProfileData = async () => {
      try {
        const response = await fetch(
          `/api/students/${user.userID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", response.status, errorText);
          throw new Error(
            `Failed to fetch profile data: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Received profile data:", data);

        // Update form data
        setFormData({
          studentNumber: data.studentNumber || "",
          studentName: data.studentName || "",
          title: data.studentTitle || "",
          contactNumber: data.studentContactNumber || "",
          studentMail: data.studentEmail || "",
          description: data.studentDescription || "",
          image: null,
          studyLevel: data.studentCategory || "",
          courseLevel: data.studentLevel || "",
        });

        // If there's an existing profile image
        if (data.studentProfileImagePath) {
          console.log(
            "Profile image path from API:",
            data.studentProfileImagePath
          );
          // Azure blob storage URLs are already complete URLs
          const imageUrl = data.studentProfileImagePath;
          console.log("Setting preview URL to:", imageUrl);
          setPreviewUrl(imageUrl);
          setShowFileUploader(false);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
        setPageLoading(false);
        clearTimeout(loadingTimer); // Clear the timer if fetch completes before timeout
      }
    };

    loadProfileData();

    return () => clearTimeout(loadingTimer);
  }, [token, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user?.userID) {
      toast.error("Please login to update profile");
      return;
    }

    // Validate all form fields
    if (!validateForm()) {
      // Show the first error message
      const firstError = Object.values(errors).find(error => error !== undefined);
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error("Please fix the errors in the form");
      }
      return;
    }

    try {
      let profileImagePath = previewUrl || "";

      if (formData.image instanceof File && formData.image.size > 0) {
        const imageFormData = new FormData();
        imageFormData.append("image", formData.image);
        imageFormData.append("type", "student-profile");
        imageFormData.append("userID", user.userID.toString());

        const uploadResponse = await fetch(
          `/api/upload`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            method: "POST",
            body: imageFormData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const uploadResult = await uploadResponse.json();
        profileImagePath = uploadResult.imagePath;
      }

      // Include userID in the profile data
      const profileData = {
        userID: user.userID,
        studentNumber: formData.studentNumber,
        studentName: formData.studentName,
        studentTitle: formData.title,
        studentContactNumber: formData.contactNumber,
        studentEmail: formData.studentMail,
        studentDescription: formData.description,
        studentProfileImagePath: profileImagePath,
        studentCategory: formData.studyLevel,
        studentLevel: formData.courseLevel,
      };

      const response = await fetch(
        `/api/students/${user.userID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update profile: ${response.status} ${errorText}`
        );
      }

      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      toast.success("Profile updated successfully");
      navigate(getProfilePath());
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  const getProfilePath = () => {
    if (!user) return "";
    switch (user.userType) {
      case "Student":
        return `/students/profile/${user.id}`;
      case "Company":
        return `/companies/${user.id}`;
      case "Counselor":
        return `/counselors/${user.id}`;
      case "Admin":
        return `/admin`;
      default:
        return "";
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
        <div className="max-w-3xl mx-auto mb-16">
          <Skeleton className="h-10 w-64 mb-8" />

          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-[160px] w-full rounded-md" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>

            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 px-6 lg:px-8 pb-32">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-bold text-brand mb-8">
            Edit Profile
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Student Number<span className="text-brand">*</span>
              </label>
              <Input
                type="text"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleInputChange}
                required
                placeholder="Enter student number"
                title="Student Number"
                aria-label="Student Number"
                className={errors.studentNumber ? "border-red-500" : ""}
              />
              {errors.studentNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.studentNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Student Name<span className="text-brand">*</span>
              </label>
              <Input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                required
                placeholder="Enter student name"
                title="Student Name"
                aria-label="Student Name"
                className={errors.studentName ? "border-red-500" : ""}
              />
              {errors.studentName && (
                <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Title<span className="text-brand">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter title"
                  title="Title"
                  aria-label="Title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Contact Number<span className="text-brand">*</span>
                </label>
                <Input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter contact number"
                  title="Contact Number"
                  aria-label="Contact Number"
                  className={errors.contactNumber ? "border-red-500" : ""}
                />
                {errors.contactNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Student E-Mail<span className="text-brand">*</span>
              </label>
              <Input
                type="email"
                name="studentMail"
                value={formData.studentMail}
                onChange={handleInputChange}
                required
                placeholder="Enter student email"
                title="Student Email"
                aria-label="Student Email"
                className={errors.studentMail ? "border-red-500" : ""}
              />
              {errors.studentMail && (
                <p className="text-red-500 text-sm mt-1">{errors.studentMail}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Study Level<span className="text-brand">*</span>
                </label>
                <Select
                  options={[
                    { value: "Undergraduate", label: "Undergraduate" },
                    { value: "Postgraduate", label: "Postgraduate" },
                  ]}
                  value={
                    formData.studyLevel
                      ? {
                          value: formData.studyLevel,
                          label: formData.studyLevel,
                        }
                      : null
                  }
                  onChange={(option) =>
                    handleInputChange({
                      target: {
                        name: "studyLevel",
                        value: option?.value || "",
                      },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  placeholder="Select Study Level"
                  disabled={isLoading}
                  isSearchable={false}
                />
                {errors.studyLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.studyLevel}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Course Level<span className="text-brand">*</span>
                </label>
                <Select
                  options={
                    formData.studyLevel
                      ? courseLevelOptions[
                          formData.studyLevel as keyof typeof courseLevelOptions
                        ].map((level) => ({ value: level, label: level }))
                      : []
                  }
                  value={
                    formData.courseLevel
                      ? {
                          value: formData.courseLevel,
                          label: formData.courseLevel,
                        }
                      : null
                  }
                  onChange={(option) =>
                    handleInputChange({
                      target: {
                        name: "courseLevel",
                        value: option?.value || "",
                      },
                    } as React.ChangeEvent<HTMLSelectElement>)
                  }
                  placeholder="Select Course Level"
                  disabled={!formData.studyLevel || isLoading}
                  isSearchable={formData.studyLevel === 'Postgraduate'}
                />
                {errors.courseLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.courseLevel}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Description<span className="text-brand">*</span>
              </label>
              <div className={errors.description ? "border border-red-500 rounded-md" : ""}>
                <RichTextEditor
                  value={formData.description}
                  onChange={handleEditorChange}
                  placeholder="Enter student description"
                  className="min-h-[160px]"
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Image<span className="text-brand">*</span>
              </label>
              {errors.image && (
                <p className="text-red-500 text-sm mb-1">{errors.image}</p>
              )}
              {showFileUploader && (
                <FileUploader
                  acceptType="image"
                  label="Profile Image"
                  onUpload={(files) => {
                    if (files.length > 0) {
                      const file = files[0];
                      console.log("Selected file:", {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                      });
                      setFormData((prev) => ({ ...prev, image: file }));
                      const url = URL.createObjectURL(file);
                      console.log("Created preview URL:", url);
                      setPreviewUrl(url);
                      setShowFileUploader(false);
                    }
                  }}
                  selectedFile={formData.image}
                />
              )}
              {previewUrl && (
                <div>
                  <div className="relative group mt-4">
                    <div className="w-full h-48 overflow-hidden rounded-lg">
                      <StudentImage
                        src={previewUrl}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                        fallbackSrc="/student-avatar.png"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowPreview(true)}
                          className="flex items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="flex items-center gap-1 bg-brand text-white hover:bg-brand-dark"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground mt-2 block">
                    {formData.image?.name ||
                      (previewUrl && previewUrl.split("/").pop()) ||
                      "Profile Picture"}
                  </span>
                </div>
              )}
              {showPreview && previewUrl && (
                <ViewDocumentModal
                  isOpen={true}
                  documentUrl={previewUrl}
                  documentName={formData.image?.name || "Profile Picture"}
                  documentType="Image"
                  onClose={() => setShowPreview(false)}
                />
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(getProfilePath())}
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


