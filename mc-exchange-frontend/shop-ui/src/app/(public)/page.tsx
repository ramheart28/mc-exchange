"use client";
import React, { useEffect, useState } from 'react';
import RegionPage from './[slug]/page';

const REGION_SLUG = "pavia";

export default function HomePage() {


  return (
    <div>
      <RegionPage slug={REGION_SLUG} />
    </div>
    
  );
}