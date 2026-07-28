import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ToastHost } from './components/toast'
import { ConfirmHost } from './components/confirm'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import CrudList from './components/CrudList'
import CrudDetail from './components/CrudDetail'
import Notifications from './pages/Notifications'
import Me from './pages/Me'
import ImportBatches from './pages/ImportBatches'
import ImportBatchDetail from './pages/ImportBatchDetail'
import RolePermissions from './pages/RolePermissions'
import UserPermissionDetail from './pages/UserPermissionDetail'
import Settings from './pages/Settings'
import AdvancedSecurity from './pages/AdvancedSecurity'
import CompanyInfo from './pages/CompanyInfo'
import JobPositionList from './pages/JobPositionList'
import JobPositionForm from './pages/JobPositionForm'
import DepartmentForm from './pages/DepartmentForm'
import JobTitleForm from './pages/JobTitleForm'
import SubjectList from './pages/SubjectList'
import SubjectDetail from './pages/SubjectDetail'
import VpnPermissionList from './pages/VpnPermissionList'
import VpnPermissionDetail from './pages/VpnPermissionDetail'
import DocumentList from './pages/DocumentList'
import DocumentSettings from './pages/DocumentSettings'
import DocumentDetail from './pages/DocumentDetail'
import IncomingDocumentForm from './pages/IncomingDocumentForm'
import OutgoingDocumentForm from './pages/OutgoingDocumentForm'
import RegisterBookList from './pages/RegisterBookList'
import RegisterBookForm from './pages/RegisterBookForm'
import NumberingRuleList from './pages/NumberingRuleList'
import NumberingRuleForm from './pages/NumberingRuleForm'

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<Protected><AppLayout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="me" element={<Me />} />
            <Route path="import-batches" element={<ImportBatches />} />
            <Route path="import-batches/:id" element={<ImportBatchDetail />} />
            <Route path="roles" element={<RolePermissions />} />
            <Route path="settings" element={<Settings />} />
            <Route path="advanced-security" element={<AdvancedSecurity />} />
            <Route path="company-info/:id" element={<CompanyInfo />} />
            <Route path="job-positions" element={<JobPositionList />} />
            <Route path="job-positions/new" element={<JobPositionForm />} />
            <Route path="job-positions/:id" element={<JobPositionForm />} />
            <Route path="departments/new" element={<DepartmentForm />} />
            <Route path="departments/:id" element={<DepartmentForm />} />
            <Route path="job-titles/new" element={<JobTitleForm />} />
            <Route path="job-titles/:id" element={<JobTitleForm />} />
            <Route path="subjects" element={<SubjectList />} />
            <Route path="subjects/new" element={<SubjectDetail />} />
            <Route path="subjects/:id" element={<SubjectDetail />} />
            <Route path="vpn" element={<VpnPermissionList />} />
            <Route path="vpn/:id" element={<VpnPermissionDetail />} />
            <Route path="roles/new" element={<UserPermissionDetail />} />
            <Route path="roles/:id" element={<UserPermissionDetail />} />
            
            {/* DMS Generic Routes for missing custom pages */}
            <Route path="documents" element={<DocumentList />} />
            <Route path="documents/:id" element={<DocumentDetail />} />
            <Route path="incoming-documents/new" element={<IncomingDocumentForm />} />
            <Route path="outgoing-documents/new" element={<OutgoingDocumentForm />} />
            <Route path="books" element={<RegisterBookList />} />
            <Route path="books/new" element={<RegisterBookForm />} />
            <Route path="register-books/:id" element={<RegisterBookForm />} />
            
            <Route path="numbering-rules" element={<NumberingRuleList />} />
            <Route path="numbering-rules/add" element={<NumberingRuleForm />} />
            <Route path="numbering-rules/:id" element={<NumberingRuleForm />} />

            <Route path="document-settings" element={<DocumentSettings />} />


            <Route path=":entity" element={<CrudList />} />
            <Route path=":entity/:id" element={<CrudDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastHost />
      <ConfirmHost />
    </AuthProvider>
  )
}
