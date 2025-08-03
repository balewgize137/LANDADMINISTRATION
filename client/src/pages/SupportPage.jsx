import React from 'react'

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Support Center</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-blue-800">
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Email:</strong> support@transport.gov</p>
                  <p><strong>Hours:</strong> Mon-Fri 8:00 AM - 6:00 PM</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Emergency Services</h3>
                <div className="space-y-2 text-green-800">
                  <p><strong>Emergency:</strong> 911</p>
                  <p><strong>Traffic Hotline:</strong> +1 (555) 987-6543</p>
                  <p><strong>24/7 Support:</strong> Available</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800">How do I register a new vehicle?</h4>
                  <p className="text-gray-600 mt-1">Visit the Vehicle Registration section and fill out the new registration form with all required documents.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">How long does license renewal take?</h4>
                  <p className="text-gray-600 mt-1">License renewal typically takes 5-7 business days once all documents are submitted and verified.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Can I track my application status?</h4>
                  <p className="text-gray-600 mt-1">Yes, you can view all your application statuses from your dashboard under Recent Activities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportPage 