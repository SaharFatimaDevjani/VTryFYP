import React from "react";

const GOLD = "#E1C16E";
const CHARCOAL = "#111111";

export default function MessageUs() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        {/* Left: Info */}
        <div className="md:col-span-5">
          <p className="text-xs tracking-[0.25em] uppercase text-gray-500">
            Contact
          </p>

          <h2 className="mt-2 text-3xl font-extrabold" style={{ color: CHARCOAL }}>
            Message us
          </h2>

          <div
            className="mt-4 h-[2px] w-20 rounded-full"
            style={{ backgroundColor: GOLD }}
          />

          <p className="mt-5 text-gray-600 leading-relaxed">
            Have a question about products, orders, or virtual try-on? Send us a
            message and we’ll get back to you as soon as possible.
          </p>

          <ul className="mt-8 space-y-4 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{ borderColor: "rgba(225,193,110,0.45)", color: GOLD }}
              >
                {/* Location icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c-3.866 0-7 3.134-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
                </svg>
              </span>
              <div>
                <div className="font-semibold text-gray-900">Address</div>
                <div className="text-gray-600">
                  123 Fifth Avenue, New York, NY 10160
                </div>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{ borderColor: "rgba(225,193,110,0.45)", color: GOLD }}
              >
                {/* Email icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </span>
              <div>
                <div className="font-semibold text-gray-900">Email</div>
                <a
                  href="mailto:contact@info.com"
                  className="text-gray-600 hover:underline"
                  style={{ textDecorationColor: GOLD }}
                >
                  contact@info.com
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span
                className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{ borderColor: "rgba(225,193,110,0.45)", color: GOLD }}
              >
                {/* Phone icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
                </svg>
              </span>
              <div>
                <div className="font-semibold text-gray-900">Phone</div>
                <a
                  href="tel:+1933475659787"
                  className="text-gray-600 hover:underline"
                  style={{ textDecorationColor: GOLD }}
                >
                  +1 933 475 659 787
                </a>
              </div>
            </li>
          </ul>
        </div>

        {/* Right: Form */}
        <div className="md:col-span-7">
          <form
            className="rounded-2xl border bg-white p-8"
            style={{ borderColor: "rgba(17,17,17,0.10)" }}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold" style={{ color: CHARCOAL }}>
                Send a message
              </h3>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full border"
                style={{
                  borderColor: "rgba(225,193,110,0.55)",
                  color: GOLD,
                }}
              >
                We reply fast
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                className="w-full p-3 rounded-xl border outline-none focus:ring-2"
                style={{
                  borderColor: "rgba(17,17,17,0.12)",
                  focusRingColor: GOLD,
                }}
              />
              <input
                type="text"
                placeholder="Last name"
                className="w-full p-3 rounded-xl border outline-none focus:ring-2"
                style={{ borderColor: "rgba(17,17,17,0.12)" }}
              />
            </div>

            <div className="mt-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full p-3 rounded-xl border outline-none focus:ring-2"
                style={{ borderColor: "rgba(17,17,17,0.12)" }}
              />
            </div>

            <div className="mt-4">
              <textarea
                placeholder="Message"
                rows={6}
                className="w-full p-3 rounded-xl border outline-none focus:ring-2 resize-none"
                style={{ borderColor: "rgba(17,17,17,0.12)" }}
              />
            </div>

            <button
              type="submit"
              className="mt-5 w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition"
              style={{
                backgroundColor: GOLD,
                color: CHARCOAL,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Send
            </button>

            <p className="mt-4 text-xs text-gray-500">
              By sending this message, you agree to be contacted back regarding your inquiry.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
