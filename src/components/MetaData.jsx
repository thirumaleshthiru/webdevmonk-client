import React from 'react';
import { Helmet } from 'react-helmet-async';

function MetaData({ seoData }) {
  return (
    <Helmet>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.meta_description} />
      <link rel="canonical" href={seoData.canonical} />
      
       {seoData.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
      )}
      
       <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.meta_description} />
      <meta property="og:url" content={seoData.canonical} />
       {seoData.structuredData && seoData.structuredData.image && (
        <meta property="og:image" content={seoData.structuredData.image} />
      )}
    </Helmet>
  );
}

export default MetaData;