"use client";

import Link from "next/link";

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
            Predictive Blood Donation Ecosystem for Optimised Healthcare Resource Management (SDG 3)
          </h1>
          <p className="text-xl text-gray-700">You're a Hero</p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-8">
          <div className="text-center mb-6">
            <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              YOUR BLOOD IS SAFE TO BE DONATED
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for confirming that you meet all the complete eligibility criteria. Your blood donation can save more lives!
            </p>
          </div>

          {/* Next Steps */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Next Steps:
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">1.</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Complete The Online Registration</h4>
                  <p className="text-gray-600">Fill online registration form.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">2.</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Bring Required Documents</h4>
                  <p className="text-gray-600">Don't forget to bring your original identification documents as listed in the complete eligibility criteria.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">3.</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Visit Our Donation Center</h4>
                  <p className="text-gray-600">Head to your desired blood donation center to verify identity. (face to face, including blood test)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">4.</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Donate Blood</h4>
                  <p className="text-gray-600">The donation process takes about 10-15 minutes. Relax and enjoy refreshments afterwards!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Reminders */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
            <h4 className="font-bold text-yellow-800 mb-2">Important Reminders:</h4>
            <ul className="list-disc list-inside text-yellow-700 space-y-1">
              <li>Ensure you have eaten a meal before donating</li>
              <li>Stay hydrated - drink plenty of water before and after donation</li>
              <li>Get adequate rest the night before</li>
              <li>Inform staff of any medication you're taking</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all duration-300 text-center"
          >
            Back to view complete eligibility criteria
          </Link>
          <button
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-lg px-8 py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            onClick={() => alert("Thank you! Please visit our donation center with your documents.")}
          >
            Fill online registration form
          </button>
        </div>
      </main>
    </div>
  );
}
