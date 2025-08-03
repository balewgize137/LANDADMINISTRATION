import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandManagement from './LandManagement'
import AdminLayout from '../../components/Admin/AdminLayout'

const AdminPage = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/land" replace />} />
        <Route path="/land" element={<LandManagement />} />
      </Routes>
    </AdminLayout>
  )
}

export default AdminPage
