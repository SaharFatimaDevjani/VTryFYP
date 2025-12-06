
import React from 'react';
const AboutFounder = () => (
  // <div className="about-page max-w-7xl mx-auto px-5 py-10 font-serif text-gray-900">

  //   {/* About the Founder Section */}
  //   <section className="founder-section flex flex-col md:flex-row items-start gap-10 mb-10">
  //     <div className="founder-text flex-1">
  //       <small className="text-gray-600 text-xs uppercase tracking-wide">Meet the founder</small>
  //       <h2 className="text-2xl font-semibold mt-2">ABOUT THE FOUNDER</h2>
  //       <p className="subtitle text-sm text-gray-600 mt-3 uppercase tracking-wide">
  //         FUSCE EGESTAS SEM URNA, ID PLACERAT VELIT DICTUM EGET. MAURIS IN DOLOR VELIT.
  //       </p>
  //       <p className="mt-4 text-lg text-gray-700">
  //         Praesent fringilla dolor nec mauris euismod, eu rutrum mauris tincidunt. Mauris
  //         tincidunt, sem eu convallis dictum, massa erat cursus enim, nec dictum sem
  //         mauris eu erat. Suspendisse potenti. Pellentesque habitant morbi tristique
  //         senectus et netus et malesuada fames ac turpis egestas.
  //       </p>
  //       <p className="mt-4 text-lg text-gray-700">
  //         Mauris in dolor velit. Suspendisse potenti. Pellentesque habitant morbi
  //         tristique senectus et netus et malesuada fames ac turpis egestas.
  //       </p>
  //     </div>
  //     <div className="founder-image flex-none w-64">
  //       <img
  //         src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
  //         alt="Founder"
  //         className="w-full h-64 object-cover rounded-md"
  //       />
  //     </div>
  //   </section>

  // </div>

  <div className="bg-white">
      {/* Section 1 */}
      <section className="flex flex-col md:flex-row items-center justify-between px-8 py-16 max-w-7xl mx-auto gap-8">
        <div className="md:w-1/2">
          <h6 className="text-sm text-gray-500 uppercase mb-2">Mattis velit eget</h6>
          <h2 className="text-4xl font-serif font-semibold mb-4">About the founder</h2>
          <h5 className="text-lg text-gray-600 mb-6">
            Fusce egestas mi urna, id pulvinar ipsum dictum eget. Mauris in dolor velit.
          </h5>
          <div className="w-16 h-[2px] bg-gray-300 mb-6"></div>
          <p className="text-gray-600 mb-4">
            Sed ut fringilla dolor. Morbi suscipit a nunc eu finibus. Nam rutrum mattis velit eget volutpat. Fusce egestas mi urna, id pulvinar ipsum dictum eget. Mauris in dolor velit. Vestibulum finibus felis non massa commodo molestie at id justo. Quisque sollicitudin elit sit amet facilisis euismod. Fusce at arcu sed.
          </p>
          <p className="text-gray-600">
            Nam rutrum mattis velit eget volutpat. Fusce egestas mi urna, id pulvinar ipsum dictum eget.
          </p>
        </div>
        <div className="md:w-1/2">
          <img
            src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
            alt="Founder"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

    
      {/* Section 3: Sketch Image */}
      <section className="w-full">
        <img
          src="https://websitedemos.net/blingg-jewelry-store-04/wp-content/uploads/sites/1119/2022/08/bg-03.jpg"
          alt="Sketch"
          className="w-full h-auto object-cover"
        />
      </section>

      {/* Section 4: How it all started */}
      
    </div>

);

export default AboutFounder;