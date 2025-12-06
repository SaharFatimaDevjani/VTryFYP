
import React from 'react';
const HowAllStartedSection = () => (

    //  <section className="started-section mt-10">
    //   <div className="started-image">
    //     <img
    //       src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg"
    //       alt="Drawing Jewelry"
    //       className="w-full h-64 object-cover rounded-md mb-8"
    //     />
    //   </div>
    //   <div className="started-content flex flex-col md:flex-row gap-10 mt-8">
    //     <div className="started-title flex-1">
    //       <small className="text-gray-600 text-xs uppercase tracking-wide">About us</small>
    //       <h2 className="text-2xl font-semibold mt-2">HOW IT ALL STARTED</h2>
    //     </div>
    //     <div className="started-text flex-2">
    //       <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-3 uppercase tracking-wide">
    //         ETIAM VIVAMUS MATTIS MAURIS, ET TEMPOR URNA LUCTUS NON.
    //       </h4>
    //       <p className="text-sm text-gray-700 mb-4">
    //         Mauris in dolor velit. Suspendisse potenti. Pellentesque habitant morbi
    //         tristique senectus et netus et malesuada fames ac turpis egestas.
    //       </p>
    //       <p className="text-sm text-gray-700 mb-4">
    //         <b className="font-semibold text-gray-900">700+ Established</b><br />
    //         Mauris in dolor velit. Suspendisse potenti. Pellentesque habitant morbi
    //         tristique senectus et netus et malesuada fames ac turpis egestas.
    //       </p>
    //       <p className="text-sm text-gray-700 mb-4">
    //         <b className="font-semibold text-gray-900">700+ Vision International</b><br />
    //         Mauris in dolor velit. Suspendisse potenti. Pellentesque habitant morbi
    //         tristique senectus et netus et malesuada fames ac turpis egestas.
    //       </p>
    //       <p className="text-sm text-gray-700 mb-4">
    //         <b className="font-semibold text-gray-900">700+ Super Potential</b><br />
    //         Mauris in dolor velit. Suspendisse potenti. Pellentesque habitant morbi
    //         tristique senectus et netus et malesuada fames ac turpis egestas.
    //       </p>
    //       <p className="text-sm text-gray-700 mb-4">
    //         <b className="font-semibold text-gray-900">200+ Installations</b><br />
    //         Mauris in dolor velit. Suspendisse potenti. Pellentesque habitant morbi
    //         tristique senectus et netus et malesuada fames ac turpis egestas.
    //       </p>
    //     </div>
    //   </div>
    // </section> 

    <section className="flex flex-col md:flex-row px-8 py-16 max-w-7xl mx-auto gap-16">
        <div className="md:w-1/2">
          <h6 className="text-sm text-gray-500 uppercase mb-2">About us</h6>
          <h2 className="text-4xl font-serif font-semibold mb-4">How it all started</h2>
        </div>
        <div className="md:w-1/2 space-y-6 text-gray-700">
          <p className="text-base">
            Etiam venenatis mattis mauris, et tempor erat ultricies non. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed rhoncus eget enim eget tincidunt. In finibus nisi ex,
            eu interdum urna euismod sit amet.
          </p>
          <div>
            <p className="font-bold">1924 - Established</p>
            <p>
              Curabitur ac tortor ut est porta efficitur non sed ante. Donec vel gravida dolor.
              Donec dictum non elit vel congue.
            </p>
          </div>
          <div>
            <p className="font-bold">1950 - Vivamus Elementum</p>
            <p>
              Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
              Nunc eu erat bibendum mauris accumsan suscipit vitae eu ante.
            </p>
          </div>
          <div>
            <p className="font-bold">1975 - Magnis Parturient</p>
            <p>
              Curabitur scelerisque mi et lectus mattis viverra. Morbi volutpat suscipit dolor. Donec
              vel libero in elit luctus pretium.
            </p>
          </div>
          <div>
            <p className="font-bold">2010 - Interdum Mauris</p>
            <p>
              Magnis dis parturient montes, nascetur ridiculus mus. Nunc eu erat bibendum mauris
              accumsan suscipit vitae eu ante.
            </p>
          </div>
        </div>
      </section>
);

export default HowAllStartedSection;