import React from "react";


export default function MessageUs() {
  return (
    <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-10 py-16 px-8">
        <div className="flex-1 max-w-md">
          <h2 className="text-2xl font-serif mb-4">MESSAGE US</h2>
          <p className="text-gray-600 mb-8 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut id leo tempor, congue justo at, lobortis orci.
          </p>
          <ul className="space-y-4 text-gray-700 text-sm">
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 016 6c0 1.327-.516 2.53-1.354 3.429l-4.6 4.885a.75.75 0 01-1.092 0l-4.6-4.885A6 6 0 0110 4z" />
              </svg>
              123 Fifth Avenue, New York, NY 10160
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 2a4 4 0 014 4v12a4 4 0 01-4 4H8a4 4 0 01-4-4V6a4 4 0 014-4h8zm-1 10a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              contact@info.com
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h2.5a.5.5 0 01.5.5V7a2 2 0 01-2 2H5v5h5v-2.5a.5.5 0 01.5-.5H13a2 2 0 012 2v4.5a.5.5 0 01-.5.5H5a2 2 0 01-2-2V5z" />
              </svg>
              9-334-7565-9787
            </li>
          </ul>
        </div>
        {/* Form section */}
        <form className="bg-[#faf0e9] p-8 rounded-md shadow-sm w-full max-w-md flex flex-col gap-5">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="First name"
              className="w-1/2 flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-1/2 flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          <textarea
            placeholder="Message"
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          <button
            type="submit"
            className="w-32 py-2 text-sm tracking-widest border border-black rounded-md hover:bg-black hover:text-white transition"
          >
            SEND
          </button>
        </form>
      </section>
  );
}
