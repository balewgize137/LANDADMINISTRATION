import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const TransportPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('routes')
  const [routes, setRoutes] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')

  useEffect(() => {
    fetchTransportData()
  }, [activeTab])

  const fetchTransportData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'routes') {
        try {
          const response = await api.get('/transport/routes')
          setRoutes(response.data.routes || [])
        } catch (error) {
          console.log('Using mock route data')
          // Use mock data if API fails
          setRoutes([])
        }
      } else if (activeTab === 'schedules') {
        // Use mock schedules data since no backend endpoint exists yet
        console.log('Using mock schedule data')
        const mockSchedules = [
          {
            id: 1,
            routeNumber: 'R101',
            departureTime: '07:00',
            arrivalTime: '07:45',
            frequency: '15 minutes',
            stops: ['Central Station', 'University', 'Mall', 'Airport']
          },
          {
            id: 2,
            routeNumber: 'R205',
            departureTime: '06:30',
            arrivalTime: '07:08',
            frequency: '20 minutes',
            stops: ['Downtown', 'Business District', 'Hospital', 'Suburbs']
          }
        ]
        setSchedules(mockSchedules)
      }
    } catch (error) {
      console.error('Error fetching transport data:', error)
      toast.error('Failed to fetch transport information')
    } finally {
      setLoading(false)
    }
  }

  const searchRoutes = () => {
    if (!fromLocation || !toLocation) {
      toast.error('Please enter both from and to locations')
      return
    }
    
    // Simulate route search
    const mockResults = [
      {
        id: 1,
        routeNumber: 'R101',
        from: fromLocation,
        to: toLocation,
        duration: '45 minutes',
        distance: '12.5 km',
        fare: '$2.50',
        frequency: 'Every 15 minutes',
        stops: ['Station A', 'Central Mall', 'University', 'City Center', 'Station B']
      },
      {
        id: 2,
        routeNumber: 'R205',
        from: fromLocation,
        to: toLocation,
        duration: '38 minutes',
        distance: '10.8 km',
        fare: '$2.00',
        frequency: 'Every 20 minutes',
        stops: ['Station A', 'Business District', 'Hospital', 'Station B']
      }
    ]
    
    setRoutes(mockResults)
    toast.success(`Found ${mockResults.length} routes`)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on time':
        return 'bg-green-100 text-green-800'
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'early':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const tabs = [
    {
      id: 'routes',
      label: 'Route Search',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      id: 'schedules',
      label: 'Schedules',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'real-time',
      label: 'Real-time Updates',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'info',
      label: 'Information',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  // Mock data for demonstration
  const realTimeUpdates = [
    {
      id: 1,
      routeNumber: 'R101',
      busNumber: 'BUS-2301',
      currentLocation: 'Central Mall',
      nextStop: 'University',
      estimatedArrival: '3 minutes',
      status: 'On Time',
      capacity: '75%'
    },
    {
      id: 2,
      routeNumber: 'R205',
      busNumber: 'BUS-1456',
      currentLocation: 'Business District',
      nextStop: 'Hospital',
      estimatedArrival: '8 minutes',
      status: 'Delayed',
      capacity: '60%'
    },
    {
      id: 3,
      routeNumber: 'R312',
      busNumber: 'BUS-0987',
      currentLocation: 'Airport Terminal',
      nextStop: 'City Center',
      estimatedArrival: '15 minutes',
      status: 'On Time',
      capacity: '45%'
    }
  ]

  const transportInfo = [
    {
      title: 'Fare Information',
      content: [
        'Standard fare: $2.00 - $3.50 depending on distance',
        'Senior citizens (65+): 50% discount',
        'Students with valid ID: 25% discount',
        'Children under 12: Free with paying adult',
        'Monthly pass: $75.00',
        'Weekly pass: $25.00'
      ],
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
        </svg>
      )
    },
    {
      title: 'Operating Hours',
      content: [
        'Monday - Friday: 5:00 AM - 11:30 PM',
        'Saturday: 6:00 AM - 11:30 PM',
        'Sunday: 7:00 AM - 10:00 PM',
        'Holiday schedules may vary',
        'Night service available on selected routes',
        'Express services during peak hours'
      ],
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Payment Methods',
      content: [
        'Cash (exact change preferred)',
        'Transport card (rechargeable)',
        'Mobile payment apps',
        'Contactless credit/debit cards',
        'Monthly and weekly passes',
        'Online ticket booking available'
      ],
      icon: (
        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      title: 'Accessibility',
      content: [
        'Wheelchair accessible buses on all major routes',
        'Priority seating for elderly and disabled',
        'Audio announcements for visually impaired',
        'Low-floor buses for easy boarding',
        'Assistance available at major stations',
        'Braille route maps at stations'
      ],
      icon: (
        <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Public Transport Information</h1>
          <p className="text-gray-600">Find routes, schedules, and real-time transport information</p>
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
            {/* Route Search Tab */}
            {activeTab === 'routes' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Route Search</h2>
                  <p className="text-gray-600">Find the best routes between locations</p>
                </div>

                {/* Search Form */}
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="form-label">From</label>
                      <input
                        type="text"
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        className="form-input"
                        placeholder="Enter starting location"
                      />
                    </div>
                    <div>
                      <label className="form-label">To</label>
                      <input
                        type="text"
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        className="form-input"
                        placeholder="Enter destination"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={searchRoutes}
                        className="btn-primary w-full"
                      >
                        Search Routes
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="large" />
                  </div>
                ) : routes.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
                    <p className="text-gray-600">Enter your starting location and destination to search for routes.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {routes.map((route) => (
                      <div key={route.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              Route {route.routeNumber}
                            </span>
                            <span className="text-gray-600">{route.from} → {route.to}</span>
                          </div>
                          <span className="text-lg font-semibold text-green-600">{route.fare}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-900">{route.duration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Distance</p>
                            <p className="font-medium text-gray-900">{route.distance}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Frequency</p>
                            <p className="font-medium text-gray-900">{route.frequency}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Stops</p>
                            <p className="font-medium text-gray-900">{route.stops?.length || 0} stops</p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-sm text-gray-500 mb-2">Route Stops:</p>
                          <div className="flex flex-wrap gap-2">
                            {route.stops?.map((stop, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                {stop}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Bus Schedules</h2>
                  <p className="text-gray-600">View detailed schedules for all routes</p>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input max-w-md"
                    placeholder="Search by route number or destination"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="large" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mock schedule data */}
                    {[
                      { route: 'R101', destination: 'City Center', times: ['06:00', '06:20', '06:40', '07:00', '07:20'] },
                      { route: 'R205', destination: 'Airport', times: ['06:15', '06:45', '07:15', '07:45', '08:15'] },
                      { route: 'R312', destination: 'University', times: ['06:30', '07:00', '07:30', '08:00', '08:30'] },
                      { route: 'R456', destination: 'Mall Complex', times: ['06:10', '06:30', '06:50', '07:10', '07:30'] }
                    ].map((schedule, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Route {schedule.route}</h3>
                          <span className="text-sm text-gray-500">To {schedule.destination}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Next departures:</p>
                          <div className="flex flex-wrap gap-2">
                            {schedule.times.map((time, timeIndex) => (
                              <span key={timeIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Real-time Updates Tab */}
            {activeTab === 'real-time' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h2>
                  <p className="text-gray-600">Live tracking of buses and current status</p>
                </div>

                <div className="space-y-4">
                  {realTimeUpdates.map((update) => (
                    <div key={update.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {update.routeNumber}
                          </span>
                          <span className="text-gray-600">{update.busNumber}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(update.status)}`}>
                            {update.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-medium">{update.capacity}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Current Location</p>
                          <p className="font-medium text-gray-900">{update.currentLocation}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Next Stop</p>
                          <p className="font-medium text-gray-900">{update.nextStop}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estimated Arrival</p>
                          <p className="font-medium text-green-600">{update.estimatedArrival}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Information Tab */}
            {activeTab === 'info' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Transport Information</h2>
                  <p className="text-gray-600">Important information about public transport services</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {transportInfo.map((info, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        {info.icon}
                        <h3 className="text-lg font-semibold text-gray-900">{info.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {info.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-gray-600 flex items-start">
                            <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Contact Information */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="font-medium">Call Center</p>
                      <p className="text-sm text-gray-600">+1-800-TRANSPORT</p>
                    </div>
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">info@transport.gov</p>
                    </div>
                    <div className="text-center">
                      <svg className="mx-auto h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium">Service Hours</p>
                      <p className="text-sm text-gray-600">24/7 Support</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransportPage 