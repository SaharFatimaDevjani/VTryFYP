import React from "react";


export default function Map() {
  return (
    <div className="w-full h-64">
      <iframe
        title="map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19871.858376484934!2d-0.2221221357869383!3d51.50986585922469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b33310f4d43%3A0x5b98d3b7a255b4bc!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1685120185262!5m2!1sen!2sus"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
