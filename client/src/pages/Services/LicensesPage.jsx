import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const LicensesPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('new-application')
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [uploadProgress, setUploadProgress] = useState({})

  const {
    register: registerForm,
    handleSubmit: handleNewSubmit,
    formState: { errors: newErrors },
    reset: resetNew,
    watch: watchNew
  } = useForm()

  const {
    register: renewForm,
    handleSubmit: handleRenewSubmit,
    formState: { errors: renewErrors },
    reset: resetRenew
  } = useForm()

  // Fetch user's licenses
  useEffect(() => {
    fetchLicenses()
  }, [])

  const fetchLicenses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/licenses/my-licenses')
      setLicenses(response.data.licenses || [])
    } catch (error) {
      console.error('Error fetching licenses:', error)
      toast.error('Failed to fetch licenses')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file, documentType) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const response = await api.post('/licenses/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(prev => ({
            ...prev,
            [documentType]: percentCompleted
          }))
        },
      })

      setUploadedFiles(prev => ({
        ...prev,
        [documentType]: response.data.filePath
      }))

      toast.success(`${documentType} uploaded successfully`)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error(error.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploadProgress(prev => ({
        ...prev,
        [documentType]: 0
      }))
    }
  }

  const onNewApplication = async (data) => {
    try {
      setSubmitting(true)
      // Restructure data to match backend validation requirements
      const selectedLicenseType = licenseTypes.find(type => type.value === data.licenseType)
      const submissionData = {
        ...data,
        emergencyContact: {
          name: data.emergencyContactName,
          relationship: data.emergencyContactRelationship,
          phone: data.emergencyContactPhone
        },
        medicalInfo: {
          bloodType: data.bloodType,
          medicalConditions: data.medicalConditions || 'None',
          medications: data.medications || 'None'
        },
        licenseClass: selectedLicenseType?.class || 'Class 2',
        documents: uploadedFiles
      }
      // Remove flat emergency contact fields
      delete submissionData.emergencyContactName
      delete submissionData.emergencyContactRelationship
      delete submissionData.emergencyContactPhone
      delete submissionData.bloodType
      delete submissionData.medicalConditions
      delete submissionData.medications
      
      console.log('Submitting license data:', submissionData)
      const response = await api.post('/licenses', submissionData)
      toast.success('License application submitted successfully!')
      resetNew()
      setUploadedFiles({})
      fetchLicenses()
      setActiveTab('my-licenses')
    } catch (error) {
      console.error('License submission error:', error.response?.data)
      toast.error(error.response?.data?.message || 'Application failed')
    } finally {
      setSubmitting(false)
    }
  }

  const onRenewal = async (data) => {
    try {
      setSubmitting(true)
      // Add application type for renewal
      const submissionData = {
        ...data,
        applicationType: 'Renewal',
        documents: uploadedFiles
      }
      console.log('Submitting renewal data:', submissionData)
      const response = await api.post('/licenses', submissionData)
      toast.success('License renewal submitted successfully!')
      resetRenew()
      setUploadedFiles({})
      fetchLicenses()
      setActiveTab('my-licenses')
    } catch (error) {
      console.error('License renewal error:', error.response?.data)
      toast.error(error.response?.data?.message || 'Renewal failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const tabs = [
    {
      id: 'new-application',
      label: 'New Application',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      id: 'renewal',
      label: 'Renewal',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      id: 'my-licenses',
      label: 'My Licenses',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      )
    }
  ]

  const licenseTypes = [
    { value: 'Motorcycle', label: 'Motorcycle License', class: 'Class 1' },
    { value: 'Private', label: 'Private Vehicle License', class: 'Class 2' },
    { value: 'Commercial', label: 'Commercial Vehicle License', class: 'Class 3' },
    { value: 'Public Transport', label: 'Bus/Public Transport License', class: 'Class 4' },
    { value: 'Heavy Vehicle', label: 'Heavy Vehicle License', class: 'Class 5' },
    { value: 'Taxi', label: 'Taxi License', class: 'Class 6' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver's License Services</h1>
          <p className="text-gray-600">Apply for new license, renew existing license, or manage your licenses</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
            {/* New Application Tab */}
            {activeTab === 'new-application' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">New Driver's License Application</h2>
                  <p className="text-gray-600">Apply for a new driver's license</p>
                </div>

                <form onSubmit={handleNewSubmit(onNewApplication)} className="space-y-6">
                  {/* License Type */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">License Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">License Type</label>
                        <select
                          {...registerForm('licenseType', { required: 'License type is required' })}
                          className="form-select"
                        >
                          <option value="">Select license type</option>
                          {licenseTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {newErrors.licenseType && (
                          <p className="form-error">{newErrors.licenseType.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Application Type</label>
                        <select
                          {...registerForm('applicationType', { required: 'Application type is required' })}
                          className="form-select"
                        >
                          <option value="">Select application type</option>
                          <option value="New License">New License</option>
                          <option value="Upgrade">Upgrade License</option>
                          <option value="International">International License</option>
                        </select>
                        {newErrors.applicationType && (
                          <p className="form-error">{newErrors.applicationType.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Full Name</label>
                        <input
                          {...registerForm('fullName', { required: 'Full name is required' })}
                          type="text"
                          className="form-input"
                          defaultValue={`${user?.firstName} ${user?.lastName}`}
                        />
                        {newErrors.fullName && (
                          <p className="form-error">{newErrors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Date of Birth</label>
                        <input
                          {...registerForm('dateOfBirth', {
                            required: 'Date of birth is required',
                            validate: (value) => {
                              const today = new Date()
                              const birthDate = new Date(value)
                              const age = today.getFullYear() - birthDate.getFullYear()
                              return age >= 18 || 'You must be at least 18 years old'
                            }
                          })}
                          type="date"
                          className="form-input"
                          defaultValue={user?.dateOfBirth?.split('T')[0]}
                        />
                        {newErrors.dateOfBirth && (
                          <p className="form-error">{newErrors.dateOfBirth.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">National ID</label>
                        <input
                          {...registerForm('nationalId', { required: 'National ID is required' })}
                          type="text"
                          className="form-input"
                          defaultValue={user?.nationalId}
                        />
                        {newErrors.nationalId && (
                          <p className="form-error">{newErrors.nationalId.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Phone Number</label>
                        <input
                          {...registerForm('phoneNumber', { required: 'Phone number is required' })}
                          type="tel"
                          className="form-input"
                          defaultValue={user?.phone}
                        />
                        {newErrors.phoneNumber && (
                          <p className="form-error">{newErrors.phoneNumber.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Blood Type</label>
                        <select
                          {...registerForm('bloodType', { required: 'Blood type is required' })}
                          className="form-select"
                        >
                          <option value="">Select blood type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                        {newErrors.bloodType && (
                          <p className="form-error">{newErrors.bloodType.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Height (cm)</label>
                        <input
                          {...registerForm('height', {
                            required: 'Height is required',
                            min: { value: 100, message: 'Invalid height' },
                            max: { value: 250, message: 'Invalid height' }
                          })}
                          type="number"
                          className="form-input"
                          placeholder="e.g. 175"
                        />
                        {newErrors.height && (
                          <p className="form-error">{newErrors.height.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="form-label">Address</label>
                        <textarea
                          {...registerForm('address', { required: 'Address is required' })}
                          rows={3}
                          className="form-textarea"
                          defaultValue={user?.address}
                        />
                        {newErrors.address && (
                          <p className="form-error">{newErrors.address.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Contact Name</label>
                        <input
                          {...registerForm('emergencyContactName', { required: 'Emergency contact name is required' })}
                          type="text"
                          className="form-input"
                          placeholder="Full name of emergency contact"
                        />
                        {newErrors.emergencyContactName && (
                          <p className="form-error">{newErrors.emergencyContactName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Contact Phone</label>
                        <input
                          {...registerForm('emergencyContactPhone', { required: 'Emergency contact phone is required' })}
                          type="tel"
                          className="form-input"
                          placeholder="Phone number"
                        />
                        {newErrors.emergencyContactPhone && (
                          <p className="form-error">{newErrors.emergencyContactPhone.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Relationship</label>
                        <select
                          {...registerForm('emergencyContactRelationship', { required: 'Relationship is required' })}
                          className="form-select"
                        >
                          <option value="">Select relationship</option>
                          <option value="Parent">Parent</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Child">Child</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                        {newErrors.emergencyContactRelationship && (
                          <p className="form-error">{newErrors.emergencyContactRelationship.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <input
                          {...registerForm('hasGlasses')}
                          id="hasGlasses"
                          type="checkbox"
                          className="form-checkbox mt-1"
                        />
                        <label htmlFor="hasGlasses" className="ml-2 block text-sm text-gray-900">
                          I wear glasses or contact lenses for driving
                        </label>
                      </div>

                      <div className="flex items-start">
                        <input
                          {...registerForm('hasMedicalConditions')}
                          id="hasMedicalConditions"
                          type="checkbox"
                          className="form-checkbox mt-1"
                        />
                        <label htmlFor="hasMedicalConditions" className="ml-2 block text-sm text-gray-900">
                          I have medical conditions that may affect my driving
                        </label>
                      </div>

                      {watchNew('hasMedicalConditions') && (
                        <div>
                          <label className="form-label">Medical Condition Details</label>
                          <textarea
                            {...registerForm('medicalConditionDetails')}
                            rows={3}
                            className="form-textarea"
                            placeholder="Please describe your medical conditions"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Declaration</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <input
                          {...registerForm('agreeTerms', { required: 'You must agree to the terms' })}
                          id="agreeTerms"
                          type="checkbox"
                          className="form-checkbox mt-1"
                        />
                        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
                          I declare that the information provided is true and complete. I understand that providing false information may result in the rejection of my application or cancellation of my license.
                        </label>
                      </div>
                      {newErrors.agreeTerms && (
                        <p className="form-error">{newErrors.agreeTerms.message}</p>
                      )}

                      <div className="flex items-start">
                        <input
                          {...registerForm('agreeTest', { required: 'You must agree to take the required tests' })}
                          id="agreeTest"
                          type="checkbox"
                          className="form-checkbox mt-1"
                        />
                        <label htmlFor="agreeTest" className="ml-2 block text-sm text-gray-900">
                          I agree to take the required written and practical driving tests as determined by the Ministry of Transport.
                        </label>
                      </div>
                      {newErrors.agreeTest && (
                        <p className="form-error">{newErrors.agreeTest.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="bg-gray-50 p-6 rounded-lg mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">National ID Copy</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'nationalId')}
                          className="form-input"
                        />
                        {uploadProgress.nationalId > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress.nationalId}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.nationalId && (
                          <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Passport Photo</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'passportPhoto')}
                          className="form-input"
                        />
                        {uploadProgress.passportPhoto > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress.passportPhoto}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.passportPhoto && (
                          <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Medical Certificate</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'medicalCertificate')}
                          className="form-input"
                        />
                        {uploadProgress.medicalCertificate > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress.medicalCertificate}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.medicalCertificate && (
                          <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Proof of Address</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'proofOfAddress')}
                          className="form-input"
                        />
                        {uploadProgress.proofOfAddress > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress.proofOfAddress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.proofOfAddress && (
                          <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-8 py-3"
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="small" className="mr-2" />
                          Submitting...
                        </div>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Renewal Tab */}
            {activeTab === 'renewal' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">License Renewal</h2>
                  <p className="text-gray-600">Renew your existing driver's license</p>
                </div>

                <form onSubmit={handleRenewSubmit(onRenewal)} className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">License Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Current License Number</label>
                        <input
                          {...renewForm('licenseNumber', { required: 'License number is required' })}
                          type="text"
                          className="form-input"
                          placeholder="Enter your current license number"
                        />
                        {renewErrors.licenseNumber && (
                          <p className="form-error">{renewErrors.licenseNumber.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">License Type</label>
                        <select
                          {...renewForm('licenseType', { required: 'License type is required' })}
                          className="form-select"
                        >
                          <option value="">Select license type</option>
                          {licenseTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        {renewErrors.licenseType && (
                          <p className="form-error">{renewErrors.licenseType.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Expiry Date</label>
                        <input
                          {...renewForm('expiryDate', { required: 'Expiry date is required' })}
                          type="date"
                          className="form-input"
                        />
                        {renewErrors.expiryDate && (
                          <p className="form-error">{renewErrors.expiryDate.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Current Address</label>
                        <textarea
                          {...renewForm('currentAddress', { required: 'Current address is required' })}
                          rows={3}
                          className="form-textarea"
                          defaultValue={user?.address}
                        />
                        {renewErrors.currentAddress && (
                          <p className="form-error">{renewErrors.currentAddress.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Renewal Reason</label>
                        <select
                          {...renewForm('renewalReason', { required: 'Renewal reason is required' })}
                          className="form-select"
                        >
                          <option value="">Select reason</option>
                          <option value="Normal Renewal">Normal Renewal</option>
                          <option value="Lost License">Lost License</option>
                          <option value="Damaged License">Damaged License</option>
                          <option value="Address Change">Address Change</option>
                          <option value="Name Change">Name Change</option>
                        </select>
                        {renewErrors.renewalReason && (
                          <p className="form-error">{renewErrors.renewalReason.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Contact Phone</label>
                        <input
                          {...renewForm('phoneNumber', { required: 'Phone number is required' })}
                          type="tel"
                          className="form-input"
                          defaultValue={user?.phone}
                        />
                        {renewErrors.phoneNumber && (
                          <p className="form-error">{renewErrors.phoneNumber.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Document Upload Section */}
                  <div className="bg-gray-50 p-6 rounded-lg mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Current License Copy</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'currentLicense')}
                          className="form-input"
                        />
                        {uploadProgress.currentLicense > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress.currentLicense}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.currentLicense && (
                          <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Updated Passport Photo</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'passportPhoto')}
                          className="form-input"
                        />
                        {uploadProgress.passportPhoto > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress.passportPhoto}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.passportPhoto && (
                          <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Medical Certificate</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'medicalCertificate')}
                          className="form-input"
                        />
                        {uploadProgress.medicalCertificate > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress.medicalCertificate}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.medicalCertificate && (
                          <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>
                        )}
                      </div>

                      <div>
                        <label className="form-label">Proof of Address</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e.target.files[0], 'proofOfAddress')}
                          className="form-input"
                        />
                        {uploadProgress.proofOfAddress > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress.proofOfAddress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {uploadedFiles.proofOfAddress && (
                          <p className="text-sm text-green-600 mt-1">✓ Uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-8 py-3"
                    >
                      {submitting ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="small" className="mr-2" />
                          Submitting...
                        </div>
                      ) : (
                        'Submit Renewal'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* My Licenses Tab */}
            {activeTab === 'my-licenses' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">My Licenses</h2>
                  <p className="text-gray-600">View and manage your driver's licenses</p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="large" />
                  </div>
                ) : licenses.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No licenses found</h3>
                    <p className="text-gray-600 mb-4">You haven't applied for any driver's licenses yet.</p>
                    <button
                      onClick={() => setActiveTab('new-application')}
                      className="btn-primary"
                    >
                      Apply for Your First License
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {licenses.map((license) => (
                      <div key={license._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Class {license.licenseType} License
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                            {license.status || 'Pending'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">License Number:</span>
                            <span className="text-gray-900">{license.licenseNumber || 'Pending'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-gray-900">{license.applicationType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Issue Date:</span>
                            <span className="text-gray-900">
                              {license.issueDate ? new Date(license.issueDate).toLocaleDateString() : 'Pending'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Expiry Date:</span>
                            <span className="text-gray-900">
                              {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'Pending'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Applied:</span>
                            <span className="text-gray-900">
                              {new Date(license.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Details
                          </button>
                          {license.status === 'approved' && (
                            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LicensesPage 