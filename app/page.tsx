import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
            Predictive Blood Donation Ecosystem for Optimised Healthcare Resource Management (SDG 3)
          </h1>
          <p className="text-xl text-gray-700">Save Lives, Donate Blood</p>
        </div>

        {/* Eligibility Criteria Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-4">
            Eligibility criteria for potential blood donor
          </h2>
          <p className="text-sm text-gray-500 italic mb-6">
            *All Rights Reserved. The management reserves the right to amend the information.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">1.</span>
              <p className="text-gray-700">Must be a healthy individual aged 18 years and above.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">2.</span>
              <p className="text-gray-700">Not on any medication. (If yes, please inform relevant authorities during identity verification)</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">3.</span>
              <p className="text-gray-700">Not under the influence of alcohol within the last 24 hours.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">4.</span>
              <p className="text-gray-700">The last blood donation was at least 3 months ago.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">5.</span>
              <p className="text-gray-700">For female donors, not in pregnant, last menstrual period was more than 3 days ago, and not breastfeeding.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">6.</span>
              <p className="text-gray-700">Body weight of 45kg and above.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">7.</span>
              <p className="text-gray-700">Had at least 5 hours of sleep the night before.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">8.</span>
              <p className="text-gray-700">Had a meal before blood donation.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-red-600 font-semibold">9.</span>
              <p className="text-gray-700">Not involved in taking intravenous drugs.</p>
            </div>
          </div>

          {/* Documents Section */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Documents to bring (ORIGINAL):
            </h3>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">For Malaysian:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Identification card (MyKad) / Army / Police ID</li>
                <li>Driving license</li>
                <li>Work permit identification with passport number and photo</li>
                <li>Student identification with passport number and photo</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">For Non-Malaysian:</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Passport and has stayed in Malaysia for more than 1 year</li>
                <li>Able to read and understand complete eligibility criteria and online registration form in (English, tentative)</li>
                <li>Work permit identification with passport number and photo</li>
                <li>Student identification with passport number and photo</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Fill online registration form
          </Link>
        </div>
      </main>
    </div>
  );
}
