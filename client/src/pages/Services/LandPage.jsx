import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { useNavigate } from 'react-router-dom';

const LandPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('add-new-land')
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const navigate = useNavigate();

  const {
    register: registerForm,
    handleSubmit: handleNewSubmit,
    formState: { errors: newErrors },
    reset: resetNew
  } = useForm()

  const {
    register: transferForm,
    handleSubmit: handleTransferSubmit,
    formState: { errors: transferErrors },
    reset: resetTransfer
  } = useForm()

  const {
    register: permissionForm,
    handleSubmit: handlePermissionSubmit,
    formState: { errors: permissionErrors },
    reset: resetPermission
  } = useForm()

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, JPG, or PNG files only.')
        e.target.value = null
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 5MB.')
        e.target.value = null
        return
      }

      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: file
      }))
    }
  }

  const onAddNewLand = async (data) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      
      if (!uploadedFiles.landTitleDeed || !uploadedFiles.surveyPlan || !uploadedFiles.identificationDocument) {
        toast.error('All required documents must be uploaded')
        return
      }

      Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
        if (file instanceof File) {
          formData.append(fieldName, file)
        }
      })

      formData.append('applicationType', 'Add New Land')
      formData.append('ownerName', data.ownerName)
      formData.append('landLocation', data.location)
      formData.append('landType', data.landType)
      formData.append('submissionDate', new Date().toISOString())

      const response = await api.post('/land/add-new', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Land registration submitted successfully!')
      resetNew()
      setUploadedFiles({})
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onTransferLand = async (data) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      
      if (!uploadedFiles.landTitleDeed || !uploadedFiles.surveyPlan || !uploadedFiles.identificationDocument) {
        toast.error('All required documents must be uploaded')
        return
      }

      Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
        if (file instanceof File) {
          formData.append(fieldName, file)
        }
      })

      formData.append('applicationType', 'Transfer Land')
      formData.append('ownerName', data.ownerName)
      formData.append('landLocation', data.landLocation)
      formData.append('landType', data.landType)

      const response = await api.post('/land/transfer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Land transfer request submitted successfully!')
      resetTransfer()
      setUploadedFiles({})
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onGetPermission = async (data) => {
    try {
      setSubmitting(true)
      const formData = new FormData()
      
      if (!uploadedFiles.landTitleDeed || !uploadedFiles.surveyPlan || !uploadedFiles.identificationDocument || 
          !uploadedFiles.buildingPlan || !uploadedFiles.engineeringReport || !uploadedFiles.environmentalAssessment) {
        toast.error('All required documents must be uploaded')
        return
      }

      Object.entries(uploadedFiles).forEach(([fieldName, file]) => {
        if (file instanceof File) {
          formData.append(fieldName, file)
        }
      })

      formData.append('applicationType', 'Building Permission')
      formData.append('ownerName', data.ownerName)
      formData.append('landLocation', data.landLocation)
      formData.append('landType', data.landType)
      formData.append('buildingPurpose', data.buildingPurpose)
      formData.append('buildingSize', data.buildingSize)
      formData.append('estimatedCost', data.estimatedCost)

      const response = await api.post('/land/permission', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Building permission request submitted successfully!')
      resetPermission()
      setUploadedFiles({})
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = [
    {
      id: 'add-new-land',
      label: 'Add New Land',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      id: 'transfer-land',
      label: 'Transfer Land',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      id: 'building-permission',
      label: 'Building Permission',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ]

  const requiredDocuments = {
    'add-new-land': [
      'Land Title Deed – .pdf, .jpg, .png',
      'Survey Plan – .pdf, .jpg, .png',
      'Identification Document – .pdf, .jpg, .png',
      'Property Tax Receipt – .pdf, .jpg, .png',
      'Land Use Certificate – .pdf, .jpg, .png'
    ],
    'transfer-land': [
      'Seller Identification – .pdf, .jpg, .png',
      'Buyer Identification – .pdf, .jpg, .png',
      'Sales Agreement – .pdf, .jpg, .png',
      'Land Title Deed – .pdf, .jpg, .png',
      'Transfer Tax Receipt – .pdf, .jpg, .png'
    ],
    'building-permission': [
      'Land Title Deed – .pdf, .jpg, .png',
      'Building Plan – .pdf, .jpg, .png',
      'Engineering Report – .pdf, .jpg, .png',
      'Environmental Assessment – .pdf, .jpg, .png',
      'Structural Design Certificate – .pdf, .jpg, .png'
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Land Services</h1>
            <p className="text-gray-600">Manage your land registrations and services</p>
          </div>
          <button
            onClick={() => navigate('/services/land/processes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            My Land Processes
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600">Land management services</p>
              </div>

              {/* Add New Land Tab */}
              {activeTab === 'add-new-land' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Add New Land Registration</h2>
                    <p className="text-gray-600">Submit required documents for new land registration</p>
                  </div>

                  <form onSubmit={handleNewSubmit(onAddNewLand)} className="space-y-6">
                    {/* Land Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Land Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">Land Location</label>
                          <input
                            {...registerForm('location', { required: 'Land location is required' })}
                            type="text"
                            className="form-input"
                            placeholder="e.g. District, City"
                          />
                          {newErrors.location && (
                            <p className="form-error">{newErrors.location.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Land Size (Square Meters)</label>
                          <input
                            {...registerForm('size', { required: 'Land size is required' })}
                            type="number"
                            className="form-input"
                            placeholder="e.g. 1000"
                          />
                          {newErrors.size && (
                            <p className="form-error">{newErrors.size.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Land Type</label>
                          <select
                            {...registerForm('landType', { required: 'Land type is required' })}
                            className="form-select"
                          >
                            <option value="">Select land type</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Agricultural">Agricultural</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Mixed">Mixed Use</option>
                          </select>
                          {newErrors.landType && (
                            <p className="form-error">{newErrors.landType.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Current Use</label>
                          <input
                            {...registerForm('currentUse', { required: 'Current use is required' })}
                            type="text"
                            className="form-input"
                            placeholder="e.g. Vacant, Farm, Building"
                          />
                          {newErrors.currentUse && (
                            <p className="form-error">{newErrors.currentUse.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                      
                      <div className="space-y-4">
                        {/* Land Title Deed */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Land Title Deed
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'landTitleDeed')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.landTitleDeed && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.landTitleDeed.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG (Max size: 5MB)</p>
                        </div>

                        {/* Survey Plan */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Survey Plan
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'surveyPlan')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.surveyPlan && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.surveyPlan.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>

                        {/* Identification Document */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Identification Document
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'identificationDocument')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.identificationDocument && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.identificationDocument.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !uploadedFiles.landTitleDeed || !uploadedFiles.surveyPlan || !uploadedFiles.identificationDocument}
                        className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="small" className="mr-2" />
                            Submitting...
                          </div>
                        ) : (
                          'Submit Registration'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Transfer Land Tab */}
              {activeTab === 'transfer-land' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Land Transfer</h2>
                    <p className="text-gray-600">Transfer land ownership between persons</p>
                  </div>

                  <form onSubmit={handleTransferSubmit(onTransferLand)} className="space-y-6">
                    {/* Land Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Land Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">Owner Name</label>
                          <input
                            {...transferForm('ownerName', { required: 'Owner name is required' })}
                            type="text"
                            className="form-input"
                            placeholder="Enter owner name"
                          />
                          {transferErrors.ownerName && (
                            <p className="form-error">{transferErrors.ownerName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Land Location</label>
                          <input
                            {...transferForm('landLocation', { required: 'Land location is required' })}
                            type="text"
                            className="form-input"
                            placeholder="e.g. District, City"
                          />
                          {transferErrors.landLocation && (
                            <p className="form-error">{transferErrors.landLocation.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Land Type</label>
                          <select
                            {...transferForm('landType', { required: 'Land type is required' })}
                            className="form-select"
                          >
                            <option value="">Select land type</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Agricultural">Agricultural</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Mixed">Mixed Use</option>
                          </select>
                          {transferErrors.landType && (
                            <p className="form-error">{transferErrors.landType.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Required Documents */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                      
                      <div className="space-y-4">
                        {/* Land Title Deed */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Land Title Deed
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'landTitleDeed')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.landTitleDeed && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.landTitleDeed.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG (Max size: 5MB)</p>
                        </div>

                        {/* Survey Plan */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Survey Plan
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'surveyPlan')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.surveyPlan && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.surveyPlan.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>

                        {/* Identification Document */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Identification Document
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'identificationDocument')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.identificationDocument && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.identificationDocument.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !uploadedFiles.landTitleDeed || !uploadedFiles.surveyPlan || !uploadedFiles.identificationDocument}
                        className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="small" className="mr-2" />
                            Submitting...
                          </div>
                        ) : (
                          'Submit Transfer Request'
                        )}
                      </button>
                  </div>
                  </form>
                </div>
              )}

              {/* Building Permission Tab */}
              {activeTab === 'building-permission' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Building Permission</h2>
                    <p className="text-gray-600">Get permission to build on land</p>
                  </div>

                  <form onSubmit={handlePermissionSubmit(onGetPermission)} className="space-y-6">
                    {/* Land Information */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Land Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="form-label">Owner Name</label>
                          <input
                            {...permissionForm('ownerName', { required: 'Owner name is required' })}
                            type="text"
                            className="form-input"
                            placeholder="Enter owner name"
                          />
                          {permissionErrors.ownerName && (
                            <p className="form-error">{permissionErrors.ownerName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Land Location</label>
                          <input
                            {...permissionForm('landLocation', { required: 'Land location is required' })}
                            type="text"
                            className="form-input"
                            placeholder="e.g. District, City"
                          />
                          {permissionErrors.landLocation && (
                            <p className="form-error">{permissionErrors.landLocation.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Land Type</label>
                          <select
                            {...permissionForm('landType', { required: 'Land type is required' })}
                            className="form-select"
                          >
                            <option value="">Select land type</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Agricultural">Agricultural</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Mixed">Mixed Use</option>
                          </select>
                          {permissionErrors.landType && (
                            <p className="form-error">{permissionErrors.landType.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Building Purpose</label>
                          <input
                            {...permissionForm('buildingPurpose', { required: 'Building purpose is required' })}
                            type="text"
                            className="form-input"
                            placeholder="e.g. Residential, Commercial, Office"
                          />
                          {permissionErrors.buildingPurpose && (
                            <p className="form-error">{permissionErrors.buildingPurpose.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Building Size (Square Meters)</label>
                          <input
                            {...permissionForm('buildingSize', { required: 'Building size is required' })}
                            type="text"
                            className="form-input"
                            placeholder="e.g. 200 sqm"
                          />
                          {permissionErrors.buildingSize && (
                            <p className="form-error">{permissionErrors.buildingSize.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">Estimated Cost</label>
                          <input
                            {...permissionForm('estimatedCost', { required: 'Estimated cost is required' })}
                            type="text"
                            className="form-input"
                            placeholder="e.g. $50,000"
                          />
                          {permissionErrors.estimatedCost && (
                            <p className="form-error">{permissionErrors.estimatedCost.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Required Documents */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                      
                      <div className="space-y-4">
                        {/* Land Title Deed */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Land Title Deed
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'landTitleDeed')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.landTitleDeed && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.landTitleDeed.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG (Max size: 5MB)</p>
                        </div>

                        {/* Survey Plan */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Survey Plan
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'surveyPlan')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.surveyPlan && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.surveyPlan.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>

                        {/* Identification Document */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Identification Document
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'identificationDocument')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.identificationDocument && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.identificationDocument.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>

                        {/* Building Plan */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Building Plan
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'buildingPlan')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.buildingPlan && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.buildingPlan.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>

                        {/* Engineering Report */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Engineering Report
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'engineeringReport')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.engineeringReport && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.engineeringReport.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>

                        {/* Environmental Assessment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Environmental Assessment
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileChange(e, 'environmentalAssessment')}
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                            {uploadedFiles.environmentalAssessment && (
                              <span className="text-sm text-green-600">
                                ✓ {uploadedFiles.environmentalAssessment.name}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !uploadedFiles.landTitleDeed || !uploadedFiles.surveyPlan || !uploadedFiles.identificationDocument || 
                                 !uploadedFiles.buildingPlan || !uploadedFiles.engineeringReport || !uploadedFiles.environmentalAssessment}
                        className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <div className="flex items-center">
                            <LoadingSpinner size="small" className="mr-2" />
                            Submitting...
                          </div>
                        ) : (
                          'Submit Permission Request'
                        )}
                      </button>
                  </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandPage 