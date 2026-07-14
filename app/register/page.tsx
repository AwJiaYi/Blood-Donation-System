 "use client";

import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!submitted ? (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-6 text-center">
              Online Blood Donation Registration Form
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identification Card (MYKAD) / Army / Police ID / Passport:
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Blood donation center name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood donation center name:
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name:
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age (default 18 years and above):
                </label>
                <input
                  type="number"
                  min={18}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender:
                </label>
                <div className="flex flex-wrap gap-3 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="gender" value="Male" required />
                    <span>Male</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="gender" value="Female" />
                    <span>Female</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="gender" value="Others/Specify" />
                    <span>Others / Specify</span>
                  </label>
                </div>
              </div>

              {/* Body weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body weight (default 45kg and above):
                </label>
                <input
                  type="number"
                  min={45}
                  step="0.1"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Blood type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (type) => (
                      <label
                        key={type}
                        className="inline-flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1"
                      >
                        <input type="radio" name="bloodType" value={type} required />
                        <span>{type}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation:
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Tel. No. */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tel. No.:
                </label>
                <input
                  type="tel"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail:
                </label>
                <input
                  type="email"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Marital status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marital status:
                </label>
                <div className="flex flex-wrap gap-3 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="maritalStatus" value="Single" required />
                    <span>Single</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="maritalStatus" value="Couple" />
                    <span>Couple</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="maritalStatus" value="Married" />
                    <span>Married</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="maritalStatus"
                      value="Widowed/Divorced"
                    />
                    <span>Widowed / Divorced</span>
                  </label>
                </div>
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality:
                </label>
                <div className="flex flex-wrap gap-3 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="nationality"
                      value="Malaysian"
                      required
                    />
                    <span>Malaysian</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="nationality" value="Non-Malaysian" />
                    <span>Non-Malaysian</span>
                  </label>
                </div>
              </div>

              {/* Ethnicity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ethnicity:
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Current home address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current home address:
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Postal address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal address:
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <Link
                  href="/"
                  className="text-sm text-gray-600 hover:text-red-600 underline"
                >
                  Back to view complete eligibility criteria
                </Link>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition-colors"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
              Thank you!
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Please visit our donation center with your documents.
            </p>
            <Link
              href="/"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-md shadow-md transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}


