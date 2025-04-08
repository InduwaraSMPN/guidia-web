import './index.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { Login } from './pages/auth/Login';
import { RegisterAs } from './pages/auth/Register';
import { EmailVerification } from './pages/auth/EmailVerification';
import { RegisterContinue } from './pages/auth/RegisterContinue';
import { RegistrationPending } from './pages/auth/RegistrationPending';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { NewsPage } from './pages/NewsPage';
import { PostNewsPage } from './pages/PostNewsPage';
import { EventsPage } from './pages/EventsPage';
import { PostEventPage } from './pages/PostEventPage';
import { AboutPage } from './pages/AboutPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CounselorsPage } from './pages/CounselorsPage';
import { StudentsPage } from './pages/StudentsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PendingRegistrations } from './pages/registrations/PendingRegistrations';
import { ApprovedRegistrations } from './pages/registrations/ApprovedRegistrations';
import { DeclinedRegistrations } from './pages/registrations/DeclinedRegistrations';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { CounselorProfilePage } from './pages/CounselorProfilePage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';
import { CompanyDetailsPage } from './pages/CompanyDetailsPage';
import { CompanyJobsPage } from './pages/CompanyJobsPage';
import { CompanyApplicationsPage } from './pages/CompanyApplicationsPage';
import { EditCareerPathways } from './pages/profile/EditCareerPathways';
import { EditSpecializations } from './pages/profile/EditSpecializations';
import { EditStudentProfile } from './pages/profile/EditStudentProfile';
import { EditCompanyProfile } from './pages/profile/EditCompanyProfile';
import { EditCounselorProfile } from './pages/profile/EditCounselorProfile';
import { UploadDocument } from './pages/profile/UploadDocument';
import { EditDocuments } from './pages/profile/EditDocuments';
import { JobsPage } from './pages/JobsPage';
import { JobApplication } from './pages/JobApplication';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { EditJobPage } from './pages/EditJobPage';
import { PostJobPage } from './pages/PostJobPage';
import { ChatPage } from './pages/ChatPage';
import { ChatList } from './pages/ChatList';
import { ConversationsList } from './pages/ConversationsList';
import { StudentMessagesPage } from './pages/StudentMessagesPage';
import { CounselorMessagesPage } from './pages/CounselorMessagesPage';
import { CompanyMessagesPage } from './pages/CompanyMessagesPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { FirebaseProvider } from './contexts/FirebaseContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminNewsPage } from './pages/admin/AdminNewsPage';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { Toaster } from './components/ui/sonner';
import { PublicStudentProfile } from './pages/profile/PublicStudentProfile';
import { WelcomeEditStudentProfile } from '@/pages/welcome/WelcomeEditStudentProfile';
import { WelcomeEditCareerPathways } from '@/pages/welcome/WelcomeEditCareerPathways';
import { WelcomeUploadDocument } from '@/pages/welcome/WelcomeUploadDocument';
import { WelcomeEditCounselorProfile } from '@/pages/welcome/WelcomeEditCounselorProfile';
import { WelcomeEditSpecializations } from '@/pages/welcome/WelcomeEditSpecializations';
import { WelcomeEditCompanyProfile } from '@/pages/welcome/WelcomeEditCompanyProfile';
import { PublicCounselorProfile } from './pages/profile/PublicCounselorProfile';
import { EditCounselorLanguages } from '@/pages/profile/EditCounselorLanguages';
import { PublicCompanyProfile } from "@/pages/profile/PublicCompanyProfile";
import { ViewJobApplications } from './pages/ViewJobApplications';
import { NotFoundPage } from './pages/NotFoundPage';
import { MessageRedirect } from './components/MessageRedirect';

function RedirectToProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  if (user.roleId === 1 || user.userID === id) {
    return <Navigate to={`/students/profile/${id}`} replace />;
  }

  return <Navigate to="/" />;
}

