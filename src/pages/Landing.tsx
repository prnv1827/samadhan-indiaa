import React from 'react';
import { PublicNav } from '../components/PublicNav';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { StatsBanner } from '../components/landing/StatsBanner';
import { LiveChallenges } from '../components/landing/LiveChallenges';
import { UniversityLeaderboard } from '../components/landing/UniversityLeaderboard';
import { RolePortals } from '../components/landing/RolePortals';
import { SiteFooter } from '../components/landing/SiteFooter';

export function Landing() {
  return (
    <div className="w-full bg-canvas">
      <PublicNav />
      <main>
        <Hero />
        <HowItWorks />
        <StatsBanner />
        <LiveChallenges />
        <UniversityLeaderboard />
        <RolePortals />
        <SiteFooter />
      </main>
    </div>);

}