function AppContent() {
  const location = useLocation();
  const { isVerifyingToken } = useAuth();

  // Add loading state handler
  if (isVerifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#800020] rounded-full animate-spin" />
      </div>
    );
  }

  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  // Keep the auth page check for navbar logo only display
  const isAuthPage = [
    '/auth/login',
    '/auth/register',
    '/auth/email-verification',
    '/auth/register-continue',
    '/auth/forgot-password',
    '/auth/reset-password',
  ].some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="bottom-right"
        className="!fixed"
        toastOptions={{
          classNames: {
            toast: '!bg-[#800020] !border-none !shadow-lg !text-white',
            title: '!text-white font-medium text-sm',
            description: '!text-white/90 text-sm',
            success: '!bg-[#800020] !text-white',
            error: '!bg-[#800020] !text-white',
            warning: '!bg-[#800020] !text-white',
            actionButton: '!bg-white !text-[#800020] text-sm h-8 px-3 hover:!bg-gray-100 rounded-md',
            cancelButton: '!bg-transparent !text-white hover:!bg-transparent text-sm h-8 px-3'
          }
        }}
      />
      <Navbar logoOnly={isAuthPage} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<RegisterAs />} />
          <Route path="/auth/email-verification" element={<EmailVerification />} />
          <Route path="/auth/register-continue" element={<RegisterContinue />} />
          <Route path="/auth/registration-pending" element={<RegistrationPending />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/reset-password" element={<Navigate to="/auth/login" replace />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/post" element={<PostNewsPage />} />
          <Route path="/news/edit/:id" element={<PostNewsPage />} />
          <Route path="/admin" element={<ProtectedRoute requiredRoleId={1}><AdminDashboard /></ProtectedRoute>}>
            <Route index element={null} />
            <Route path="registrations">
              <Route path="pending" element={<ProtectedRoute requiredRoleId={1}><PendingRegistrations /></ProtectedRoute>} />
              <Route path="approved" element={<ProtectedRoute requiredRoleId={1}><ApprovedRegistrations /></ProtectedRoute>} />
              <Route path="declined" element={<ProtectedRoute requiredRoleId={1}><DeclinedRegistrations /></ProtectedRoute>} />
            </Route>
            <Route path="users">
              <Route path="admins" element={<ProtectedRoute requiredRoleId={1}><AdminUsersPage userType="admin" /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute requiredRoleId={1}><AdminUsersPage userType="student" /></ProtectedRoute>} />
              <Route path="counselors" element={<ProtectedRoute requiredRoleId={1}><AdminUsersPage userType="counselor" /></ProtectedRoute>} />
              <Route path="companies" element={<ProtectedRoute requiredRoleId={1}><AdminUsersPage userType="company" /></ProtectedRoute>} />
            </Route>
            <Route path="news">
              <Route index element={<ProtectedRoute requiredRoleId={1}><AdminNewsPage /></ProtectedRoute>} />
              <Route path="post" element={<ProtectedRoute requiredRoleId={1}><PostNewsPage /></ProtectedRoute>} />
              <Route path="edit/:id" element={<ProtectedRoute requiredRoleId={1}><PostNewsPage /></ProtectedRoute>} />
            </Route>
            <Route path="events">
              <Route index element={<ProtectedRoute requiredRoleId={1}><AdminEventsPage /></ProtectedRoute>} />
              <Route path="post" element={<ProtectedRoute requiredRoleId={1}><PostEventPage /></ProtectedRoute>} />
              <Route path="edit/:id" element={<ProtectedRoute requiredRoleId={1}><PostEventPage /></ProtectedRoute>} />
            </Route>
          </Route>
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/post" element={<PostEventPage />} />
          <Route path="/events/edit/:id" element={<PostEventPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/companies/:id/jobs" element={<CompanyJobsPage />} />
          <Route path="/companies/:id/details" element={<CompanyDetailsPage />} />
          <Route path="/counselors" element={<CounselorsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/post" element={<PostJobPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/jobs/:id/apply" element={<JobApplication />} />
          <Route path="/jobs/:id/edit" element={<EditJobPage />} />
          <Route
            path="/:userType/messages"
            element={
              <ProtectedRoute requiredUserType={["Student", "Company", "Counselor"]}>
                <ConversationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/:userID/messages"
            element={
              <ProtectedRoute requiredUserType="Student">
                <StudentMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/counselor/:userID/messages"
            element={
              <ProtectedRoute requiredUserType="Counselor">
                <CounselorMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/:userID/messages"
            element={
              <ProtectedRoute requiredUserType="Company">
                <CompanyMessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:userType/:userID/messages/:receiverId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          {/* Legacy route format for backward compatibility */}
          <Route
            path="/:userType/messages/:receiverId"
            element={
              <ProtectedRoute>
                <MessageRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/jobs-applications/edit/:userID"
            element={
              <ProtectedRoute requiredUserType="Student">
                <ViewJobApplications />
              </ProtectedRoute>
            }
          />

          {/* Student Profile Routes */}
          <Route path="/students">
            {/* Public view for directory access */}
            <Route path=":userID/details" element={<PublicStudentProfile />} />

            {/* Existing routes */}
            <Route path=":id" element={<RedirectToProfile />} />
            <Route path="profile/:userID" element={
              <ProtectedRoute requiredUserType={["Student", "Admin"]}>
                <StudentProfilePage />
              </ProtectedRoute>
            } />
            <Route path="profile/edit/:userID" element={
              <ProtectedRoute requiredUserType="Student">
                <EditStudentProfile />
              </ProtectedRoute>
            } />
            <Route path="profile/career-pathways/edit/:userID" element={
              <ProtectedRoute requiredUserType="Student">
                <EditCareerPathways />
              </ProtectedRoute>
            } />
            <Route path="profile/documents/:userID" element={
              <ProtectedRoute requiredUserType="Student">
                <EditDocuments />
              </ProtectedRoute>
            } />
            <Route path="profile/documents/edit/:userID" element={
              <ProtectedRoute requiredUserType="Student">
                <EditDocuments />
              </ProtectedRoute>
            } />
            <Route path="profile/documents/upload/:userID" element={
              <ProtectedRoute requiredUserType="Student">
                <UploadDocument />
              </ProtectedRoute>
            } />
          </Route>

          {/* Counselor Routes */}
          <Route path="/counselors">
            {/* Public view for directory access */}
            <Route path=":userID/details" element={<PublicCounselorProfile />} />
          </Route>

          {/* Protected Counselor Routes */}
          <Route path="/counselor">
            <Route path="profile/:userID" element={
              <ProtectedRoute requiredUserType={["Counselor", "Admin"]}>
                <CounselorProfilePage />
              </ProtectedRoute>
            } />
            <Route path="profile/edit/:userID" element={
              <ProtectedRoute requiredUserType={["Counselor", "Admin"]}>
                <EditCounselorProfile />
              </ProtectedRoute>
            } />
            <Route path="profile/specializations/edit/:userID" element={
              <ProtectedRoute requiredUserType="Counselor">
                <EditSpecializations />
              </ProtectedRoute>
            } />
            <Route path="profile/languages/edit/:userID" element={
              <ProtectedRoute requiredUserType="Counselor">
                <EditCounselorLanguages />
              </ProtectedRoute>
            } />
          </Route>

          {/* Company Profile Routes */}
          <Route path="/company">
            {/* Public view for directory access */}
            <Route path=":userID/details" element={<PublicCompanyProfile />} />

            <Route path="profile/:userID" element={
              <ProtectedRoute requiredUserType={["Company", "Admin"]}>
                <CompanyProfilePage />
              </ProtectedRoute>
            } />
            <Route path="profile/edit/:userID" element={
              <ProtectedRoute requiredUserType="Company">
                <EditCompanyProfile />
              </ProtectedRoute>
            } />
            <Route path="profile/jobposts/edit/:userID" element={
              <ProtectedRoute requiredUserType="Company">
                <PostJobPage />
              </ProtectedRoute>
            } />
            <Route path="applications/:companyID" element={
              <ProtectedRoute requiredUserType="Company">
                <CompanyApplicationsPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Welcome flow routes */}
          <Route path="/welcome">
            <Route index element={
              <ProtectedRoute requiredUserType="Student">
                <WelcomeEditStudentProfile />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute requiredUserType="Student">
                <WelcomeEditStudentProfile />
              </ProtectedRoute>
            } />
            <Route path="career" element={
              <ProtectedRoute requiredUserType="Student">
                <WelcomeEditCareerPathways />
              </ProtectedRoute>
            } />
            <Route path="documents" element={
              <ProtectedRoute requiredUserType="Student">
                <WelcomeUploadDocument />
              </ProtectedRoute>
            } />
            <Route path="counselor" element={
              <ProtectedRoute requiredUserType="Counselor">
                <WelcomeEditCounselorProfile />
              </ProtectedRoute>
            } />
            <Route path="specializations" element={
              <ProtectedRoute requiredUserType="Counselor">
                <WelcomeEditSpecializations />
              </ProtectedRoute>
            } />
            <Route path="company" element={
              <ProtectedRoute requiredUserType="Company">
                <WelcomeEditCompanyProfile />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch-all route for 404 pages */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FirebaseProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </FirebaseProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
